import { Prisma } from '../../generated/prisma';
import prisma from '../utils/prisma';

type DbClient = Prisma.TransactionClient | typeof prisma;

export interface StockSnapshot {
  enabled: boolean;
  width?: number;
  availableAreaM2: number;
  reservedAreaM2: number;
  consumableAreaM2: number;
}

export interface ProductWidthStockSnapshot extends StockSnapshot {
  width: number;
}

export interface StockMovementInput {
  productId: string;
  areaM2: number;
  movementType: string;
  referenceKey?: string;
  orderId?: string;
  orderItemId?: string;
  quantity?: number;
  width?: number;
  height?: number;
  metadata?: Prisma.InputJsonValue;
}

const STOCK_EPSILON = 0.0001;

function roundArea(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

function normalizeWidth(width?: number | null): number {
  const value = Number(width);
  if (!Number.isFinite(value) || value <= 0) throw new Error('Stok işlemi için geçerli bir genişlik gereklidir');
  return Math.round(value * 100) / 100;
}

export function calculateAreaM2(width?: number | null, height?: number | null, quantity = 1): number {
  if (!width || !height || quantity <= 0) return 0;
  return roundArea((Number(width) * Number(height) * quantity) / 10000);
}

/**
 * Width-based stock service. ProductStock keeps the compatibility total while
 * ProductStockWidth is the source of truth for each width defined by the
 * product rule. Fixed and custom heights under the same width share one pool.
 */
class CommonStockService {
  async resolveProductId(productId: string, client: DbClient = prisma): Promise<string> {
    const visited = new Set<string>();
    while (true) {
      if (visited.has(productId)) throw new Error('Ürün yönlendirme döngüsü');
      visited.add(productId);
      const product = await client.product.findUnique({ where: { productId }, select: { canonicalProductId: true } });
      if (!product?.canonicalProductId) return productId;
      productId = product.canonicalProductId;
    }
  }

  async ensureProductStock(productId: string, client: DbClient = prisma) {
    productId = await this.resolveProductId(productId, client);
    return client.productStock.upsert({
      where: { productId },
      update: {},
      create: { productId }
    });
  }

  async getSnapshot(productId: string, client: DbClient = prisma, width?: number): Promise<StockSnapshot> {
    productId = await this.resolveProductId(productId, client);
    const stock = await client.productStock.findUnique({ where: { productId } });
    if (!stock) {
      return {
        enabled: false,
        availableAreaM2: 0,
        reservedAreaM2: 0,
        consumableAreaM2: 0
      };
    }

    const normalizedWidth = width === undefined ? undefined : normalizeWidth(width);
    const widthStock = normalizedWidth === undefined ? null : await client.productStockWidth.findUnique({
      where: { productStockId_width: { productStockId: stock.id, width: normalizedWidth } }
    });
    const balance = normalizedWidth === undefined ? stock : widthStock;
    const availableAreaM2 = Number(balance?.availableAreaM2 || 0);
    const reservedAreaM2 = Number(balance?.reservedAreaM2 || 0);
    return {
      enabled: true,
      ...(normalizedWidth === undefined ? {} : { width: normalizedWidth }),
      availableAreaM2,
      reservedAreaM2,
      consumableAreaM2: roundArea(availableAreaM2 - reservedAreaM2)
    };
  }

  async getWidthSnapshots(productId: string, client: DbClient = prisma): Promise<ProductWidthStockSnapshot[]> {
    productId = await this.resolveProductId(productId, client);
    const stock = await client.productStock.findUnique({ where: { productId }, include: { widthStocks: { orderBy: { width: 'asc' } } } });
    if (!stock) return [];
    return stock.widthStocks.map(row => {
      const availableAreaM2 = Number(row.availableAreaM2);
      const reservedAreaM2 = Number(row.reservedAreaM2);
      return { enabled: true, width: Number(row.width), availableAreaM2, reservedAreaM2, consumableAreaM2: roundArea(availableAreaM2 - reservedAreaM2) };
    });
  }

  async getSnapshots(productIds: string[], client: DbClient = prisma): Promise<Map<string, StockSnapshot>> {
    const uniqueIds = [...new Set(productIds)];
    if (uniqueIds.length === 0) return new Map();

    const resolved = await Promise.all(uniqueIds.map(id => this.resolveProductId(id, client)));
    const rows = await client.productStock.findMany({ where: { productId: { in: resolved } } });
    const byId = new Map(rows.map(row => {
      const availableAreaM2 = Number(row.availableAreaM2 || 0);
      const reservedAreaM2 = Number(row.reservedAreaM2 || 0);
      return [row.productId, {
        enabled: true,
        availableAreaM2,
        reservedAreaM2,
        consumableAreaM2: roundArea(availableAreaM2 - reservedAreaM2)
      } as StockSnapshot];
    }));

    for (const [index, productId] of uniqueIds.entries()) {
      const canonical = byId.get(resolved[index]);
      if (canonical) byId.set(productId, canonical);
      if (!byId.has(productId)) {
        byId.set(productId, {
          enabled: false,
          availableAreaM2: 0,
          reservedAreaM2: 0,
          consumableAreaM2: 0
        });
      }
    }
    return byId;
  }

  /** Add a FIFO lot and increase the product's canonical area. */
  async addStock(input: StockMovementInput, client: DbClient = prisma): Promise<any> {
    if (client === prisma) {
      return prisma.$transaction(tx => this.addStock(input, tx), { maxWait: 15000, timeout: 30000 });
    }
    if (input.areaM2 <= 0) return { enabled: false, areaM2: 0 };
    const width = normalizeWidth(input.width);
    const locked = await this.lockWidthStock(input.productId, width, client, true);
    if (!locked) return { enabled: false, areaM2: 0 };
    const { stock, widthStock } = locked;

    if (input.referenceKey) {
      const existing = await client.productStockMovement.findUnique({
        where: { referenceKey: input.referenceKey }
      });
      if (existing) return { enabled: true, areaM2: Math.abs(Number(existing.areaM2)) };
    }

    const consumed = input.movementType === 'ORDER_RETURN' && input.orderItemId
      ? await client.productStockMovement.findMany({
            where: { productStockId: stock.id, orderItemId: input.orderItemId, movementType: 'ORDER_CONSUMPTION', width },
          orderBy: { createdAt: 'asc' }
        })
      : [];
    const areaM2 = roundArea(consumed.length
      ? -consumed.reduce((sum, movement) => sum + Number(movement.areaM2), 0)
      : input.areaM2);
    const currentAvailableAreaM2 = Number(widthStock.availableAreaM2 || 0);
    // Incoming stock first closes an existing negative balance. Only the
    // surplus becomes a new FIFO lot.
    let lotAreaM2 = roundArea(areaM2 + Math.min(0, currentAvailableAreaM2));
    // Restore the original FIFO lots for returns, after covering any current
    // deficit. Shortage-only consumption has no original lot to restore.
    for (const movement of consumed) {
      if (!movement.lotId || lotAreaM2 <= STOCK_EPSILON) continue;
      const restored = roundArea(Math.min(-Number(movement.areaM2), lotAreaM2));
      const updated = await client.productStockLot.updateMany({ where: { id: movement.lotId, width }, data: { remainingAreaM2: { increment: restored } } });
      if (updated.count) lotAreaM2 = roundArea(lotAreaM2 - restored);
    }
    const lot = lotAreaM2 > STOCK_EPSILON
      ? await client.productStockLot.create({
          data: {
            productStockId: stock.id,
            sourceType: input.movementType,
            sourceReference: input.referenceKey,
            originalAreaM2: lotAreaM2,
            remainingAreaM2: lotAreaM2,
            width
          }
        })
      : null;

    await client.productStock.update({
      where: { id: stock.id },
      data: { availableAreaM2: { increment: areaM2 } }
    });
    await client.productStockWidth.update({ where: { id: widthStock.id }, data: { availableAreaM2: { increment: areaM2 } } });

    await client.productStockMovement.create({
      data: {
        productStockId: stock.id,
        lotId: lot?.id,
        productId: input.productId,
        movementType: input.movementType,
        areaM2,
        referenceKey: input.referenceKey,
        orderId: input.orderId,
        orderItemId: input.orderItemId,
        quantity: input.quantity,
        width,
        height: input.height,
        metadata: input.metadata
      }
    });

    return { enabled: true, areaM2 };
  }

  /**
   * Set canonical area for an opted-in product. Increases create a FIFO lot;
   * decreases consume existing lots, so every change remains auditable.
   */
  async setStockArea(productId: string, width: number, areaM2: number, referenceKey: string, client: DbClient = prisma): Promise<any> {
    if (client === prisma) {
      return prisma.$transaction(tx => this.setStockArea(productId, width, areaM2, referenceKey, tx), { maxWait: 15000, timeout: 30000 });
    }
    width = normalizeWidth(width);
    const locked = await this.lockWidthStock(productId, width, client, true);
    if (!locked) return { enabled: false, availableAreaM2: 0 };

    const target = roundArea(Math.max(0, areaM2));
    const current = Number(locked.widthStock.availableAreaM2 || 0);
    const delta = roundArea(target - current);
    if (Math.abs(delta) <= STOCK_EPSILON) {
      return { enabled: true, availableAreaM2: current };
    }

    if (delta > 0) {
      await this.addStock({
        productId,
        width,
        areaM2: delta,
        movementType: 'ADMIN_ADJUSTMENT',
        referenceKey,
        metadata: { targetAreaM2: target, previousAreaM2: current }
      }, client);
    } else {
      await this.consumeProductArea({
        productId,
        width,
        areaM2: Math.abs(delta),
        movementType: 'ADMIN_ADJUSTMENT',
        referenceKey,
        metadata: { targetAreaM2: target, previousAreaM2: current }
      }, client);
    }
    return { enabled: true, availableAreaM2: target };
  }

  /** Consume area from the oldest remaining lots under a product row lock. */
  async consumeProductArea(input: StockMovementInput, client: DbClient = prisma): Promise<any> {
    if (client === prisma) {
      return prisma.$transaction(tx => this.consumeProductArea(input, tx), { maxWait: 15000, timeout: 30000 });
    }
    const requestedArea = roundArea(input.areaM2);
    if (requestedArea <= 0) return { enabled: false, areaM2: 0 };

    const width = normalizeWidth(input.width);
    const locked = await this.lockWidthStock(input.productId, width, client, true);
    if (!locked) return { enabled: false, areaM2: 0 };
    const { stock, widthStock } = locked;

    const referencePrefix = input.referenceKey ? `${input.referenceKey}:lot:` : undefined;
    if (referencePrefix) {
      const existing = await client.productStockMovement.findFirst({
        where: { OR: [
          { referenceKey: { startsWith: referencePrefix } },
          { referenceKey: `${input.referenceKey}:shortage` }
        ] }
      });
      if (existing) return { enabled: true, areaM2: requestedArea, idempotent: true };
    }

    // Orders are allowed to consume beyond available stock. The canonical
    // balance may therefore become negative and remains auditable.

    const lots = await client.productStockLot.findMany({
      where: { productStockId: stock.id, width, remainingAreaM2: { gt: 0 } },
      orderBy: [{ receivedAt: 'asc' }, { createdAt: 'asc' }]
    });

    let remaining = requestedArea;
    for (const lot of lots) {
      if (remaining <= STOCK_EPSILON) break;
      const lotRemaining = Number(lot.remainingAreaM2 || 0);
      const consumed = roundArea(Math.min(lotRemaining, remaining));
      if (consumed <= 0) continue;

      await client.productStockLot.update({
        where: { id: lot.id },
        data: { remainingAreaM2: { decrement: consumed } }
      });
      await client.productStockMovement.create({
        data: {
          productStockId: stock.id,
          lotId: lot.id,
          productId: input.productId,
          movementType: input.movementType,
          areaM2: -consumed,
          referenceKey: input.referenceKey ? `${input.referenceKey}:lot:${lot.id}` : undefined,
          orderId: input.orderId,
          orderItemId: input.orderItemId,
          quantity: input.quantity,
          width,
          height: input.height,
          metadata: input.metadata
        }
      });
      remaining = roundArea(remaining - consumed);
    }

    if (remaining > STOCK_EPSILON) {
      await client.productStockMovement.create({
        data: {
          productStockId: stock.id,
          productId: input.productId,
          movementType: input.movementType,
          areaM2: -remaining,
          referenceKey: input.referenceKey ? `${input.referenceKey}:shortage` : undefined,
          orderId: input.orderId,
          orderItemId: input.orderItemId,
          quantity: input.quantity,
          width,
          height: input.height,
          metadata: {
            ...(input.metadata && typeof input.metadata === 'object' ? input.metadata : {}),
            negativeStockAreaM2: remaining
          } as Prisma.InputJsonValue
        }
      });
    }

    await client.productStock.update({
      where: { id: stock.id },
      data: { availableAreaM2: { decrement: requestedArea } }
    });
    await client.productStockWidth.update({ where: { id: widthStock.id }, data: { availableAreaM2: { decrement: requestedArea } } });
    return { enabled: true, areaM2: requestedArea };
  }

  async consumeOrder(orderId: string, client: DbClient = prisma): Promise<any> {
    if (client === prisma) return prisma.$transaction(tx => this.consumeOrder(orderId, tx));
    const tx = client;
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (!order) throw new Error('Sipariş bulunamadı');

      const results = [] as Array<{ itemId: string; enabled: boolean; areaM2: number }>;
      for (const item of order.items) {
        const areaM2 = calculateAreaM2(Number(item.width), Number(item.height), item.quantity);
        const result = await this.consumeProductArea({
          productId: item.product_id,
          areaM2,
          movementType: 'ORDER_CONSUMPTION',
          referenceKey: `order:${orderId}:item:${item.id}`,
          orderId,
          orderItemId: item.id,
          quantity: item.quantity,
          width: Number(item.width || 0),
          height: Number(item.height || 0),
          metadata: { hasFringe: item.has_fringe, cutType: item.cut_type }
        }, tx);
        if (!result.enabled) throw new Error(`Ürün için geçerli ortak stok kaydı veya ölçü bulunamadı: ${item.product_id}`);
        results.push({ itemId: item.id, enabled: result.enabled, areaM2 });
      }
      return { success: true, results };
  }

  async restoreOrder(orderId: string, client: DbClient = prisma) {
    const run = async (tx: DbClient) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (!order) throw new Error('Sipariş bulunamadı');
      const results = [] as Array<{ itemId: string; enabled: boolean; areaM2: number }>;

      for (const item of order.items) {
        const areaM2 = calculateAreaM2(Number(item.width), Number(item.height), item.quantity);
        if (areaM2 <= 0) {
          results.push({ itemId: item.id, enabled: false, areaM2: 0 });
          continue;
        }

        const snapshot = await this.getSnapshot(item.product_id, tx, Number(item.width));
        if (!snapshot.enabled) {
          results.push({ itemId: item.id, enabled: false, areaM2 });
          continue;
        }

        const referenceKey = `order:${orderId}:item:${item.id}:return`;
        const existing = await tx.productStockMovement.findUnique({ where: { referenceKey } });
        if (existing) {
          results.push({ itemId: item.id, enabled: true, areaM2, idempotent: true } as any);
          continue;
        }

        await this.addStock({
          productId: item.product_id,
          areaM2,
          movementType: 'ORDER_RETURN',
          referenceKey,
          orderId,
          orderItemId: item.id,
          quantity: item.quantity,
          width: Number(item.width || 0),
          height: Number(item.height || 0),
          metadata: { hasFringe: item.has_fringe, cutType: item.cut_type }
        }, tx);
        results.push({ itemId: item.id, enabled: true, areaM2 });
      }
      return { success: true, results };
    };

    if (client === prisma) return prisma.$transaction(tx => run(tx));
    return run(client);
  }

  async reserve(productId: string, width: number, areaM2: number, referenceKey: string, options?: { cartId?: number; orderId?: string; expiresAt?: Date }, client: DbClient = prisma): Promise<any> {
    if (client === prisma) return prisma.$transaction(tx => this.reserve(productId, width, areaM2, referenceKey, options, tx), { maxWait: 15000, timeout: 30000 });
    width = normalizeWidth(width);
    const locked = await this.lockWidthStock(productId, width, client, false);
    if (!locked) return { enabled: false, reservedAreaM2: 0 };
    const { stock, widthStock } = locked;
    const existing = await client.productStockReservation.findUnique({ where: { referenceKey } });
    if (existing) return { enabled: true, reservedAreaM2: existing.status === 'ACTIVE' ? Number(existing.areaM2) : 0 };

    const requested = roundArea(areaM2);
    if (!Number.isFinite(requested) || requested <= 0) throw new Error('Rezervasyon alanı pozitif olmalıdır');

    await client.productStockReservation.create({
      data: {
        productStockId: stock.id,
        cartId: options?.cartId,
        orderId: options?.orderId,
        areaM2: requested,
        width,
        referenceKey,
        expiresAt: options?.expiresAt
      }
    });
    await client.productStock.update({ where: { id: stock.id }, data: { reservedAreaM2: { increment: requested } } });
    await client.productStockWidth.update({ where: { id: widthStock.id }, data: { reservedAreaM2: { increment: requested } } });
    return { enabled: true, reservedAreaM2: requested };
  }

  async releaseReservation(referenceKey: string, client: DbClient = prisma): Promise<any> {
    if (client === prisma) return prisma.$transaction(tx => this.releaseReservation(referenceKey, tx), { maxWait: 15000, timeout: 30000 });
    const reservation = await client.productStockReservation.findUnique({ where: { referenceKey } });
    if (!reservation || reservation.status !== 'ACTIVE') return { released: false };
    await client.$queryRaw`SELECT id FROM product_stocks WHERE id = ${reservation.productStockId} FOR UPDATE`;
    if (reservation.width === null) throw new Error('Rezervasyon genişliği bulunamadı');
    const width = Number(reservation.width);
    await client.$queryRaw`SELECT id FROM product_stock_widths WHERE product_stock_id = ${reservation.productStockId} AND width = ${width} FOR UPDATE`;
    const current = await client.productStockReservation.findUnique({ where: { id: reservation.id } });
    if (!current || current.status !== 'ACTIVE') return { released: false };
    const released = await client.productStockReservation.updateMany({ where: { id: reservation.id, status: 'ACTIVE' }, data: { status: 'RELEASED' } });
    if (!released.count) return { released: false };
    await client.productStock.update({ where: { id: current.productStockId }, data: { reservedAreaM2: { decrement: current.areaM2 } } });
    await client.productStockWidth.update({ where: { productStockId_width: { productStockId: current.productStockId, width } }, data: { reservedAreaM2: { decrement: current.areaM2 } } });
    return { released: true, areaM2: Number(current.areaM2) };
  }

  private async lockWidthStock(productId: string, width: number, client: DbClient, createIfMissing: boolean) {
    // Keep the alias mapping stable until this stock transaction commits.
    await client.$queryRaw`SELECT product_id FROM "Product" WHERE product_id = ${productId} FOR SHARE`;
    productId = await this.resolveProductId(productId, client);
    let stock = await client.productStock.findUnique({ where: { productId } });
    if (!stock && createIfMissing) {
      stock = await client.productStock.create({ data: { productId } });
    }
    if (!stock) return null;

    // PostgreSQL row lock serializes stock reads/updates across concurrent orders.
    await client.$queryRaw`SELECT id FROM "product_stocks" WHERE id = ${stock.id} FOR UPDATE`;
    stock = await client.productStock.findUnique({ where: { id: stock.id } });
    if (!stock) return null;
    let widthStock = await client.productStockWidth.findUnique({ where: { productStockId_width: { productStockId: stock.id, width } } });
    if (!widthStock && createIfMissing) {
      const configured = await client.productsizeoptions.findFirst({
        where: { productrules: { Product: { some: { productId } } }, width: Math.round(width) }
      });
      if (!configured || Number(configured.width) !== width) throw new Error(`${width} cm genişlik ürün kuralında tanımlı değil`);
      widthStock = await client.productStockWidth.create({ data: { productStockId: stock.id, width } });
    }
    if (!widthStock) return null;
    await client.$queryRaw`SELECT id FROM product_stock_widths WHERE id = ${widthStock.id} FOR UPDATE`;
    widthStock = await client.productStockWidth.findUnique({ where: { id: widthStock.id } });
    return widthStock ? { stock, widthStock } : null;
  }
}

export const commonStockService = new CommonStockService();
