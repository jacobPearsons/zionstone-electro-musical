export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  inventory: number;
  categoryId: string;
  brandId?: string;
  images: ProductImage[];
  features: ProductFeature[];
  reviews: Review[];
  shippingInfo?: {
    eligibleForTwoDay: boolean;
    warehouseLocation: string;
    shipsInDays: number;
    estimatedDelivery?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  productId: string;
  position: number;
}

export interface ProductFeature {
  id: string;
  name: string;
  value: string;
  productId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  content?: string;
  userId: string;
  productId: string;
  createdAt: Date;
}
