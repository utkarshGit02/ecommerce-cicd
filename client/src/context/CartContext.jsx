import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart,    setCart]    = useState({ items: [], total: '0.00' });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch {
      setCart({ items: [], total: '0.00' });
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (product_id, quantity = 1) => {
    await api.post('/cart', { product_id, quantity });
    fetchCart();
  };

  const updateItem = async (id, quantity) => {
    await api.put(`/cart/${id}`, { quantity });
    fetchCart();
  };

  const removeItem = async (id) => {
    await api.delete(`/cart/${id}`);
    fetchCart();
  };

  const clearCart = async () => {
    await api.delete('/cart/clear');
    setCart({ items: [], total: '0.00' });
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
