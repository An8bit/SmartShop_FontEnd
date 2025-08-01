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
  cartItems: {
    cartItemId: number;
    productId: number;
    quantity: number;
    variant?: {
      variantId: number;
      color: string;
      size: string;
    };
    product?: Product;
  }[];
  totalQuantity: number;
  totalPrice: number;
}
