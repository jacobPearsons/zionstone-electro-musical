import { NextResponse } from 'next/server';
import { SHIPPING_METHODS } from '@/lib/shipping';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: SHIPPING_METHODS.map(method => ({
      id: method.id,
      name: method.name,
      price: method.price,
      estimatedDays: method.estimatedDays,
      isTwoDayEligible: method.isTwoDayEligible,
    })),
  });
}
