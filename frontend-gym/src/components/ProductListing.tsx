import React, { useMemo, useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import { catalogAPI } from '../api';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

interface ProductListingProps {
  initialProducts: Product[];
  title: string;
  subtitle?: string;
  hideGenderFilter?: boolean;
  hideSizeFilter?: boolean;
  hideColorFilter?: boolean;
}

export const ProductListing = ({ 
  initialProducts, 
  title, 
  subtitle,
  hideGenderFilter = true,
  hideSizeFilter = false,
  hideColorFilter = true
}: ProductListingProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('relevancy');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<number[]>([]);
  const [colors, setColors] = useState<any[]>([]);

  // Fetch colors from API
  useEffect(() => {
    if (!hideColorFilter) {
      catalogAPI.getColors().then(setColors).catch(() => {});
    }
  }, [hideColorFilter]);
  
  const filteredProducts = useMemo(() => {
    let result = initialProducts.filter(p => !p.is_deleted);

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
  }, [initialProducts, sortBy, selectedGenders, selectedSizes, selectedColors]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    gender: !hideGenderFilter,
    size: false,
    color: !hideColorFilter
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

  const toggleGender = (gender: string) => {
    setSelectedGenders(prev => 
      prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
    );
  };

  return (
    <div className="px-4 md:px-10 py-10">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-[24px] md:text-[60px] mb-4 tracking-tighter uppercase font-black">{title}</h1>
        {subtitle && (
          <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-gray-500">{subtitle}</p>
        )}
        <div className="mt-8 flex items-center gap-3">
          <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">{filteredProducts.length} Sản phẩm</span>
        </div>
      </div>

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
            {!hideGenderFilter && (
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
            )}

            {/* Color */}
            {!hideColorFilter && colors.length > 0 && (
              <FilterSection 
                title="Màu sắc" 
                isOpen={openSections.color} 
                onToggle={() => toggleSection('color')}
              >
                <div className="flex flex-wrap gap-3">
                  {colors.map((color: any) => (
                    <button
                      key={color.color_id}
                      onClick={() => setSelectedColors(prev => prev.includes(color.color_id) ? prev.filter(id => id !== color.color_id) : [...prev, color.color_id])}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${selectedColors.includes(color.color_id) ? 'border-brand-dark scale-110' : 'border-transparent hover:scale-105'}`}
                      title={color.name}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-100" 
                        style={{ backgroundColor: color.hex_code }}
                      />
                    </button>
                  ))}
                </div>
              </FilterSection>
            )}
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
    </div>
  );
};
