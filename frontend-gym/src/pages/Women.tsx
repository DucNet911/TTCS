import React, { useState, useEffect } from 'react';
import { ProductListing } from '../components/ProductListing';
import { Product } from '../types';
import { productAPI } from '../api';
import { motion } from 'motion/react';

export const Women = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productAPI.getAll({ gender: 'women' }).then(setProducts).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=2070" 
            alt="Bộ sưu tập Nữ"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-[24px] md:text-[60px] mb-4 tracking-tighter uppercase font-black">
              ĐỒ TẬP NỮ
            </h1>
            <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em]">
              Sức mạnh và sự duyên dáng
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product Listing with Filters */}
      <ProductListing 
        initialProducts={products} 
        title="Tất cả sản phẩm Nữ" 
        hideGenderFilter={true}
        hideColorFilter={true}
      />
    </div>
  );
};
