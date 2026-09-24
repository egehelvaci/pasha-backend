import { createHash, randomInt, randomUUID } from 'crypto';
import QR from 'qrcode';
import bwipjs from '@bwip-js/node';
import { OrderStatus, Prisma, PrismaClient } from '../../generated/prisma';
import prisma from '../utils/prisma';
import { UploadService } from '../utils/upload-service';
import { OrderService } from '../order-service';

export class FulfillmentError extends Error {
  constructor(public statusCode: number, public code: string, message: string) { super(message); }
}
export const fulfillmentStatuses = ['CONFIRMED', 'READY', 'SHIPPED', 'DELIVERED'] as const;
export type FulfillmentRequest = {
  requestId: string;
  expectedStatus: OrderStatus;
  targetStatus: typeof fulfillmentStatuses[number];
  reason?: string;
};
const ranks: Partial<Record<OrderStatus, number>> = { PENDING: 0, CONFIRMED: 1, READY: 2, SHIPPED: 3, DELIVERED: 4 };
const include = {
  items: { orderBy: { id: 'asc' as const } },
  qr_codes: { orderBy: { id: 'asc' as const } },
  barcodes: { orderBy: { id: 'asc' as const } }
};
type Snapshot = Prisma.OrderGetPayload<{ include: typeof include }>;
type LabelPlan = {
  item: Snapshot['items'][number];
  qr: Snapshot['qr_codes'][number] | undefined;
  barcode: Snapshot['barcodes'][number] | undefined;
  qrValue: string; barcodeValue: string; qrImage: string; barcodeImage: string;
};
type ImageInput = { value: string; kind: 'qr' | 'barcode'; barcodeType?: string };
type Dependencies = {
  db?: PrismaClient;
  image?: (input: ImageInput) => Promise<string>;
  receipt?: (tx: Prisma.TransactionClient, orderId: string, actorId: string) => Promise<unknown>;
};

function fingerprint(order: Snapshot): string {
  return createHash('sha256').update(JSON.stringify(order)).digest('hex');
}

function ean13(): string {
  const digits = '869' + randomInt(1_000_000_000).toString().padStart(9, '0');
  const sum = [...digits].reduce((total, digit, i) => total + Number(digit) * (i % 2 ? 3 : 1), 0);
  return digits + ((10 - sum % 10) % 10);
}

export async function createFulfillmentImage(input: ImageInput): Promise<string> {
  let buffer: Buffer;
  if (input.kind === 'qr') {
    buffer = await QR.toBuffer(input.value, { type: 'png', width: 300, margin: 1, errorCorrectionLevel: 'H' });
  } else {
    const type = input.barcodeType || 'EAN13';
    if (!['EAN13', 'CODE128'].includes(type)) throw new FulfillmentError(409, 'UNSUPPORTED_BARCODE', 'Barkod tipi desteklenmiyor');
    buffer = await bwipjs.toBuffer({ bcid: type === 'EAN13' ? 'ean13' : 'code128', text: input.value, scale: 3, height: 15, includetext: true });
  }
  // External storage is prepared before opening the database transaction.
  return new UploadService().uploadFile(buffer, 'image/png', `${randomUUID()}.png`, input.kind === 'qr' ? 'qr_codes' : 'barcodes', AbortSignal.timeout(15000));
}

export class OrderFulfillmentService {
  private db: PrismaClient;
  private image: NonNullable<Dependencies['image']>;
  private receipt: NonNullable<Dependencies['receipt']>;
  constructor(dependencies: Dependencies = {}) {
    this.db = dependencies.db || prisma;
    this.image = dependencies.image || createFulfillmentImage;
    this.receipt = dependencies.receipt || (async (tx, orderId, actorId) => {
      const result = await new OrderService().getOrderReceipt(orderId, actorId, true, tx);
      if (!result.success || !result.receipt) throw new FulfillmentError(500, 'RECEIPT_FAILED', 'Sipariş fişi hazırlanamadı');
      return result.receipt;
    });
  }

  private replay(action: { orderId: string; actorId: string; fromStatus: OrderStatus; targetStatus: OrderStatus; reason: string | null; result: Prisma.JsonValue }, orderId: string, actorId: string, input: FulfillmentRequest) {
    if (action.orderId !== orderId || action.actorId !== actorId || action.fromStatus !== input.expectedStatus ||
        action.targetStatus !== input.targetStatus || action.reason !== (input.reason || null)) {
      throw new FulfillmentError(409, 'IDEMPOTENCY_CONFLICT', 'requestId başka bir istek için kullanılmış');
    }
    return { ...(action.result as Prisma.JsonObject), replayed: true };
  }

  private validate(order: Snapshot, input: FulfillmentRequest) {
    if (order.status === 'CANCELED') throw new FulfillmentError(409, 'ORDER_CANCELED', 'İptal edilmiş sipariş ilerletilemez');
    if (order.status !== input.expectedStatus) throw new FulfillmentError(409, 'STATUS_CONFLICT', `Siparişin güncel durumu ${order.status}; listeyi yenileyiniz`);
    if ((ranks[input.targetStatus] ?? -1) < (ranks[order.status] ?? Infinity)) throw new FulfillmentError(409, 'BACKWARD_TRANSITION', 'Sipariş statüsü geriye alınamaz');
    if (!order.items.length || order.items.some(item => item.quantity < 1)) throw new FulfillmentError(409, 'INVALID_ORDER_ITEMS', 'Sipariş kalemleri boş veya miktarları geçersiz');
    // Ambiguous legacy labels must not be deleted or reassigned automatically.
    for (const labels of [order.qr_codes, order.barcodes]) {
      const itemIds = new Set<string>();
      for (const label of labels) {
        const item = order.items.find(item => item.id === label.order_item_id);
        if (!item || itemIds.has(item.id) || (label.product_id && label.product_id !== item.product_id) || (label.scan_count || 0) > item.quantity) {
          throw new FulfillmentError(409, 'LABEL_CONFLICT', 'QR/barkod kalem eşleşmesi veya sayacı tutarsız; önce kayıtları düzeltiniz');
        }
        itemIds.add(item.id);
      }
    }
  }

  async advance(orderId: string, actorId: string, input: FulfillmentRequest) {
    const actor = await this.db.user.findUnique({ where: { userId: actorId }, select: { isActive: true, userType: { select: { name: true } } } });
    if (!actor?.isActive || actor.userType.name !== 'admin') throw new FulfillmentError(403, 'ADMIN_REQUIRED', 'Aktif admin yetkisi gerekli');
    const previousAction = await this.db.orderFulfillmentAction.findUnique({ where: { id: input.requestId } });
    if (previousAction) return this.replay(previousAction, orderId, actorId, input);
    const snapshot = await this.db.order.findUnique({ where: { id: orderId }, include });
    if (!snapshot) throw new FulfillmentError(404, 'ORDER_NOT_FOUND', 'Sipariş bulunamadı');
    this.validate(snapshot, input);
    const planned: LabelPlan[] = [];
    for (const item of snapshot.items) {
      const qr = snapshot.qr_codes.find(label => label.order_item_id === item.id);
      const barcode = snapshot.barcodes.find(label => label.order_item_id === item.id);
      const baseUrl = (process.env.PUBLIC_URL || 'https://pasha-backend-production.up.railway.app').replace(/\/$/, '');
      const qrValue = qr?.qr_code || `${baseUrl}/api/admin/scan-qr?qrCode=PASHA-${randomUUID()}`;
      const barcodeValue = barcode?.barcode || ean13();
      let qrImage: string;
      let barcodeImage: string;
      try {
        qrImage = qr?.qrCodeImageUrl || await this.image({ kind: 'qr', value: qrValue });
        barcodeImage = barcode?.barcode_image_url || await this.image({ kind: 'barcode', value: barcodeValue, barcodeType: barcode?.barcode_type || 'EAN13' });
        if (!qrImage || !barcodeImage) throw new Error('Empty label image');
      } catch (error) {
        if (error instanceof FulfillmentError) throw error;
        throw new FulfillmentError(502, 'LABEL_IMAGE_FAILED', 'QR/barkod görselleri hazırlanamadı; sipariş değiştirilmedi');
      }
      planned.push({ item, qr, barcode, qrValue, barcodeValue, qrImage, barcodeImage });
    }

    try {
      return await this.db.$transaction(async tx => {
        // Serializes this endpoint per order; prepared state is checked again after locking.
        await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`;
        const action = await tx.orderFulfillmentAction.findUnique({ where: { id: input.requestId } });
        if (action) return this.replay(action, orderId, actorId, input);
        // Lock existing label/item rows too so in-flight legacy scans cannot change
        // them between the consistency check and the final completion writes.
        await tx.$queryRaw`SELECT id FROM "OrderItem" WHERE order_id = ${orderId} FOR UPDATE`;
        await tx.$queryRaw`SELECT id FROM "QRCode" WHERE order_id = ${orderId} FOR UPDATE`;
        await tx.$queryRaw`SELECT id FROM "Barcode" WHERE order_id = ${orderId} FOR UPDATE`;
        const current = await tx.order.findUnique({ where: { id: orderId }, include });
        if (!current || fingerprint(current) !== fingerprint(snapshot)) throw new FulfillmentError(409, 'ORDER_CHANGED', 'Sipariş veya etiketler işlem sırasında değişti; güncel verilerle tekrar deneyiniz');
        const now = new Date();
        const prepared = ranks[input.targetStatus]! >= ranks.READY!;
        const delivered = input.targetStatus === 'DELIVERED';
        for (const plan of planned) {
          const qrData = {
            product_id: plan.item.product_id, required_scans: plan.item.quantity,
            qrCodeImageUrl: plan.qrImage,
            ...(prepared ? { first_scan_at: plan.qr?.first_scan_at || now, first_scan_employee_id: plan.qr?.first_scan_employee_id || actorId } : {}),
            ...(delivered ? {
              is_scanned: true, scan_count: plan.item.quantity,
              scanned_at: plan.qr?.scanned_at || now, last_scan_at: plan.qr?.last_scan_at || now,
              second_scan_at: plan.qr?.second_scan_at || now, second_scan_employee_id: plan.qr?.second_scan_employee_id || actorId
            } : {})
          };
          if (plan.qr) await tx.qRCode.update({ where: { id: plan.qr.id }, data: qrData });
          else await tx.qRCode.create({ data: { order_id: orderId, order_item_id: plan.item.id, qr_code: plan.qrValue, ...qrData } });
          const barcodeData = {
            product_id: plan.item.product_id, quantity: plan.item.quantity, required_scans: plan.item.quantity,
            barcode_image_url: plan.barcodeImage,
            ...(delivered ? { is_scanned: true, scan_count: plan.item.quantity, scanned_at: plan.barcode?.scanned_at || now, last_scan_at: plan.barcode?.last_scan_at || now, scanned_by: plan.barcode?.scanned_by || actorId } : {})
          };
          if (plan.barcode) await tx.barcode.update({ where: { id: plan.barcode.id }, data: barcodeData });
          else await tx.barcode.create({ data: { order_id: orderId, order_item_id: plan.item.id, barcode: plan.barcodeValue, barcode_type: 'EAN13', ...barcodeData } });
        }
        if (current.status !== input.targetStatus) await tx.order.update({ where: { id: orderId }, data: { status: input.targetStatus } });
        // Existing employee assignments stay assigned to the actual employee.
        const area = current.items.reduce((total, item) => total.add(new Prisma.Decimal(item.width || 0).mul(item.height || 0).mul(item.quantity).div(10000)), new Prisma.Decimal(0));
        await tx.employeeOrderStats.updateMany({ where: { orderId }, data: {
          orderStatus: input.targetStatus,
          ...(prepared ? { preparedAreaM2: area } : {}),
          ...(delivered ? { deliveredAreaM2: area } : {})
        } });
        const receipt = await this.receipt(tx, orderId, actorId);
        const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, select: {
          id: true, status: true, receipt_printed: true, receipt_printed_at: true,
          qr_codes: true, barcodes: true
        } });
        const result = JSON.parse(JSON.stringify({ order, receipt, requestId: input.requestId, previousStatus: current.status, manualCompletion: true, stockChanged: false, replayed: false })) as Prisma.InputJsonObject;
        await tx.orderFulfillmentAction.create({ data: { id: input.requestId, orderId, actorId, fromStatus: input.expectedStatus, targetStatus: input.targetStatus, reason: input.reason || null, result } });
        return result;
      }, { timeout: 30000, maxWait: 10000 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code)) {
        throw new FulfillmentError(409, 'CONCURRENT_CHANGE', 'Eşzamanlı işlem algılandı; aynı requestId ile tekrar deneyiniz');
      }
      throw error;
    }
  }
}
