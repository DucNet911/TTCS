import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { productAPI, customerAPI } from '../api';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Shield, Trophy, ChevronRight, ChevronLeft, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=2070",
    title: "CÙNG NHAU BỨT PHÁ",
    subtitle: "Bộ sưu tập hiệu suất mới đã ra mắt.",
    ctaWomen: "/women",
    ctaMen: "/men"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=2070",
    title: "SỨC MẠNH NỘI TẠI",
    subtitle: "Khám phá giới hạn mới của bản thân.",
    ctaWomen: "/women",
    ctaMen: "/men"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=2070",
    title: "PHONG CÁCH THỂ THAO",
    subtitle: "Thiết kế hiện đại, hiệu năng tối ưu.",
    ctaWomen: "/women",
    ctaMen: "/men"
  }
];

const ProductSection = ({ title, products, link }: { title: string, products: Product[], link: string }) => (
  <section className="py-20 bg-white border-b border-gray-50 last:border-0">
    <div className="px-4 md:px-10">
      <div className="flex justify-between items-end mb-10">
        <h2 className="text-[32px] md:text-[48px] font-black uppercase tracking-tighter leading-none">{title}</h2>
        <Link to={link} className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:opacity-60 transition-opacity mb-2">
          Xem tất cả <ChevronRight size={14} />
        </Link>
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
          {products.map(product => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-sm">
          <p className="text-gray-300 font-bold uppercase tracking-widest text-xs">Chưa có sản phẩm</p>
        </div>
      )}
    </div>
  </section>
);

export const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [menProducts, setMenProducts] = useState<Product[]>([]);
  const [womenProducts, setWomenProducts] = useState<Product[]>([]);
  const [accessoryProducts, setAccessoryProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch 5 sản phẩm mới nhất dành cho Nam (tất cả danh mục quần áo nam)
    productAPI.getAll({ gender: 'men' })
      .then(data => setMenProducts(data.slice(0, 5)))
      .catch(() => {});

    // Fetch 5 sản phẩm mới nhất dành cho Nữ
    productAPI.getAll({ gender: 'women' })
      .then(data => setWomenProducts(data.slice(0, 5)))
      .catch(() => {});

    // Fetch 5 phụ kiện mới nhất (category 8-13)
    Promise.all(
      [8, 9, 10, 11, 12, 13].map(id => productAPI.getAll({ category_id: id }))
    ).then(results => {
      // Gộp tất cả phụ kiện, sắp xếp theo product_id giảm dần (mới nhất), lấy 5
      const all = results.flat().sort((a, b) => b.product_id - a.product_id);
      setAccessoryProducts(all.slice(0, 5));
    }).catch(() => {});
  }, []);

  // Fetch sản phẩm gợi ý theo mục tiêu thể hình của khách hàng
  useEffect(() => {
    if (user && user.role !== 'admin') {
      customerAPI.getRecommendations(user.customer_id)
        .then(data => setRecommendedProducts(data.slice(0, 5)))
        .catch(() => setRecommendedProducts([]));
    } else {
      setRecommendedProducts([]);
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Slider Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={HERO_SLIDES[currentSlide].image} 
              alt={HERO_SLIDES[currentSlide].title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/30" />
          </motion.div>
        </AnimatePresence>

        <div className="px-4 relative z-10 text-center text-white">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-[44px] md:text-[82px] mb-6 tracking-tighter font-black">
                {HERO_SLIDES[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl font-medium mb-10 max-w-xl mx-auto uppercase tracking-widest">
                {HERO_SLIDES[currentSlide].subtitle}
              </p>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slider Controls */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white transition-colors"
        >
          <ChevronLeft size={48} strokeWidth={1} />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white transition-colors"
        >
          <ChevronRight size={48} strokeWidth={1} />
        </button>

        {/* Slider Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-12 h-1 transition-all ${currentSlide === idx ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </section>

      {/* Promo Bar */}
      <div className="py-4 border-y border-gray-200">
        <div className="px-4 flex justify-center gap-12 text-[12px] font-bold uppercase tracking-[0.2em] text-gray-600">
          <span className="flex items-center gap-2"><Zap size={14} /> Miễn phí vận chuyển trên 2.000.000 ₫</span>
          <span className="hidden md:flex items-center gap-2"><Shield size={14} /> Đổi trả miễn phí</span>
          <Link to="/info/student-discount" className="hidden lg:flex items-center gap-2 hover:text-brand-dark transition-colors"><Trophy size={14} /> Giảm giá 10% cho sinh viên</Link>
        </div>
      </div>

      {/* GỢI Ý DÀNH RIÊNG CHO BẠN */}
      {isAuthenticated && recommendedProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-amber-50/50 to-white border-b border-gray-50">
          <div className="px-4 md:px-10">
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-3">
                <Target size={28} className="text-amber-500" />
                <h2 className="text-[32px] md:text-[48px] font-black uppercase tracking-tighter leading-none">Gợi ý cho bạn</h2>
              </div>
              <Link to="/account?tab=settings" className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:opacity-60 transition-opacity mb-2">
                Cập nhật mục tiêu <ChevronRight size={14} />
              </Link>
            </div>
            <p className="text-sm text-gray-400 font-medium mb-10">Dựa trên mục tiêu thể hình của bạn</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
              {recommendedProducts.map(product => (
                <div key={product.product_id} className="relative">
                  <ProductCard product={product} />
                  {(product as any).matched_goals && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(product as any).matched_goals.split(', ').map((goal: string) => (
                        <span key={goal} className="text-[8px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          {goal}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Sections */}
      <ProductSection title="Dành cho nam" products={menProducts} link="/men" />
      <ProductSection title="Dành cho nữ" products={womenProducts} link="/women" />
      <ProductSection title="Phụ kiện tập luyện" products={accessoryProducts} link="/accessories" />

      {/* Community Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-brand-light">
          <div className="px-4 text-center">
            <h2 className="text-[40px] md:text-[72px] mb-6 font-black uppercase tracking-tighter leading-none">TRỞ THÀNH MỘT PHẦN CỦA GIA ĐÌNH</h2>
            <p className="text-gray-600 mb-10 max-w-2xl mx-auto font-medium">
              Tham gia cộng đồng vận động viên của chúng tôi và nhận quyền truy cập độc quyền vào các sản phẩm mới và sự kiện.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/account" 
                className="bg-brand-dark text-white px-10 py-4 font-black uppercase text-sm tracking-widest hover:bg-gray-800 transition-colors"
              >
                Tham gia ngay
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
