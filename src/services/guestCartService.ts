// Service quản lý giỏ hàng cho khách chưa đăng nhập
import type { Product } from "../interfaces/Product";

// Guest Cart Interface - đơn giản cho localStorage
export interface GuestCartItem {
  id: string; // temporary id for guest
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantId?: number;
  addedAt: string;
}

export interface GuestCart {
  items: GuestCartItem[];
  totalAmount: number;
  totalItems: number;
}

// Constants
const GUEST_CART_KEY = 'guest_cart';

// Private functions
const getStoredGuestCart = (): GuestCart => {
  const cartData = localStorage.getItem(GUEST_CART_KEY);
  if (!cartData) {
    return { items: [], totalAmount: 0, totalItems: 0 };
  }
  
  try {
    return JSON.parse(cartData);
  } catch {
    return { items: [], totalAmount: 0, totalItems: 0 };
  }
};

const saveGuestCart = (cart: GuestCart): void => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

const calculateCartTotals = (items: GuestCartItem[]): { totalAmount: number; totalItems: number } => {
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  return { totalAmount, totalItems };
};

// Public API
export const getGuestCart = (): GuestCart => {
  const cart = getStoredGuestCart();
  console.log('Guest cart retrieved:', cart);
  return cart;
};

export const addToGuestCart = (product: Product, quantity: number = 1, variantId?: number): GuestCart => {
  console.log('Adding to guest cart:', { productId: product.productId, quantity, variantId });
  
  const cart = getStoredGuestCart();
  const existingItemIndex = cart.items.findIndex(item => 
    item.productId === product.productId && item.variantId === variantId
  );

  if (existingItemIndex >= 0) {
    // Update existing item
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].totalPrice = cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].unitPrice;
  } else {
    // Add new item
    const newItem: GuestCartItem = {
      id: `guest_${Date.now()}_${Math.random()}`,
      productId: product.productId,
      productName: product.name,
      productImage: product.imageUrl || "https://via.placeholder.com/150",
      quantity,
      unitPrice: product.price,
      totalPrice: quantity * product.price,
      variantId,
      addedAt: new Date().toISOString()
    };
    cart.items.push(newItem);
  }

  // Recalculate totals
  const totals = calculateCartTotals(cart.items);
  cart.totalAmount = totals.totalAmount;
  cart.totalItems = totals.totalItems;

  saveGuestCart(cart);
  window.dispatchEvent(new CustomEvent('cartChanged'));
  
  console.log('Guest cart updated:', cart);
  return cart;
};

export const updateGuestCartItem = (itemId: string, quantity: number): GuestCart => {
  console.log('Updating guest cart item:', { itemId, quantity });
  
  const cart = getStoredGuestCart();
  const itemIndex = cart.items.findIndex(item => item.id === itemId);
  
  if (itemIndex >= 0) {
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].totalPrice = quantity * cart.items[itemIndex].unitPrice;
    }
    
    // Recalculate totals
    const totals = calculateCartTotals(cart.items);
    cart.totalAmount = totals.totalAmount;
    cart.totalItems = totals.totalItems;
    
    saveGuestCart(cart);
    window.dispatchEvent(new CustomEvent('cartChanged'));
  }
  
  console.log('Guest cart after update:', cart);
  return cart;
};

export const removeFromGuestCart = (itemId: string): GuestCart => {
  console.log('Removing from guest cart:', itemId);
  
  const cart = getStoredGuestCart();
  cart.items = cart.items.filter(item => item.id !== itemId);
  
  // Recalculate totals
  const totals = calculateCartTotals(cart.items);
  cart.totalAmount = totals.totalAmount;
  cart.totalItems = totals.totalItems;
  
  saveGuestCart(cart);
  window.dispatchEvent(new CustomEvent('cartChanged'));
  
  console.log('Guest cart after removal:', cart);
  return cart;
};

export const clearGuestCart = (): GuestCart => {
  console.log('Clearing guest cart');
  
  const emptyCart: GuestCart = { items: [], totalAmount: 0, totalItems: 0 };
  localStorage.removeItem(GUEST_CART_KEY);
  window.dispatchEvent(new CustomEvent('cartChanged'));
  
  return emptyCart;
};

export const getGuestCartForTransfer = (): { productId: number; quantity: number; variantId?: number }[] => {
  const cart = getStoredGuestCart();
  return cart.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    variantId: item.variantId
  }));
};

export default {
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  getGuestCartForTransfer
};
