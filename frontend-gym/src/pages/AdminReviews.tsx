import React, { useState, useEffect } from 'react';
import { FileText, Tag, Users, PieChart, LogOut, Search, Star, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { reviewAPI } from '../api';

export const AdminReviews = () => {
  const { user, isAdmin } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const fetchReviews = () => {
    reviewAPI.getAll().then(setReviews).catch(() => {});
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (!isAdmin) {
    return <Navigate to="/account" />;
  }

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.')) {
      try {
        await reviewAPI.delete(id);
        fetchReviews();
      } catch {
        alert('Lỗi khi xóa đánh giá');
      }
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReviews = filteredReviews.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Sidebar - Brand Dark Style */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col sticky top-0 h-screen hidden lg:flex">
        <div className="h-20 px-8 border-b border-white/5 flex items-center">
          <Link to="/" className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap">FitGear Admin</Link>
        </div>
        
        <nav className="flex-1 mt-8 px-4 space-y-2">
          {[
            { icon: FileText, label: 'Đơn hàng', path: '/admin/orders', active: false },
            { icon: Tag, label: 'Sản phẩm', path: '/admin/products', active: false },
            { icon: Users, label: 'Khách hàng', path: '/admin/customers', active: false },
            { icon: MessageSquare, label: 'Đánh giá', path: '/admin/reviews', active: true },
            { icon: PieChart, label: 'Báo cáo', path: '/admin/reports', active: false },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                item.active 
                  ? 'bg-white text-brand-dark shadow-lg shadow-black/10 scale-[1.02] font-bold' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <Link 
            to="/"
            className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-white transition-all"
          >
            <LogOut size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest">Rời đi</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F5F5F5]">
        <div className="p-10 max-w-[1400px] w-full mx-auto flex-1 flex flex-col">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-brand-dark mb-2">QUẢN LÝ ĐÁNH GIÁ</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Kiểm duyệt và quản lý phản hồi khách hàng</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
            <div className="p-6 flex flex-wrap gap-4 items-center bg-gray-50/10 border-b border-gray-50">
              <div className="flex-1 max-w-sm relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  placeholder="TÌM KHÁCH HÀNG, SẢN PHẨM..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-[#F5F5F5] border-none py-4 pl-12 pr-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Sản phẩm</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 text-center">Đánh giá</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 w-1/3">Nội dung</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 text-right">Khách hàng</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedReviews.length > 0 ? paginatedReviews.map((review) => (
                    <tr key={review.review_id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="text-xs font-black uppercase tracking-tight text-brand-dark">{review.product_name}</span>
                        <div className="text-[10px] text-gray-400 mt-1">{new Date(review.review_date).toLocaleString('vi-VN')}</div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex justify-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              size={14} 
                              className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} 
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-medium text-gray-600 line-clamp-2">{review.comment || <span className="text-gray-300 italic">Không có nội dung</span>}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-xs font-bold text-gray-500 uppercase">{review.customer_name}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDelete(review.review_id)}
                          className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Xóa đánh giá"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-gray-400 text-sm font-medium">
                        Không tìm thấy đánh giá nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-8 py-6 flex items-center justify-between border-t border-gray-50 bg-gray-50/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Đang hiển thị {startIdx + 1} đến {Math.min(startIdx + ITEMS_PER_PAGE, filteredReviews.length)} của {filteredReviews.length} đánh giá
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-brand-dark'}`}
                  >Trước</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(i => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i)}
                      className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${i === currentPage ? 'bg-brand-dark text-white shadow-md shadow-black/10' : 'text-gray-400 hover:bg-white hover:text-brand-dark'}`}
                    >{i}</button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === totalPages ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-brand-dark'}`}
                  >Sau</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
