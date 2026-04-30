import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping } from '@/lib/shipping';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zipCode, shipsInDays } = body;
    
    if (!zipCode || zipCode.length !== 5) {
      return NextResponse.json(
        { success: false, error: 'Valid 5-digit ZIP code required' },
        { status: 400 }
      );
    }
    
    const result = calculateShipping(zipCode, shipsInDays || 2);
    
    return NextResponse.json({
      success: true,
      data: {
        zipCode: result.zipCode,
        methods: result.methods.map(method => ({
          id: method.id,
          name: method.name,
          price: method.price,
          estimatedDays: method.estimatedDays,
          isTwoDayEligible: method.isTwoDayEligible,
        })),
        estimatedDeliveryDates: Object.fromEntries(
          Object.entries(result.estimatedDeliveryDates).map(([key, value]) => [key, value.toISOString()])
        ),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}
