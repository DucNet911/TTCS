import React from 'react';
import { useWishlist } from '../WishlistContext';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <Heart size={64} className="text-gray-200 mb-6" />
        <h2 className="text-[18px] font-black uppercase mb-4 tracking-tighter">Danh sách yêu thích trống</h2>
        <p className="text-gray-500 text-sm font-medium mb-8">Hãy thêm những sản phẩm bạn yêu thích vào đây.</p>
        <Link to="/" className="bg-brand-dark text-white px-10 py-4 uppercase text-xs font-black tracking-[0.2em] hover:bg-gray-800 transition-all">
          Khám phá ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-10 py-20">
      <div className="flex items-end justify-between mb-12 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-[30px] font-black uppercase tracking-tighter mb-2">Yêu thích</h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            {wishlist.length} sản phẩm trong danh sách
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-12">
        <AnimatePresence mode="popLayout">
          {wishlist.map((product) => {
            const productImage = product.primary_image;
            
            return (
              <motion.div 
                key={product.product_id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group flex flex-col h-full"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                  <Link to={`/product/${product.product_id}`}>
                    {productImage ? (
                      <img 
                        src={productImage} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-light flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">No Image</span>
                      </div>
                    )}
                  </Link>
                  <button 
                    onClick={() => removeFromWishlist(product.product_id)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:text-red-500 transition-colors z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <Link to={`/product/${product.product_id}`} className="flex-1">
                      <h3 className="text-[13px] font-black uppercase tracking-tight leading-tight group-hover:underline underline-offset-4">
                        {product.name}
                      </h3>
                    </Link>
                    <span className="text-[13px] font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.base_price)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                    {product.gender === 'men' ? 'Nam' : product.gender === 'women' ? 'Nữ' : 'Unisex'}
                  </p>
                </div>

                <div className="mt-4">
                  <Link 
                    to={`/product/${product.product_id}`}
                    className="w-full bg-brand-dark text-white py-3 flex items-center justify-center gap-2 uppercase text-[10px] font-black tracking-widest hover:bg-gray-800 transition-all"
                  >
                    <ShoppingCart size={14} />
                    Xem chi tiết
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
