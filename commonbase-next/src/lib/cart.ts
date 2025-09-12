'use client';

const CART_STORAGE_KEY = 'commonbase-cart';

export interface CartItem {
  id: string;
  data: string;
  metadata?: any;
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const exists = cart.find(cartItem => cartItem.id === item.id);
  
  if (!exists) {
    cart.push(item);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }
}

export function removeFromCart(id: string): void {
  const cart = getCart().filter(item => item.id !== id);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
}

export function isInCart(id: string): boolean {
  return getCart().some(item => item.id === id);
}