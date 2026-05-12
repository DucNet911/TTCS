import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, ProductSKU } from './types';
import { useAuth } from './AuthContext';
import { cartAPI } from './api';

interface CartItemExtended {
  product: Product;
  sku?: ProductSKU;
  quantity: number;
  size?: string;
  color?: string;
  // Dữ liệu từ DB
  cart_item_id?: number;
}

interface CartContextType {
  cart: CartItemExtended[];
  addToCart: (item: CartItemExtended) => void;
  removeFromCart: (productId: number, size?: string, color?: string) => void;
  updateQuantity: (productId: number, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItemExtended[]>([]);
  const [loading, setLoading] = useState(false);

  // Hàm load giỏ hàng từ database
  const loadCartFromDB = useCallback(async () => {
    if (!user || !user.customer_id) {
      setCart([]);
      return;
    }
    setLoading(true);
    try {
      const data = await cartAPI.get(user.customer_id);
      const items: CartItemExtended[] = (data.items || []).map((item: any) => ({
        product: {
          product_id: item.product_id,
          name: item.product_name,
          base_price: item.base_price,
          description: '',
          material: '',
          gender: item.gender,
          category_id: item.category_id,
          primary_image: item.image_url,
        } as Product,
        sku: {
          sku_id: item.sku_id,
          product_id: item.product_id,
          sku_code: item.sku_code,
          price: item.price,
          stock: item.stock,
          size_name: item.size_name,
          color_name: item.color_name,
        } as any,
        quantity: item.quantity,
        size: item.size_name || '',
        color: item.color_name || '',
        cart_item_id: item.cart_item_id,
      }));
      setCart(items);
    } catch (err) {
      console.error('Lỗi load giỏ hàng từ DB:', err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Khi user đăng nhập/đăng xuất → load lại giỏ hàng
  useEffect(() => {
    loadCartFromDB();
  }, [loadCartFromDB]);

  // THÊM vào giỏ hàng
  const addToCart = async (newItem: CartItemExtended) => {
    if (!user || !user.customer_id) {
      // Guest: chỉ lưu in-memory (không lưu DB)
      setCart(prev => {
        const existing = prev.find(item =>
          item.product.product_id === newItem.product.product_id &&
          item.size === newItem.size &&
          item.color === newItem.color
        );
        if (existing) {
          return prev.map(item =>
            item === existing ? { ...item, quantity: item.quantity + newItem.quantity } : item
          );
        }
        return [...prev, newItem];
      });
      return;
    }

    // Đã đăng nhập: gọi API
    try {
      if (!newItem.sku?.sku_id) {
        console.error('Không tìm thấy SKU');
        return;
      }
      await cartAPI.addItem(user.customer_id, newItem.sku.sku_id, newItem.quantity);
      await loadCartFromDB(); // Reload từ DB
    } catch (err) {
      console.error('Lỗi thêm vào giỏ hàng:', err);
    }
  };

  // XÓA khỏi giỏ hàng
  const removeFromCart = async (productId: number, size?: string, color?: string) => {
    if (!user || !user.customer_id) {
      setCart(prev => prev.filter(item =>
        !(item.product.product_id === productId && item.size === size && item.color === color)
      ));
      return;
    }

    try {
      const item = cart.find(i =>
        i.product.product_id === productId && i.size === size && i.color === color
      );
      if (item?.cart_item_id) {
        await cartAPI.removeItem(item.cart_item_id);
        await loadCartFromDB();
      }
    } catch (err) {
      console.error('Lỗi xóa khỏi giỏ hàng:', err);
    }
  };

  // CẬP NHẬT số lượng
  const updateQuantity = async (productId: number, quantity: number, size?: string, color?: string) => {
    if (!user || !user.customer_id) {
      setCart(prev => prev.map(item =>
        (item.product.product_id === productId && item.size === size && item.color === color)
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      ));
      return;
    }

    try {
      const item = cart.find(i =>
        i.product.product_id === productId && i.size === size && i.color === color
      );
      if (item?.cart_item_id) {
        await cartAPI.updateItem(item.cart_item_id, Math.max(1, quantity));
        await loadCartFromDB();
      }
    } catch (err) {
      console.error('Lỗi cập nhật số lượng:', err);
    }
  };

  // XÓA TOÀN BỘ giỏ hàng
  const clearCart = async () => {
    if (!user || !user.customer_id) {
      setCart([]);
      return;
    }

    try {
      await cartAPI.clear(user.customer_id);
      setCart([]);
    } catch (err) {
      console.error('Lỗi xóa giỏ hàng:', err);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const price = item.sku?.price || item.product.base_price;
    return sum + Number(price) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
