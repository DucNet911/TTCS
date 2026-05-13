import React from 'react';
import { X, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-xl flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-widest">Giỏ hàng</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Giỏ hàng trống</p>
                  <button 
                    onClick={onClose}
                    className="bg-brand-dark text-white px-10 py-4 uppercase text-xs font-black tracking-[0.2em] hover:bg-gray-800 transition-colors"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => {
                  const productImage = item.product.primary_image || item.product.images?.[0]?.image_url;
                  const skuPrice = item.sku?.price || item.product.base_price;
                  const stock = item.sku?.stock || 999;
                  
                  return (
                    <div key={`${item.product.product_id}-${idx}`} className="flex gap-4">
                      <div className="w-24 h-30 bg-brand-light shrink-0 rounded-sm overflow-hidden">
                        {productImage ? (
                          <img 
                            src={productImage} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-300">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-[13px] font-black uppercase leading-tight max-w-[180px]">{item.product.name}</h3>
                            <span className="text-[13px] font-bold">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(skuPrice)}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {item.size ? `${item.size}` : ''}{item.size && item.color ? ' • ' : ''}{item.color || ''}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center bg-brand-light rounded-full px-2">
                            <button 
                              onClick={() => updateQuantity(item.product.product_id, item.quantity - 1, item.size, item.color)}
                              className="p-1.5 hover:opacity-60"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-[11px] font-black">{item.quantity}</span>
                            <button 
                              onClick={() => {
                                if (item.quantity >= stock) {
                                  return;
                                }
                                updateQuantity(item.product.product_id, item.quantity + 1, item.size, item.color);
                              }}
                              disabled={item.quantity >= stock}
                              className={`p-1.5 ${item.quantity >= stock ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-60'}`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.product.product_id, item.size, item.color)}
                            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark underline underline-offset-4"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 space-y-4 bg-white">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Tổng cộng</span>
                  <span className="text-xl font-black">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium text-center uppercase tracking-widest">
                  Phí vận chuyển & thuế được tính khi thanh toán
                </p>
                <button 
                  onClick={() => {
                    onClose();
                    navigate('/checkout');
                  }}
                  className="w-full bg-brand-dark text-white py-5 uppercase font-black text-xs tracking-[0.3em] hover:bg-gray-800 transition-all"
                >
                  Thanh toán
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

