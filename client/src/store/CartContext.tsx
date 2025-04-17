import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@shared/schema';
import { CartContextType, CartItem } from '@/lib/types';

// Create context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalAmount: 0
});

// Hook to use cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Calculate total amount
  const totalAmount = items.reduce((total, item) => total + item.total, 0);

  // Add item to cart
  const addItem = (product: Product, quantity: number) => {
    setItems(prevItems => {
      // Check if item already exists
      const existingItemIndex = prevItems.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          total: Number(product.price) * newQuantity
        };
        
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, {
          productId: product.id,
          productName: product.name,
          price: Number(product.price),
          quantity,
          total: Number(product.price) * quantity,
          imageUrl: product.imageUrl
        }];
      }
    });
  };

  // Remove item from cart
  const removeItem = (productId: number) => {
    setItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity,
            total: item.price * quantity
          };
        }
        return item;
      })
    );
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
  };

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalAmount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
