import React, { useState, useEffect } from 'react';
import { ProductListing } from '../components/ProductListing';
import { Product } from '../types';
import { productAPI } from '../api';
import { motion } from 'motion/react';

export const Accessories = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch tất cả phụ kiện (category 8=Balo, 9=Giày, 10=Tất, 11=Dụng cụ, 12=Mũ nón, 13=Bình nước)
    Promise.all(
      [8, 9, 10, 11, 12, 13].map(id => productAPI.getAll({ category_id: id }))
    ).then(results => {
      setProducts(results.flat());
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=2070" 
            alt="Bộ sưu tập Phụ kiện"
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
              PHỤ KIỆN
            </h1>
            <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em]">
              Hoàn thiện phong cách tập luyện
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product Listing with Filters */}
      <ProductListing 
        initialProducts={products} 
        title="Tất cả Phụ kiện" 
        hideGenderFilter={true}
        hideSizeFilter={true}
        hideColorFilter={true}
      />
    </div>
  );
};
