// Service quản lý giỏ hàng cho user đã đăng nhập
import ApiService from "./apiService";

// Interface match với API response
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

// DTO cho update request
export interface UpdateCartItemRequestDto {
  quantity: number;
}

// Public API
export const getUserCart = async (): Promise<UserCart> => {
  console.log('Getting user cart from API...');
  
  try {
    const response = await ApiService.get<UserCart>('ShoppingCart');
    console.log('User cart response:', response);
    return response;
  } catch (error) {
    console.error('Error getting user cart:', error);
    throw error;
  }
};

export const addToUserCart = async (dto: AddToUserCartDto): Promise<UserCart> => {
  console.log('Adding to user cart:', dto);
  
  try {
    const response = await ApiService.post<UserCart>('ShoppingCart', dto);
    console.log('Add to user cart response:', response);
    
    window.dispatchEvent(new CustomEvent('cartChanged'));
    return response;
  } catch (error) {
    console.error('Error adding to user cart:', error);
    throw error;
  }
};

export const updateUserCartItem = async (cartItemId: number, quantity: number): Promise<UserCart> => {
  console.log('Updating user cart item:', { cartItemId, quantity });
  
  try {
    // Validate quantity
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const requestDto: UpdateCartItemRequestDto = { quantity };
    const response = await ApiService.put<UserCart>(`ShoppingCart/items/${cartItemId}`, requestDto);
    console.log('Update user cart response:', response);
    
    window.dispatchEvent(new CustomEvent('cartChanged'));
    return response;
  } catch (error) {
    console.error('Error updating user cart item:', error);
    throw error;
  }
};

export const removeFromUserCart = async (cartItemId: number): Promise<UserCart> => {
  console.log('Removing from user cart:', cartItemId);
  
  try {
    const response = await ApiService.delete<UserCart>(`ShoppingCart/${cartItemId}`);
    console.log('Remove from user cart response:', response);
    
    window.dispatchEvent(new CustomEvent('cartChanged'));
    return response;
  } catch (error) {
    console.error('Error removing from user cart:', error);
    throw error;
  }
};

export const clearUserCart = async (): Promise<UserCart> => {
  console.log('Clearing user cart');
  
  try {
    const response = await ApiService.delete<UserCart>('ShoppingCart');
    console.log('Clear user cart response:', response);
    
    window.dispatchEvent(new CustomEvent('cartChanged'));
    return response;
  } catch (error) {
    console.error('Error clearing user cart:', error);
    throw error;
  }
};

export const transferGuestCartToUser = async (guestCartItems: { productId: number; quantity: number; variantId?: number }[]): Promise<UserCart> => {
  console.log('Transferring guest cart to user:', guestCartItems);
  
  try {
    // Add each guest cart item to user cart
    for (const item of guestCartItems) {
      await addToUserCart(item);
    }
    
    // Return updated cart
    const updatedCart = await getUserCart();
    console.log('Cart after transfer:', updatedCart);
    
    return updatedCart;
  } catch (error) {
    console.error('Error transferring guest cart to user:', error);
    throw error;
  }
};

export default {
  getUserCart,
  addToUserCart,
  updateUserCartItem,
  removeFromUserCart,
  clearUserCart,
  transferGuestCartToUser
};
