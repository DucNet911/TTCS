import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { productAPI } from '../api';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';

type SortOption = 'relevancy' | 'price-low-high' | 'price-high-low' | 'newest';

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterSection = ({ title, isOpen, onToggle, children }: FilterSectionProps) => (
  <div className="border-b border-gray-100 py-6">
    <button 
      onClick={onToggle}
      className="flex justify-between items-center w-full group"
    >
      <span className="text-[12px] font-black uppercase tracking-[0.2em] group-hover:text-brand-dark transition-colors">
        {title}
      </span>
      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="pt-6 space-y-3">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [sortBy, setSortBy] = useState<SortOption>('relevancy');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<number[]>([]);
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    gender: true,
    size: true,
    color: true,
    features: false,
    fit: false,
    pattern: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearAll = () => {
    setSortBy('relevancy');
    setSelectedGenders([]);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    productAPI.getAll().then(setAllProducts).catch(() => {});
  }, []);

  const baseResults = allProducts.filter(p => {
    if (!query.trim()) return false;
    return p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase());
  });

  const filteredProducts = (() => {
    let result = [...baseResults];

    if (selectedGenders.length > 0) {
      result = result.filter(p => selectedGenders.includes(p.gender));
    }

    if (sortBy === 'price-low-high') {
      result.sort((a, b) => a.base_price - b.base_price);
    } else if (sortBy === 'price-high-low') {
      result.sort((a, b) => b.base_price - a.base_price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.product_id - a.product_id);
    }

    return result;
  })();

  const toggleGender = (gender: string) => {
    setSelectedGenders(prev => 
      prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
    );
  };

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="px-4 md:px-10 py-10">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm text-gray-500 font-medium mb-1">Kết quả tìm kiếm cho</p>
          <div className="flex items-baseline gap-3">
            <h1 className="text-[18px] font-black uppercase tracking-tight">"{query}"</h1>
            <span className="text-sm text-gray-400 font-bold">{filteredProducts.length} Sản phẩm</span>
          </div>
        </div>

        {baseResults.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[14px] font-black uppercase tracking-[0.2em]">Lọc & Sắp xếp</h2>
                <button 
                  onClick={clearAll}
                  className="text-[12px] font-bold text-gray-400 hover:text-brand-dark transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="space-y-2">
                {/* Sort By */}
                <FilterSection 
                  title="Sắp xếp theo" 
                  isOpen={openSections.sort} 
                  onToggle={() => toggleSection('sort')}
                >
                  {[
                    { label: 'Giá: Thấp đến Cao', value: 'price-low-high' },
                    { label: 'Giá: Cao đến Thấp', value: 'price-high-low' },
                    { label: 'Phổ biến nhất', value: 'relevancy' },
                    { label: 'Mới nhất', value: 'newest' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="sort" 
                          checked={sortBy === opt.value}
                          onChange={() => setSortBy(opt.value as SortOption)}
                          className="appearance-none w-5 h-5 border-2 border-gray-200 rounded-full checked:border-brand-dark transition-all"
                        />
                        {sortBy === opt.value && (
                          <div className="absolute w-2.5 h-2.5 bg-brand-dark rounded-full" />
                        )}
                      </div>
                      <span className={`text-[13px] font-bold transition-colors ${sortBy === opt.value ? 'text-brand-dark' : 'text-gray-500 group-hover:text-gray-900'}`}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </FilterSection>

                {/* Gender */}
                <FilterSection 
                  title="Giới tính" 
                  isOpen={openSections.gender} 
                  onToggle={() => toggleSection('gender')}
                >
                  {[
                    { label: 'Nam', value: 'men' },
                    { label: 'Nữ', value: 'women' },
                    { label: 'Unisex', value: 'unisex' },
                  ].map((gender) => (
                    <label key={gender.value} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedGenders.includes(gender.value)}
                        onChange={() => toggleGender(gender.value)}
                        className="w-5 h-5 border-2 border-gray-200 rounded-sm checked:bg-brand-dark transition-all appearance-none checked:border-brand-dark relative after:content-['✓'] after:absolute after:text-white after:text-[10px] after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:opacity-0 checked:after:opacity-100"
                      />
                      <span className={`text-[13px] font-bold transition-colors ${selectedGenders.includes(gender.value) ? 'text-brand-dark' : 'text-gray-500 group-hover:text-gray-900'}`}>
                        {gender.label}
                      </span>
                    </label>
                  ))}
                </FilterSection>


              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-12">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.product_id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Không tìm thấy sản phẩm phù hợp với bộ lọc</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="text-gray-200 mb-8">
              <Search size={80} strokeWidth={1} />
            </div>
            <h3 className="text-[18px] font-black uppercase tracking-tight mb-4">Rất tiếc, không tìm thấy sản phẩm nào</h3>
            <p className="text-gray-500 font-medium max-w-md mx-auto mb-10">
              Hãy thử tìm kiếm với từ khóa khác hoặc quay lại trang chủ để khám phá thêm nhiều sản phẩm hấp dẫn.
            </p>
            <a 
              href="/" 
              className="px-10 py-4 bg-brand-dark text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-colors"
            >
              Quay lại trang chủ
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
