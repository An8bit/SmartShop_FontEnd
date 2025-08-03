import { Product } from './Product';

export interface CartItem {
  cartItemId: number;
  productId: number;
  quantity: number;
  variant?: {
    variantId: number;
    color: string;
    size: string;
  };
  product?: Product;
  price?: number;
}

export interface Cart {
  items: CartItem[];
  totalQuantity?: number;
  totalPrice?: number;
}

export interface AddToCartDto {
  productId: number;
  quantity: number;
  variantId?: number;
}

export interface CartApiResponse {
  items: {
    cartItemId: number;
    productId: number;
    quantity: number;
    variant?: {
      variantId: number;
      color: string;
      size: string;
    };
  }[];
  totalItems: number;
  totalAmount: number;
}
export interface UserCartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  productImage: string;
  productVariantId?: number;
  variantInfo?: {
    color: string;
    size: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
}

export interface UserCart {
  cartId: number;
  sessionId?: string;
  userId?: number;
  items: UserCartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToUserCartDto {
  productId: number;
  quantity: number;
  variantId?: number;
}