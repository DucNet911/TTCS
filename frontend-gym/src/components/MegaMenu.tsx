import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

const MENU_CONTENT: Record<string, any> = {
  women: {
    sections: [
      { 
        title: 'Sản phẩm', 
        items: ['Quần Leggings', 'Quần Shorts', 'Áo Khoác', 'Áo Hoodies', 'Áo Sports Bras'] 
      },
    ]
  },
  men: {
    sections: [
      { 
        title: 'Sản phẩm', 
        items: ['Áo T-Shirts', 'Quần Shorts', 'Áo Hoodies', 'Áo Tank Tops'] 
      },
    ]
  },
  accessories: {
    sections: [
      { 
        title: 'Sản phẩm', 
        items: ['Balo', 'Giày', 'Tất (Vớ)', 'Dụng cụ tập luyện', 'Mũ nón', 'Bình nước'] 
      },
    ]
  }
};

export const MegaMenu = ({ isOpen, onClose, category }: MegaMenuProps) => {
  const content = MENU_CONTENT[category.toLowerCase()];
  const [activeSection, setActiveSection] = useState('');

  // Reset active section when category changes
  React.useEffect(() => {
    if (content?.sections?.length > 0) {
      setActiveSection(content.sections[0].title);
    }
  }, [category, content]);

  if (!content) return null;

  const currentItems = content.sections.find((s: any) => s.title === activeSection)?.items || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`absolute top-full left-0 w-full bg-white shadow-2xl z-40 ${!isOpen && 'pointer-events-none'}`}
      onMouseLeave={onClose}
    >
      <div className="flex min-h-[350px]">
        {/* Left: Category List */}
        <div className="w-[280px] py-10 pl-10 border-r border-gray-100 shrink-0">
          <div className="space-y-1">
            {content.sections.map((section: any) => (
              <div 
                key={section.title} 
                onMouseEnter={() => setActiveSection(section.title)}
                className={`group cursor-pointer flex items-center justify-between py-3 pr-8 -ml-10 pl-10 transition-colors ${activeSection === section.title ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <span className={`text-[13px] font-bold transition-colors ${activeSection === section.title ? 'text-brand-dark' : 'text-gray-600 group-hover:text-brand-dark'}`}>
                  {section.title}
                </span>
                <ChevronRight 
                  size={14} 
                  className={`transition-colors ${activeSection === section.title ? 'text-brand-dark' : 'text-gray-300 group-hover:text-brand-dark'}`} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sub-items List */}
        <div className="flex-1 p-12 bg-gray-50/30">
          <div className="max-w-4xl">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">
              Khám phá {activeSection}
            </h4>
            <div className="grid grid-cols-3 gap-x-16 gap-y-5">
              {currentItems.map((item: string) => (
                <Link
                  key={item}
                  to={`/category/${category.toLowerCase()}/${encodeURIComponent(activeSection)}/${encodeURIComponent(item)}`}
                  className="text-[14px] font-semibold text-gray-500 hover:text-brand-dark transition-colors flex items-center group"
                >
                  <span className="relative">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-dark transition-all group-hover:w-full" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
