import type { ShippingMethod } from './shipping';

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  shippingMethod?: ShippingMethod;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  quantity: number;
  price: number;
  lineTotal: number;
}
