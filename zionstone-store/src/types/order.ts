import type { ShippingMethod } from './shipping';
import type { Address } from './user';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  shippingMethod: ShippingMethod;
  items: OrderItem[];
  shipments: Shipment[];
  stripePaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface Shipment {
  id: string;
  orderId: string;
  status: ShipmentStatus;
  carrier: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED';

export type ShipmentStatus = 
  | 'LABEL_CREATED' 
  | 'PICKED_UP' 
  | 'IN_TRANSIT' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED';
