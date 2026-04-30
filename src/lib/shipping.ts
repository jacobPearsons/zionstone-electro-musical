import type { ShippingMethod, ShippingZone, ShippingCalculation } from '@/types/shipping';

const ZONE_MAP: Record<string, ShippingZone> = {
  '00': 'west-coast',
  '01': 'west-coast',
  '02': 'west-coast',
  '03': 'west-coast',
  '04': 'west-coast',
  '05': 'west-coast',
  '06': 'west-coast',
  '07': 'west-coast',
  '08': 'west-coast',
  '09': 'west-coast',
  '10': 'east-coast',
  '11': 'east-coast',
  '12': 'east-coast',
  '13': 'southwest',
  '14': 'hawaii',
  '15': 'hawaii',
  '16': 'midwest',
  '17': 'midwest',
  '18': 'midwest',
  '19': 'midwest',
  '20': 'mountain',
  '21': 'mountain',
  '22': 'mountain',
  '23': 'mountain',
  '24': 'east-coast',
  '25': 'east-coast',
  '26': 'east-coast',
  '27': 'east-coast',
  '28': 'southwest',
  '29': 'southwest',
  '30': 'southwest',
  '31': 'southwest',
  '32': 'southwest',
  '33': 'southwest',
  '34': 'southwest',
  '35': 'southwest',
  '36': 'midwest',
  '37': 'midwest',
  '38': 'midwest',
  '39': 'midwest',
  '40': 'midwest',
  '41': 'midwest',
  '42': 'midwest',
  '43': 'midwest',
  '44': 'east-coast',
  '45': 'east-coast',
  '46': 'east-coast',
  '47': 'east-coast',
  '48': 'midwest',
  '49': 'west-coast',
  '50': 'midwest',
  '51': 'midwest',
  '52': 'midwest',
  '53': 'midwest',
  '54': 'midwest',
  '55': 'midwest',
  '56': 'west-coast',
  '57': 'east-coast',
  '58': 'east-coast',
  '59': 'east-coast',
  '60': 'midwest',
  '61': 'midwest',
  '62': 'midwest',
  '63': 'southwest',
  '64': 'southwest',
  '65': 'midwest',
  '66': 'southwest',
  '67': 'southwest',
  '68': 'southwest',
  '69': 'east-coast',
  '70': 'southwest',
  '71': 'southwest',
  '72': 'southwest',
  '73': 'southwest',
  '74': 'mountain',
  '75': 'midwest',
  '76': 'mountain',
  '77': 'southwest',
  '78': 'southwest',
  '79': 'mountain',
  '80': 'mountain',
  '81': 'mountain',
  '82': 'mountain',
  '83': 'mountain',
  '84': 'mountain',
  '85': 'southwest',
  '86': 'southwest',
  '87': 'southwest',
  '88': 'southwest',
  '89': 'mountain',
  '90': 'west-coast',
  '91': 'west-coast',
  '92': 'west-coast',
  '93': 'west-coast',
  '94': 'west-coast',
  '95': 'west-coast',
  '96': 'west-coast',
  '97': 'west-coast',
  '98': 'west-coast',
  '99': 'west-coast',
};

const TWO_DAY_ELIGIBLE_ZONES: ShippingZone[] = ['west-coast', 'southwest', 'mountain', 'midwest'];

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'std',
    name: 'Standard Shipping',
    price: 5.99,
    estimatedDays: 5,
    isTwoDayEligible: false,
  },
  {
    id: 'exp',
    name: 'Express Shipping',
    price: 12.99,
    estimatedDays: 2,
    isTwoDayEligible: true,
  },
  {
    id: 'overn',
    name: 'Overnight Shipping',
    price: 24.99,
    estimatedDays: 1,
    isTwoDayEligible: true,
  },
];

export function getZoneFromZipCode(zipCode: string): ShippingZone {
  const prefix = zipCode.substring(0, 2);
  return ZONE_MAP[prefix] || 'midwest';
}

export function isTwoDayShippingEligible(zipCode: string): boolean {
  const zone = getZoneFromZipCode(zipCode);
  return TWO_DAY_ELIGIBLE_ZONES.includes(zone);
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }
  
  return result;
}

export function calculateDeliveryDate(
  shipsInDays: number,
  estimatedDays: number,
  fromZipCode?: string
): Date {
  const today = new Date();
  const cutoffHour = 14;
  
  let shipDate = new Date(today);
  if (today.getHours() < cutoffHour) {
    shipDate.setDate(shipDate.getDate() + shipsInDays);
  } else {
    shipDate.setDate(shipDate.getDate() + shipsInDays + 1);
  }
  
  while (shipDate.getDay() === 0 || shipDate.getDay() === 6) {
    shipDate.setDate(shipDate.getDate() + 1);
  }
  
  return addBusinessDays(shipDate, estimatedDays);
}

export function calculateShipping(
  zipCode: string,
  shipsInDays: number = 2
): ShippingCalculation {
  const isEligible = isTwoDayShippingEligible(zipCode);
  
  const methods = SHIPPING_METHODS.map(method => ({
    ...method,
    isTwoDayEligible: isEligible && method.isTwoDayEligible,
  }));
  
  const estimatedDeliveryDates: Record<string, Date> = {};
  
  for (const method of methods) {
    estimatedDeliveryDates[method.id] = calculateDeliveryDate(shipsInDays, method.estimatedDays);
  }
  
  return {
    zipCode,
    methods,
    estimatedDeliveryDates,
  };
}

export function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function getShippingBadgeText(shipsInDays: number, isTwoDayEligible: boolean): string {
  if (isTwoDayEligible && shipsInDays <= 2) {
    return 'Ships in 2 Days';
  }
  return `Ships in ${shipsInDays} Days`;
}
