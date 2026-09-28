export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
  isTwoDayEligible: boolean;
}

export interface ShippingCalculation {
  zipCode: string;
  methods: ShippingMethod[];
  estimatedDeliveryDates: Record<string, string>;
}

export type ShippingZone = 
  | 'west-coast' 
  | 'southwest' 
  | 'mountain' 
  | 'midwest' 
  | 'east-coast' 
  | 'alaska' 
  | 'hawaii';
