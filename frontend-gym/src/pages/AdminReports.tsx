import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText,
  Tag,
  Users,
  PieChart,
  LogOut,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { orderAPI } from '../api';
import { Order } from '../types';

export const AdminReports = () => {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    orderAPI.getAll().then(setOrders).catch(() => {});
  }, []);

  const completedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Completed');
  }, [orders]);

  const { chartData, totalRevenue, totalOrders } = useMemo(() => {
    let dataMap = new Map<string, number>();
    let totalRev = 0;
    
    completedOrders.forEach(order => {
      const date = new Date(order.order_date);
      const rev = order.total_amount - (order.discount_amount || 0);
      totalRev += rev;

      let key = '';
      if (period === 'day') {
        key = date.toLocaleDateString('vi-VN');
      } else if (period === 'month') {
        key = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
      } else if (period === 'year') {
        key = `${date.getFullYear()}`;
      } else if (period === 'week') {
        // Lấy tuần trong năm (đơn giản hóa)
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
        key = `Tuần ${weekNo}/${date.getFullYear()}`;
      }

      dataMap.set(key, (dataMap.get(key) || 0) + rev);
    });

    // Sắp xếp dữ liệu theo thứ tự xuất hiện (hoặc ngày tháng, ở đây đơn giản hoá là parse key nếu có thể)
    // Tạm thời để nguyên Map sang mảng
    const dataList = Array.from(dataMap.entries()).map(([label, value]) => ({ label, value }));
    
    // Nếu period = day, lấy 7 ngày gần nhất để biểu đồ không bị quá dài
    if (period === 'day' && dataList.length > 7) {
      dataList.splice(0, dataList.length - 7);
    }

    return { 
      chartData: dataList.reverse(), // Đảo ngược nếu order_date giảm dần
      totalRevenue: totalRev,
      totalOrders: completedOrders.length
    };
  }, [completedOrders, period]);

  if (!isAdmin) {
    return <Navigate to="/account" />;
  }

  const maxRevenue = Math.max(...chartData.map(d => d.value), 1);

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
            { icon: PieChart, label: 'Báo cáo', path: '/admin/reports', active: true },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-4 rounded transition-all group ${
                item.active 
                  ? 'bg-white text-brand-dark font-black' 
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
            className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest">Rời đi</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F5F5F5]">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4"></div>
          <div className="flex items-center gap-6">
             <div className="text-right hidden md:block">
               <p className="text-xs font-black uppercase tracking-tighter leading-none">{user?.name}</p>
               <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Super Admin</p>
             </div>
             <div className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center text-white font-black text-xs uppercase shadow-lg shadow-black/20">
               {user?.name.substring(0, 2).toUpperCase()}
             </div>
          </div>
        </header>

        <div className="p-10">
          <div className="mb-12">
            <h1 className="text-[46px] font-black uppercase tracking-tighter text-brand-dark leading-none">Báo cáo doanh thu</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Thống kê doanh thu theo {period === 'day' ? 'ngày' : period === 'week' ? 'tuần' : period === 'month' ? 'tháng' : 'năm'}</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <DollarSign className="text-green-500" size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng doanh thu</p>
                <h3 className="text-2xl font-black text-brand-dark">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
                </h3>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="text-blue-500" size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Đơn hoàn thành</p>
                <h3 className="text-2xl font-black text-brand-dark">{totalOrders}</h3>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-purple-500" size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá trị trung bình</p>
                <h3 className="text-2xl font-black text-brand-dark">
                  {totalOrders > 0 
                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue / totalOrders)
                    : '0 ₫'}
                </h3>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
              <h2 className="text-xl font-black uppercase tracking-tighter text-brand-dark flex items-center gap-3">
                <PieChart size={24} />
                Biểu đồ doanh thu
              </h2>
              
              <div className="flex bg-gray-50 p-1 rounded-lg">
                {[
                  { id: 'day', label: 'Ngày' },
                  { id: 'week', label: 'Tuần' },
                  { id: 'month', label: 'Tháng' },
                  { id: 'year', label: 'Năm' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id as any)}
                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${
                      period === p.id 
                        ? 'bg-white text-brand-dark shadow-sm' 
                        : 'text-gray-400 hover:text-brand-dark'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-80 flex items-end gap-2 md:gap-4 mt-8 pt-4 border-l border-b border-gray-100 px-4 pb-2 relative">
              {chartData.length > 0 ? chartData.map((data, index) => {
                const heightPercent = Math.max((data.value / maxRevenue) * 100, 2);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-dark text-white text-[10px] font-black px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none z-10 shadow-xl">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.value)}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-dark rotate-45"></div>
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className="w-full max-w-[60px] bg-brand-dark hover:bg-black rounded-t-sm transition-all duration-500 ease-out"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    
                    {/* Label */}
                    <div className="absolute -bottom-8 text-[9px] font-bold text-gray-400 uppercase tracking-wider text-center w-full truncate px-1">
                      {data.label}
                    </div>
                  </div>
                );
              }) : (
                <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-300">
                  <Calendar size={48} className="mb-4 opacity-50" />
                  <p className="text-xs font-black uppercase tracking-widest">Không có dữ liệu trong khoảng thời gian này</p>
                </div>
              )}
            </div>
            <div className="mt-10 flex justify-center items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <div className="w-3 h-3 bg-brand-dark rounded-sm"></div>
                Doanh thu (VND)
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
