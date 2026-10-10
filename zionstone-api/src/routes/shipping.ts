import { Router } from 'express';
import express from 'express';
import { SHIPPING_METHODS, calculateShipping } from '../lib/shipping.js';

export const shippingRouter = Router();

shippingRouter.get('/methods', (_request, response) => {
  response.json({
    success: true,
    data: SHIPPING_METHODS.map((method) => ({
      id: method.id,
      name: method.name,
      price: method.price,
      estimatedDays: method.estimatedDays,
      isTwoDayEligible: method.isTwoDayEligible,
    })),
  });
});

shippingRouter.post('/calculate', express.json(), (request, response) => {
  try {
    const body = (request.body ?? {}) as { zipCode?: unknown; shipsInDays?: unknown };
    const zipCode = body.zipCode;
    const shipsInDays = typeof body.shipsInDays === 'number' ? body.shipsInDays : undefined;

    if (typeof zipCode !== 'string' || zipCode.length !== 5) {
      response.status(400).json({ success: false, error: 'Valid 5-digit ZIP code required' });
      return;
    }

    const result = calculateShipping(zipCode, shipsInDays ?? 2);
    response.json({ success: true, data: result });
  } catch {
    response.status(500).json({ success: false, error: 'Failed to calculate shipping' });
  }
});
