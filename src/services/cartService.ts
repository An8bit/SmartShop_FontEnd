// Đạo Hữu: Service quản lý giỏ hàng, đồng bộ khi login/logout, dùng ApiService và interface chuẩn

import ApiService from "./apiService";
import type { Product } from "../interfaces/Product";
import type { Cart, CartItem, AddToCartDto, CartApiResponse } from "../interfaces/Cart";

// Constants
const GUEST_CART_KEY = 'guest_cart';

// Utility functions
const isUserLoggedIn = (): boolean => {
  return !!localStorage.getItem('user');
};

// Guest cart functions
const getGuestCart = (): Cart => {
  const guestCartRaw = localStorage.getItem(GUEST_CART_KEY);
  if (!guestCartRaw) {
    return { items: [] };
  }
  try {
    return JSON.parse(guestCartRaw);
  } catch {
    return { items: [] };
  }
};

const saveGuestCart = (cart: Cart): void => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

const clearGuestCart = (): void => {
  localStorage.removeItem(GUEST_CART_KEY);
};

// Main cart functions
export const getCart = async (): Promise<Cart> => {
  console.log('getCart() called');
  console.log('isUserLoggedIn:', isUserLoggedIn());

  if (isUserLoggedIn()) {
    try {
      console.log('Getting cart from API...');
      const response = await ApiService.get<CartApiResponse>('/Cart');
      console.log('API cart response:', response);
      
      return {
        items: response.cartItems?.map(item => ({
          cartItemId: item.cartItemId,
          productId: item.productId,
          quantity: item.quantity,
          variant: item.variant,
          product: item.product,
          price: item.product?.price || 0
        })) || [],
        totalQuantity: response.totalQuantity || 0,
        totalPrice: response.totalPrice || 0
      };
    } catch (error) {
      console.error('Error getting cart from API, fallback to guest cart:', error);
      return getGuestCart();
    }
  } else {
    console.log('User not logged in, returning guest cart');
    return getGuestCart();
  }
};

export const addToCart = async (dto: AddToCartDto): Promise<Cart> => {
  console.log('addToCart() called with:', dto);
  
  if (isUserLoggedIn()) {
    try {
      console.log('Adding to user cart via API...');
      const response = await ApiService.post<CartApiResponse>('/Cart', dto);
      console.log('Add to cart API response:', response);
      
      // Dispatch cart changed event
      window.dispatchEvent(new CustomEvent('cartChanged'));
      
      return {
        items: response.cartItems?.map(item => ({
          cartItemId: item.cartItemId,
          productId: item.productId,
          quantity: item.quantity,
          variant: item.variant,
          product: item.product,
          price: item.product?.price || 0
        })) || [],
        totalQuantity: response.totalQuantity || 0,
        totalPrice: response.totalPrice || 0
      };
    } catch (error) {
      console.error('Error adding to cart via API:', error);
      throw error;
    }
  } else {
    console.log('Adding to guest cart...');
    // For guest, we need to find the product first
    // This is a simplified version - in real app you'd fetch product details
    const guestCart = getGuestCart();
    const existingItemIndex = guestCart.items.findIndex(item => 
      item.productId === dto.productId && 
      item.variant?.variantId === dto.variantId
    );

    if (existingItemIndex >= 0) {
      guestCart.items[existingItemIndex].quantity += dto.quantity;
    } else {
      const newItem: CartItem = {
        cartItemId: Date.now(),
        productId: dto.productId,
        quantity: dto.quantity,
        variant: dto.variantId ? { variantId: dto.variantId, color: '', size: '' } : undefined,
        price: 0 // Will be updated when product info is available
      };
      guestCart.items.push(newItem);
    }

    saveGuestCart(guestCart);
    window.dispatchEvent(new CustomEvent('cartChanged'));
    return guestCart;
  }
};

export const updateCartItem = async (cartItemId: number, quantity: number): Promise<Cart> => {
  if (isUserLoggedIn()) {
    try {
      const response = await ApiService.put<CartApiResponse>(`/Cart/${cartItemId}`, { quantity });
      
      window.dispatchEvent(new CustomEvent('cartChanged'));
      
      return {
        items: response.cartItems?.map(item => ({
          cartItemId: item.cartItemId,
          productId: item.productId,
          quantity: item.quantity,
          variant: item.variant,
          product: item.product,
          price: item.product?.price || 0
        })) || [],
        totalQuantity: response.totalQuantity || 0,
        totalPrice: response.totalPrice || 0
      };
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  } else {
    const guestCart = getGuestCart();
    const itemIndex = guestCart.items.findIndex(item => item.cartItemId === cartItemId);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        guestCart.items.splice(itemIndex, 1);
      } else {
        guestCart.items[itemIndex].quantity = quantity;
      }
      
      saveGuestCart(guestCart);
      window.dispatchEvent(new CustomEvent('cartChanged'));
    }
    
    return guestCart;
  }
};

export const removeFromCart = async (cartItemId: number): Promise<Cart> => {
  if (isUserLoggedIn()) {
    try {
      const response = await ApiService.delete<CartApiResponse>(`/Cart/${cartItemId}`);
      
      window.dispatchEvent(new CustomEvent('cartChanged'));
      
      return {
        items: response.cartItems?.map(item => ({
          cartItemId: item.cartItemId,
          productId: item.productId,
          quantity: item.quantity,
          variant: item.variant,
          product: item.product,
          price: item.product?.price || 0
        })) || [],
        totalQuantity: response.totalQuantity || 0,
        totalPrice: response.totalPrice || 0
      };
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  } else {
    const guestCart = getGuestCart();
    guestCart.items = guestCart.items.filter(item => item.cartItemId !== cartItemId);
    
    saveGuestCart(guestCart);
    window.dispatchEvent(new CustomEvent('cartChanged'));
    return guestCart;
  }
};

export const clearCart = async (): Promise<Cart> => {
  if (isUserLoggedIn()) {
    try {
      await ApiService.delete('/Cart');
      window.dispatchEvent(new CustomEvent('cartChanged'));
      return { items: [] };
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  } else {
    clearGuestCart();
    window.dispatchEvent(new CustomEvent('cartChanged'));
    return { items: [] };
  }
};

export const mergeCartAfterLogin = async (): Promise<Cart> => {
  console.log('mergeCartAfterLogin() called');
  
  try {
    const guestCart = getGuestCart();
    console.log('Guest cart before merge:', guestCart);
    
    if (guestCart.items.length > 0) {
      console.log('Merging guest cart items...');
      
      // Add each guest cart item to server cart
      for (const item of guestCart.items) {
        try {
          await addToCart({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variant?.variantId
          });
        } catch (error) {
          console.error('Error merging cart item:', error);
        }
      }
      
      // Clear guest cart after successful merge
      clearGuestCart();
      console.log('Guest cart cleared after merge');
    }
    
    // Get updated cart from server
    const updatedCart = await getCart();
    console.log('Cart after merge:', updatedCart);
    
    return updatedCart;
  } catch (error) {
    console.error('Error merging cart after login:', error);
    throw error;
  }
};

// Simple guest cart functions for backward compatibility
export const addToGuestCart = (product: Product, quantity: number = 1): Cart => {
  const guestCart = getGuestCart();
  const existingItemIndex = guestCart.items.findIndex(item => item.productId === product.productId);

  if (existingItemIndex >= 0) {
    guestCart.items[existingItemIndex].quantity += quantity;
  } else {
    const newItem: CartItem = {
      cartItemId: Date.now() + Math.random(),
      productId: product.productId,
      product: product,
      quantity: quantity,
      price: product.price
    };
    guestCart.items.push(newItem);
  }

  saveGuestCart(guestCart);
  window.dispatchEvent(new CustomEvent('cartChanged'));
  return guestCart;
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCartAfterLogin,
  addToGuestCart
};

// Also export removeCartItem as alias for backward compatibility
export const removeCartItem = removeFromCart;