import { Request, Response } from 'express';
import { OrderStatus } from '../../generated/prisma';
import { FulfillmentError, fulfillmentStatuses, OrderFulfillmentService } from '../services/order-fulfillment-service';

export function createAdvanceOrderHandler(service = new OrderFulfillmentService()) {
  return async (req: Request, res: Response) => {
    const body = req.body;
    const allowed = ['requestId', 'expectedStatus', 'targetStatus', 'reason'];
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !allowed.includes(key)) ||
        typeof body.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId) ||
        !Object.values(OrderStatus).includes(body.expectedStatus) || !fulfillmentStatuses.includes(body.targetStatus) ||
        (body.reason !== undefined && (typeof body.reason !== 'string' || body.reason.length > 500))) {
      return res.status(400).json({ success: false, code: 'INVALID_REQUEST', message: 'Geçerli requestId (UUID), expectedStatus ve targetStatus gereklidir; reason en fazla 500 karakter olabilir' });
    }
    if (!req.user || req.user.userType !== 'admin') return res.status(403).json({ success: false, message: 'Admin yetkisi gerekli' });
    try {
      const data = await service.advance(req.params.orderId, req.user.userId, body);
      return res.json({ success: true, data });
    } catch (error) {
      if (error instanceof FulfillmentError) return res.status(error.statusCode).json({ success: false, code: error.code, message: error.message });
      console.error('Order fulfillment failed:', error);
      return res.status(500).json({ success: false, message: 'Sipariş ilerletilemedi; aynı requestId ile yeniden deneyebilirsiniz' });
    }
  };
}

export const advanceOrder = createAdvanceOrderHandler();
