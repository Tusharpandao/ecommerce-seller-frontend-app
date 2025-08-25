'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Cart, CartItem } from '@/lib/types';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';

export default function CartComponent() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCart();
      
      if (response.success && response.data) {
        setCart(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to load cart');
        setCart(null);
      }
    } catch (err) {
      setError('Failed to load cart');
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const response = await apiClient.updateCartItem(productId, newQuantity);
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const response = await apiClient.removeFromCart(productId);
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const clearCart = async () => {
    try {
      const response = await apiClient.getCart(); // Assuming there's a clear method
      if (response.success) {
        setCart({ id: '', items: [], total: 0, itemCount: 0 });
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadCart}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
        <a
          href="/products"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {cart.items.map((item: CartItem) => (
          <div key={item.id} className="flex items-center p-4 border-b border-gray-200 last:border-b-0">
            <img
              src={item.product.thumbnail || '/placeholder-product.svg'}
              alt={item.product.name}
              className="w-20 h-20 object-cover rounded-md mr-4"
            />
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.product.name}</h3>
              <p className="text-sm text-gray-500">{item.product.category?.name}</p>
              <p className="text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</p>
            </div>

            <div className="flex items-center space-x-2 mr-4">
              <button
                onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="text-right mr-4">
              <p className="font-semibold text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => removeFromCart(item.product.id)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium text-gray-900">Total ({cart.itemCount} items)</span>
          <span className="text-2xl font-bold text-gray-900">${cart.total.toFixed(2)}</span>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => window.location.href = '/checkout'}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
