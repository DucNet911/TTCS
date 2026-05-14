import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductListing } from '../components/ProductListing';
import { Product } from '../types';
import { productAPI, categoryAPI } from '../api';
import { motion } from 'motion/react';

/**
 * Mapping từ tên menu item → category_id trong database
 * NAM (4): 1=Áo T-Shirts, 2=Quần Shorts, 3=Áo Hoodies, 4=Áo Tank Tops
 * NỮ (5): 5=Quần Leggings, 2=Quần Shorts (chung), 6=Áo Khoác, 3=Áo Hoodies (chung), 7=Áo Sports Bras
 * PHỤ KIỆN (6): 8=Balo, 9=Giày, 10=Tất, 11=Dụng cụ, 12=Mũ nón, 13=Bình nước
 */
const MENU_TO_CATEGORY: Record<string, { category_ids: number[] }> = {
  // === NAM + NỮ (dùng chung category_id, phân biệt bằng gender) ===
  'Áo T-Shirts':    { category_ids: [1] },
  'Quần Shorts':    { category_ids: [2] },
  'Áo Hoodies':     { category_ids: [3] },
  'Áo Tank Tops':   { category_ids: [4] },
  'Quần Leggings':  { category_ids: [5] },
  'Áo Khoác':       { category_ids: [6] },
  'Áo Sports Bras': { category_ids: [7] },
  // === PHỤ KIỆN ===
  'Balo':              { category_ids: [8] },
  'Giày':              { category_ids: [9] },
  'Tất (Vớ)':          { category_ids: [10] },
  'Dụng cụ tập luyện': { category_ids: [11] },
  'Mũ nón':            { category_ids: [12] },
  'Bình nước':         { category_ids: [13] },
};

export const CategoryPage = () => {
  const { gender, section, item } = useParams<{ gender: string; section: string; item: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Load danh mục từ DB một lần
  useEffect(() => {
    categoryAPI.getAll().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!gender || !item) return;

    const fetchProducts = async () => {
      try {
        const config = MENU_TO_CATEGORY[item];

        if (config && config.category_ids.length > 0) {
          // Lọc chính xác theo category_id
          const results = await Promise.all(
            config.category_ids.map(id => productAPI.getAll({ category_id: id }))
          );
          let allProducts = results.flat();

          // Với NAM/NỮ: lọc thêm theo gender (vì Quần Shorts, Áo Hoodies dùng chung category)
          if (gender === 'men') {
            allProducts = allProducts.filter(p => p.gender === 'men' || p.gender === 'unisex');
          } else if (gender === 'women') {
            allProducts = allProducts.filter(p => p.gender === 'women' || p.gender === 'unisex');
          }
          // PHỤ KIỆN: không cần lọc gender (phụ kiện thường là unisex)

          setProducts(allProducts);
        } else if (gender === 'accessories') {
          // Fallback: lấy tất cả phụ kiện (category 8-13)
          const results = await Promise.all(
            [8, 9, 10, 11, 12, 13].map(id => productAPI.getAll({ category_id: id }))
          );
          setProducts(results.flat());
        } else {
          // Fallback: lấy tất cả sản phẩm theo gender
          const allProducts = await productAPI.getAll({ gender });
          setProducts(allProducts);
        }
      } catch {
        setProducts([]);
      }
    };

    fetchProducts();
  }, [gender, section, item, categories]);
  const getTitle = () => {
    const genderLabel = gender === 'men' ? 'Nam' : gender === 'women' ? 'Nữ' : 'Phụ kiện';
    return `${genderLabel} - ${item}`;
  };

  const getHeroImage = () => {
    if (gender === 'men') return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=2070";
    if (gender === 'women') return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=2070";
    return "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=2070";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={getHeroImage()} 
            alt={getTitle()}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-[24px] md:text-[48px] mb-2 tracking-tighter uppercase font-black">
              {getTitle()}
            </h1>
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em]">
              Khám phá bộ sưu tập {item} dành cho {gender === 'men' ? 'nam' : gender === 'women' ? 'nữ' : 'mọi người'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product Listing */}
      <ProductListing 
        initialProducts={products} 
        title={`Kết quả cho "${item}"`} 
      />
    </div>
  );
};
