import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from './types';
import { useAuth } from './AuthContext';
import { wishlistAPI } from './api';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: Product) => void;
  loading: boolean;
}

// Map lưu product_id → wishlist_item_id (để biết item nào cần xóa)
let wishlistItemMap: Record<number, number> = {};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Hàm load danh sách yêu thích từ database
  const loadWishlistFromDB = useCallback(async () => {
    if (!user || !user.customer_id) {
      setWishlist([]);
      wishlistItemMap = {};
      return;
    }
    setLoading(true);
    try {
      const data = await wishlistAPI.get(user.customer_id);
      const items: Product[] = (data.items || []).map((item: any) => {
        // Lưu mapping để khi xóa biết wishlist_item_id
        wishlistItemMap[item.product_id] = item.wishlist_item_id;
        return {
          product_id: item.product_id,
          name: item.product_name,
          base_price: item.base_price,
          description: '',
          material: item.material || '',
          gender: item.gender,
          category_id: item.category_id,
          brand_id: item.brand_id,
          brand_name: item.brand_name,
          primary_image: item.image_url,
        } as Product;
      });
      setWishlist(items);
    } catch (err) {
      console.error('Lỗi load wishlist từ DB:', err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Khi user đăng nhập/đăng xuất → load lại
  useEffect(() => {
    loadWishlistFromDB();
  }, [loadWishlistFromDB]);

  // THÊM vào danh sách yêu thích
  const addToWishlist = async (product: Product) => {
    if (!user || !user.customer_id) {
      // Guest: chỉ lưu in-memory
      setWishlist(prev => {
        if (prev.find(item => item.product_id === product.product_id)) return prev;
        return [...prev, product];
      });
      return;
    }

    try {
      await wishlistAPI.addItem(user.customer_id, product.product_id);
      await loadWishlistFromDB();
    } catch (err: any) {
      // 409 = đã có trong wishlist → bỏ qua
      if (err?.message?.includes('409')) return;
      console.error('Lỗi thêm vào wishlist:', err);
    }
  };

  // XÓA khỏi danh sách yêu thích
  const removeFromWishlist = async (productId: number) => {
    if (!user || !user.customer_id) {
      setWishlist(prev => prev.filter(item => item.product_id !== productId));
      return;
    }

    try {
      const itemId = wishlistItemMap[productId];
      if (itemId) {
        await wishlistAPI.removeItem(itemId);
        delete wishlistItemMap[productId];
        await loadWishlistFromDB();
      }
    } catch (err) {
      console.error('Lỗi xóa khỏi wishlist:', err);
    }
  };

  // Kiểm tra sản phẩm có trong wishlist không
  const isInWishlist = (productId: number) => {
    return wishlist.some(item => item.product_id === productId);
  };

  // Toggle (thêm/xóa)
  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.product_id)) {
      removeFromWishlist(product.product_id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
