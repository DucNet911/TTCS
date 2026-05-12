import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductSKU, Review } from '../types';
import { productAPI } from '../api';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Minus, Plus, Share2, Heart, ShieldCheck, Truck, RotateCcw, ZoomIn, ZoomOut, Star, MessageSquare } from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<any[]>([]);
  const [skus, setSkus] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [brand, setBrand] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [availableSizes, setAvailableSizes] = useState<any[]>([]);
  const [availableColors, setAvailableColors] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSku, setSelectedSku] = useState<ProductSKU | undefined>(undefined);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [isManualZoom, setIsManualZoom] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productAPI.getById(Number(id)).then(data => {
      setProduct(data);
      setImages(data.images || []);
      setSkus(data.skus || []);
      setGoals(data.goals || []);
      setProductReviews(data.reviews || []);
      setBrand({ name: data.brand_name });
      setCategory({ name: data.category_name });

      // Extract unique sizes/colors from skus
      const sizeMap = new Map();
      const colorMap = new Map();
      (data.skus || []).forEach((sku: any) => {
        if (sku.size_id && sku.size_name) sizeMap.set(sku.size_id, { size_id: sku.size_id, name: sku.size_name });
        if (sku.color_id && sku.color_name) colorMap.set(sku.color_id, { color_id: sku.color_id, name: sku.color_name, hex_code: sku.hex_code || '#000' });
      });
      const sizes = Array.from(sizeMap.values());
      const colors = Array.from(colorMap.values());
      setAvailableSizes(sizes);
      setAvailableColors(colors);
      if (sizes.length > 0) setSelectedSize(sizes[0].name);
      if (colors.length > 0) setSelectedColor(colors[0].name);
      if (data.skus?.length > 0) setSelectedSku(data.skus[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const sizeObj = availableSizes.find((s: any) => s.name === selectedSize);
    const colorObj = availableColors.find((c: any) => c.name === selectedColor);
    if (sizeObj && colorObj) {
      const sku = skus.find((s: any) => s.size_id === sizeObj.size_id && s.color_id === colorObj.color_id);
      setSelectedSku(sku);
    }
  }, [selectedSize, selectedColor, skus, availableSizes, availableColors]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-dark border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black mb-4">KHÔNG TÌM THẤY SẢN PHẨM</h2>
          <button 
            onClick={() => navigate('/')}
            className="text-sm font-bold uppercase tracking-widest underline"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const averageRating = productReviews.length > 0 
    ? (productReviews.reduce((acc, r) => acc + Number(r.rating), 0) / productReviews.length).toFixed(1)
    : 0;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.product_id,
          customer_id: user.customer_id,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      if (res.ok) {
        const review = await res.json();
        setProductReviews([review, ...productReviews]);
        setNewReview({ rating: 5, comment: '' });
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
    setIsSubmitting(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - window.scrollX - left) / width) * 100;
    const y = ((e.pageY - window.scrollY - top) / height) * 100;
    setZoomPos({ x, y });
  };



  const handleAddToCart = () => {
    if (selectedSku && quantity > selectedSku.stock) {
      alert(`Rất tiếc, sản phẩm này chỉ còn ${selectedSku.stock} sản phẩm trong kho!`);
      return;
    }
    addToCart({
      product,
      sku: selectedSku,
      quantity,
      size: selectedSize,
      color: selectedColor
    });
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price) || 0);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="px-4 md:px-10 pt-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-10">
          <button onClick={() => navigate('/')} className="hover:text-brand-dark">Trang chủ</button>
          <span>/</span>
          <button onClick={() => navigate(`/${product.gender}`)} className="hover:text-brand-dark">{product.gender === 'men' ? 'Nam' : 'Nữ'}</button>
          <span>/</span>
          <span className="text-brand-dark">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div 
              onClick={() => setIsManualZoom(!isManualZoom)}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => {
                setIsZooming(false);
                setIsManualZoom(false);
              }}
              className={`relative aspect-[4/5] bg-brand-light overflow-hidden rounded-sm group ${isManualZoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            >
              {images.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    src={images[activeImageIndex]?.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: (isZooming && isManualZoom) ? 'scale(2.5)' : 'scale(1)',
                      transition: (isZooming && isManualZoom) ? 'transform 0.1s ease-out' : 'transform 0.3s ease-in-out, opacity 0.5s'
                    }}
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
              ) : (
                <div className="w-full h-full bg-brand-light flex items-center justify-center">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-300">No Image Available</span>
                </div>
              )}
              
              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
                    }}
                    className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors pointer-events-auto"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
                    }}
                    className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors pointer-events-auto"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-5 gap-4">
              {images.length > 1 && images.map((img, idx) => (
                <button 
                  key={img.image_id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-[4/5] bg-brand-light overflow-hidden rounded-sm border-2 transition-all ${activeImageIndex === idx ? 'border-brand-dark' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-black text-brand-accent uppercase tracking-[0.2em] mb-2 block">
                    {brand?.name} • {category?.name}
                  </span>
                  <h1 className="text-[30px] font-black uppercase tracking-tighter leading-none">
                    {product.name}
                  </h1>
                  {productReviews.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex text-brand-accent">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {averageRating} ({productReviews.length} nhận xét)
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-brand-light rounded-full transition-colors"><Share2 size={20} /></button>
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className={`p-2 hover:bg-brand-light rounded-full transition-colors ${isInWishlist(product.product_id) ? 'text-red-500' : 'text-brand-dark'}`}
                  >
                    <Heart size={20} fill={isInWishlist(product.product_id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-black">
                  {formatPrice(selectedSku?.price || product.base_price)}
                </span>
                {selectedSku && selectedSku.stock < 10 && selectedSku.stock > 0 && (
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                    Chỉ còn {selectedSku.stock} sản phẩm!
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Goals Tags */}
            <div className="flex flex-wrap gap-2">
              {goals.map(goal => (
                <span key={goal?.goal_id} className="px-3 py-1 bg-brand-light text-[10px] font-black uppercase tracking-widest rounded-full">
                  {goal?.goal_name}
                </span>
              ))}
            </div>

            <div className="h-px bg-gray-100" />

            {/* Selection Options */}
            <div className="space-y-6">
              {/* Color Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-widest">Màu sắc: {selectedColor}</span>
                </div>
                <div className="flex gap-3">
                  {availableColors.map(color => (
                    <button
                      key={color.color_id}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 p-1 transition-all ${selectedColor === color.name ? 'border-brand-dark' : 'border-transparent'}`}
                    >
                      <div 
                        className="w-full h-full rounded-full border border-gray-200" 
                        style={{ backgroundColor: color.hex_code }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest">Kích cỡ: {selectedSize}</span>
                    <button className="text-[10px] font-bold uppercase tracking-widest underline">Bảng size</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSizes.map(size => {
                      const isAvailable = skus.some((s: any) => s.size_id === size.size_id && s.color_name === selectedColor && s.stock > 0);
                      return (
                        <button
                          key={size.size_id}
                          disabled={!isAvailable}
                          onClick={() => setSelectedSize(size.name)}
                          className={`py-3 text-xs font-black uppercase tracking-widest border-2 transition-all ${
                            selectedSize === size.name 
                              ? 'border-brand-dark bg-brand-dark text-white' 
                              : isAvailable 
                                ? 'border-gray-100 hover:border-brand-dark' 
                                : 'border-gray-50 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {size.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-widest">Số lượng</span>
                <div className="flex items-center w-32 border-2 border-gray-100 rounded-sm">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-3 hover:bg-brand-light transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="flex-1 text-center font-black text-sm">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-3 hover:bg-brand-light transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <button 
                onClick={handleAddToCart}
                disabled={!selectedSku || selectedSku.stock === 0}
                className="w-full bg-brand-dark text-white py-5 font-black uppercase text-sm tracking-[0.2em] hover:bg-gray-800 transition-all disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {selectedSku && selectedSku.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 gap-4 pt-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-brand-light rounded-sm"><Truck size={18} /></div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest">Miễn phí vận chuyển</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Cho đơn hàng trên 2.000.000 ₫</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-brand-light rounded-sm"><RotateCcw size={18} /></div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest">Đổi trả 30 ngày</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Miễn phí đổi trả tại cửa hàng</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-brand-light rounded-sm"><ShieldCheck size={18} /></div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest">Bảo hành chính hãng</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Cam kết chất lượng từ {brand?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Tabs */}
        <div className="mt-32 border-t border-gray-100 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="space-y-6">
              <h3 className="text-[14px] font-black uppercase tracking-tighter">Chi tiết sản phẩm</h3>
              <ul className="space-y-4 text-sm text-gray-600 font-medium">
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400 uppercase text-[10px] font-black tracking-widest">Chất liệu</span>
                  <span>{product.material}</span>
                </li>
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400 uppercase text-[10px] font-black tracking-widest">Thương hiệu</span>
                  <span>{brand?.name}</span>
                </li>
                <li className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400 uppercase text-[10px] font-black tracking-widest">Mã SKU</span>
                  <span>{selectedSku?.sku_code || 'N/A'}</span>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-[14px] font-black uppercase tracking-tighter">Mô tả chi tiết</h3>
              <div className="prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed">
                <p>
                  Sản phẩm {product.name} được thiết kế đặc biệt để mang lại hiệu suất tối ưu. 
                  Với chất liệu {product.material}, sản phẩm không chỉ bền bỉ mà còn mang lại sự thoải mái tuyệt đối.
                </p>
                <p>
                  Công nghệ tiên tiến từ {brand?.name} giúp kiểm soát độ ẩm và nhiệt độ cơ thể, cho phép bạn tập trung hoàn toàn vào mục tiêu của mình. 
                  Dù bạn đang tập trung vào {goals.map(g => g?.goal_name).filter(Boolean).join(', ')}, đây là sự lựa chọn hoàn hảo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-32 border-t border-gray-100 pt-20">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="w-full md:w-1/3 space-y-8">
              <h3 className="text-[24px] font-black uppercase tracking-tighter">Đánh giá khách hàng</h3>
              {productReviews.length > 0 && (
                <div className="bg-brand-light p-8 rounded-sm">
                  <div className="text-5xl font-black mb-2">{averageRating}</div>
                  <div className="flex text-brand-accent mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Dựa trên {productReviews.length} nhận xét</p>
                </div>
              )}

              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest">Viết nhận xét của bạn</h4>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={`p-1 transition-colors ${newReview.rating >= star ? 'text-brand-accent' : 'text-gray-200'}`}
                      >
                        <Star size={24} fill={newReview.rating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    required
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    className="w-full bg-brand-light border-none p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-dark transition-all rounded-sm min-h-[120px]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-dark text-white py-4 font-black uppercase text-xs tracking-widest hover:bg-gray-800 transition-all disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi nhận xét'}
                  </button>
                </form>
              ) : (
                <div className="bg-brand-light p-6 rounded-sm text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Đăng nhập để viết nhận xét</p>
                  <button 
                    onClick={() => navigate('/account')}
                    className="text-xs font-black uppercase tracking-widest underline underline-offset-4"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              )}
            </div>

            {productReviews.length > 0 && (
              <div className="w-full md:w-2/3 space-y-12">
                <div className="space-y-8">
                  {productReviews.map((review) => (
                    <div key={review.review_id} className="border-b border-gray-100 pb-8 last:border-0">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <div className="flex text-brand-accent">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                            ))}
                          </div>
                          <h5 className="text-sm font-black uppercase tracking-tight">{review.customer_name || `Khách hàng #${review.customer_id}`}</h5>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(review.review_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
                        "{review.comment}"
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest">
                        <ShieldCheck size={12} />
                        Đã mua hàng
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
