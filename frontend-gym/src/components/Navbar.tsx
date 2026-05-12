import React, { useState, useRef } from 'react';
import { ShoppingBag, Search, User, Menu, Heart, X } from 'lucide-react';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import { SearchOverlay } from './SearchOverlay';
import { MegaMenu } from './MegaMenu';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = ({ onOpenCart }: { onOpenCart: () => void }) => {
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 100);
  };

  return (
    <>
      <nav 
        className="sticky top-0 z-50 bg-white px-4 md:px-10 py-3 border-b border-gray-100"
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-12 shrink-0">
            <Link to="/" className="text-2xl font-black tracking-tighter">
              FITGEAR
            </Link>
            
            <div className="hidden lg:flex gap-8 text-[13px] font-bold uppercase tracking-wider h-full items-center">
              <Link 
                to="/women" 
                className={`py-4 transition-all border-b-2 ${activeMenu === 'women' ? 'border-brand-dark' : 'border-transparent hover:opacity-60'}`}
                onMouseEnter={() => handleMouseEnter('women')}
              >
                Nữ
              </Link>
              <Link 
                to="/men" 
                className={`py-4 transition-all border-b-2 ${activeMenu === 'men' ? 'border-brand-dark' : 'border-transparent hover:opacity-60'}`}
                onMouseEnter={() => handleMouseEnter('men')}
              >
                Nam
              </Link>
              <Link 
                to="/accessories" 
                className={`py-4 transition-all border-b-2 ${activeMenu === 'accessories' ? 'border-brand-dark' : 'border-transparent hover:opacity-60'}`}
                onMouseEnter={() => handleMouseEnter('accessories')}
              >
                Phụ kiện
              </Link>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-end gap-6">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center bg-brand-light px-6 py-2.5 rounded-full group hover:bg-gray-100 transition-all w-full max-w-[450px]"
            >
              <Search size={18} className="text-gray-500 group-hover:text-brand-dark" />
              <span className="text-[14px] ml-3 text-gray-400 font-medium group-hover:text-brand-dark truncate">Tìm kiếm ở đây</span>
            </button>
            
            <div className="flex items-center gap-6 shrink-0">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-1 hover:opacity-60 transition-opacity"
              >
                <Search size={22} />
              </button>
              <Link to="/wishlist" className="p-1 hover:opacity-60 transition-opacity relative">
                <Heart size={22} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-dark text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/account" className="p-1 hover:opacity-60 transition-opacity flex items-center gap-2">
                <User size={22} />
                {isAuthenticated && user && (
                  <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest">{user.name.split(' ').pop()}</span>
                )}
              </Link>
              {isAdmin && (
                <Link to="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-brand-dark hover:underline border-l border-gray-100 pl-4 hidden md:block">
                  Quản trị
                </Link>
              )}
              <button 
                onClick={onOpenCart}
                className="p-1 hover:opacity-60 transition-opacity relative"
              >
                <ShoppingBag size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-dark text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
              <button className="lg:hidden p-1 hover:opacity-60 transition-opacity">
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {activeMenu && activeMenu !== 'explore' && (
            <MegaMenu 
              isOpen={!!activeMenu} 
              onClose={() => setActiveMenu(null)} 
              category={activeMenu} 
            />
          )}
        </AnimatePresence>
      </nav>

      {/* Background Overlay */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};
