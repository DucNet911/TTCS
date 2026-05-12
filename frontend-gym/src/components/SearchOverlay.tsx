import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Star, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { productAPI } from '../api';
import { useNavigate } from 'react-router-dom';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    productAPI.getAll().then(setAllProducts).catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4);
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, allProducts]);

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white"
        >
          <div className="px-4 md:px-10 py-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-2xl">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={20} />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && query.trim()) {
                        navigate(`/search?q=${encodeURIComponent(query)}`);
                        onClose();
                      }
                    }}
                    placeholder="Tìm kiếm ở đây"
                    className="w-full bg-brand-light border border-gray-200 py-4 pl-12 pr-12 text-[14px] font-bold outline-none focus:border-brand-dark transition-all"
                  />
                  {query && (
                    <button 
                      onClick={() => setQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand-light rounded-full transition-all"
              >
                <X size={32} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {query.trim().length > 0 ? (
                <div className="max-w-5xl mx-auto">
                  {/* Products */}
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sản phẩm</h3>
                    </div>

                    {results.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {results.map((product) => (
                          <div 
                            key={product.product_id}
                            className="group cursor-pointer"
                            onClick={() => handleProductClick(product.product_id)}
                          >
                            {(() => {
                              return (
                                <>
                                  <div className="relative aspect-[3/4] bg-brand-light overflow-hidden mb-4">
                                    {product.primary_image ? (
                                      <img 
                                        src={product.primary_image} 
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">No Image</span>
                                      </div>
                                    )}
                                    <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-dark hover:text-white">
                                      <Heart size={16} />
                                    </button>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                      <h4 className="text-xs font-black uppercase tracking-tight truncate flex-1">{product.name}</h4>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.brand_name || ''}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.material || ''}</p>
                                    <div className="pt-1">
                                      <span className="text-xs font-black">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.base_price)}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center">
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Không tìm thấy sản phẩm cho "{query}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20">
                  <Search size={48} className="text-gray-100 mb-6" />
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Nhập từ khóa để tìm kiếm sản phẩm</p>
                  <div className="mt-12 flex flex-wrap justify-center gap-4">
                    {['Áo thun', 'Quần short', 'Phụ kiện', 'Tập luyện'].map((tag) => (
                      <button 
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-6 py-2 bg-brand-light hover:bg-brand-dark hover:text-white transition-all text-[10px] font-black uppercase tracking-widest rounded-full"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer View All */}
            {query.trim().length > 0 && results.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    onClose();
                  }}
                  className="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:underline"
                >
                  Xem tất cả <span className="text-brand-dark">"{query}"</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
