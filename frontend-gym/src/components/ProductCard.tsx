import React from 'react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { Plus, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = React.useState(false);

  const primaryImage = product.primary_image || null;

  return (
    <div className="group relative flex flex-col cursor-pointer">
      <Link to={`/product/${product.product_id}`}>
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="aspect-[4/5] overflow-hidden bg-brand-light relative rounded-sm"
        >
          {primaryImage ? (
            <img 
              src={primaryImage} 
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-brand-light flex items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">No Image</span>
            </div>
          )}
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart({ product, quantity: 1 });
            }}
            className="absolute bottom-3 right-3 bg-white text-brand-dark p-2.5 rounded-full shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-dark hover:text-white z-10"
          >
            <Plus size={18} />
          </button>
        </motion.div>
      </Link>
      
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-all z-10 ${isInWishlist(product.product_id) ? 'text-red-500 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}
      >
        <Heart size={16} fill={isInWishlist(product.product_id) ? "currentColor" : "none"} />
      </button>

      <Link to={`/product/${product.product_id}`} className="mt-3 space-y-0.5">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-[14px] font-medium text-gray-900 leading-tight group-hover:underline underline-offset-4">
            {product.name}
          </h3>
        </div>
        
        <div className="flex flex-col">
          <p className="text-[13px] text-gray-500 font-medium">
            {product.brand_name || ''}
          </p>
          <p className="text-[13px] text-gray-500 font-medium">
            {product.material?.split(' ')[0] || ''}
          </p>
        </div>

        <div className="pt-1">
          <span className="text-[15px] font-black text-gray-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.base_price)}
          </span>
        </div>
      </Link>
    </div>
  );
};
