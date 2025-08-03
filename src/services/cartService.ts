// Main Cart Service - Router giữa Guest và User cart services
import AuthService from "./authService";
import GuestCartService, { GuestCart } from "./guestCartService";
import type { Product } from "../interfaces/Product";
import UserCartService, { UserCart, AddToUserCartDto } from "./userCartService";
// Union type cho cart response
export type CartResponse = GuestCart | UserCart;

// Utility function
const isUserLoggedIn = (): boolean => {
  return AuthService.isLoggedIn();
};

// Main API - tự động route đến service phù hợp
export const getCart = async (): Promise<CartResponse> => {
  console.log('getCart() called, isLoggedIn:', isUserLoggedIn());
  
  if (isUserLoggedIn()) {
    return await UserCartService.getUserCart();
  } else {
    return GuestCartService.getGuestCart();
  }
};

export const addToCart = async (product: Product, quantity: number = 1, variantId?: number): Promise<CartResponse> => {
  console.log('addToCart() called with:', { productId: product.productId, quantity, variantId });
  
  if (isUserLoggedIn()) {
    const dto: AddToUserCartDto = {
      productId: product.productId,
      quantity,
      variantId
    };
    return await UserCartService.addToUserCart(dto);
  } else {
    return GuestCartService.addToGuestCart(product, quantity, variantId);
  }
};

export const updateCartItem = async (itemId: string | number, quantity: number): Promise<CartResponse> => {
  console.log('updateCartItem() called with:', { itemId, quantity });
  
  if (isUserLoggedIn()) {
    return await UserCartService.updateUserCartItem(itemId as number, quantity);
  } else {
    return GuestCartService.updateGuestCartItem(itemId as string, quantity);
  }
};

export const removeFromCart = async (itemId: string | number): Promise<CartResponse> => {
  console.log('removeFromCart() called with:', itemId);
  
  if (isUserLoggedIn()) {
    return await UserCartService.removeFromUserCart(itemId as number);
  } else {
    return GuestCartService.removeFromGuestCart(itemId as string);
  }
};

export const clearCart = async (): Promise<CartResponse> => {
  console.log('clearCart() called');
  
  if (isUserLoggedIn()) {
    return await UserCartService.clearUserCart();
  } else {
    return GuestCartService.clearGuestCart();
  }
};

// Transfer guest cart to user cart after login
export const transferGuestCartAfterLogin = async (): Promise<UserCart> => {
  console.log('transferGuestCartAfterLogin() called');
  
  try {
    // Get guest cart items for transfer
    const guestCartItems = GuestCartService.getGuestCartForTransfer();
    console.log('Guest cart items to transfer:', guestCartItems);
    
    if (guestCartItems.length > 0) {
      // Transfer to user cart
      const result = await UserCartService.transferGuestCartToUser(guestCartItems);
      
      // Clear guest cart after successful transfer
      GuestCartService.clearGuestCart();
      console.log('Guest cart cleared after transfer');
      
      return result;
    } else {
      // No items to transfer, just return current user cart
      return await UserCartService.getUserCart();
    }
  } catch (error) {
    console.error('Error transferring guest cart after login:', error);
    throw error;
  }
};

// Helper functions for components
export const getCartItemCount = async (): Promise<number> => {
  try {
    const cart = await getCart();
    return cart.totalItems || 0;
  } catch (error) {
    console.error('Error getting cart item count:', error);
    return 0;
  }
};

export const getCartTotal = async (): Promise<number> => {
  try {
    const cart = await getCart();
    return cart.totalAmount || 0;
  } catch (error) {
    console.error('Error getting cart total:', error);
    return 0;
  }
};

// Type guards
export const isGuestCart = (cart: CartResponse): cart is GuestCart => {
  return 'id' in (cart.items[0] || {});
};

export const isUserCart = (cart: CartResponse): cart is UserCart => {
  return 'cartId' in cart;
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  transferGuestCartAfterLogin,
  getCartItemCount,
  getCartTotal,
  isGuestCart,
  isUserCart
};

// Backward compatibility exports
export const removeCartItem = removeFromCart;
export const mergeCartAfterLogin = transferGuestCartAfterLogin;