import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Plus,
  Trash2,
  Edit,
  X,
  LayoutDashboard,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  ArrowUpRight,
  Mail,
  Phone,
  Calendar,
  Shield,
  FileText,
  Tag,
  PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer } from '../types';
import { customerAPI } from '../api';
import { useAuth } from '../AuthContext';
import { Navigate, Link } from 'react-router-dom';

export const AdminCustomers = () => {
  const { user, isAdmin, logout } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});

  useEffect(() => {
    customerAPI.getAll().then(setCustomers).catch(() => {});
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  const handleCreate = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
      birth_date: '1990-01-01',
      gender: 'male',
    });
    setSelectedCustomerId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setFormData(customer);
    setSelectedCustomerId(customer.customer_id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await customerAPI.delete(id);
        const updated = await customerAPI.getAll();
        setCustomers(updated);
      } catch {
        alert('Lỗi khi xóa khách hàng');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCustomerId) {
        await customerAPI.update(selectedCustomerId, formData);
      }
      const updated = await customerAPI.getAll();
      setCustomers(updated);
      setIsFormOpen(false);
    } catch {
      alert('Lỗi khi lưu khách hàng');
    }
  };

  if (!isAdmin) {
    return <Navigate to="/account" />;
  }

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
            { icon: Users, label: 'Khách hàng', path: '/admin/customers', active: true },
            { icon: PieChart, label: 'Báo cáo', path: '#', active: false },
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
          <div className="flex items-center gap-4">
             {/* Breadcrumbs removed */}
          </div>
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-[46px] font-black uppercase tracking-tighter text-brand-dark leading-none">Khách hàng</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Tổng số {customers.length} khách hàng đã đăng ký</p>
            </div>
            <button 
              onClick={handleCreate}
              className="bg-brand-dark hover:scale-[1.02] active:scale-[0.98] text-white px-8 py-4 rounded-full flex items-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/10"
            >
              <Plus size={18} /> Thêm khách hàng mới
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             {/* Search Bar Area */}
             <div className="p-8 flex flex-wrap gap-6 items-center border-b border-gray-50">
              <div className="flex-1 max-w-sm relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  placeholder="TÌM KIẾM KHÁCH HÀNG..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F5F5F5] border-none py-4 pl-12 pr-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">ID</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Tên khách hàng</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Số điện thoại</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Email</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.customer_id} className="hover:bg-gray-50/80 transition-colors group border-b border-gray-50 last:border-none">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <span className="text-xs font-black text-brand-dark">#{customer.customer_id}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-sm font-black uppercase tracking-tight text-brand-dark">{customer.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 italic uppercase">VIP Member</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-brand-dark uppercase tracking-widest">{customer.phone || '090-XXX-XXXX'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-gray-600 lowercase">{customer.email}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-gray-400">
                          <button onClick={() => handleEdit(customer)} className="p-2 hover:bg-black hover:text-white rounded-xl transition-all" title="Chỉnh sửa"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(customer.customer_id)} className="p-2 hover:bg-red-600 hover:text-white rounded-xl transition-all" title="Xóa"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setIsFormOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-[22px] font-black uppercase tracking-tighter">{selectedCustomerId ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}</h2>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Họ và tên</label>
                      <input 
                        required type="text" value={formData.name || ''} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl font-bold focus:ring-2 focus:ring-brand-dark/5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Email</label>
                      <input 
                        required type="email" value={formData.email || ''} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl font-bold focus:ring-2 focus:ring-brand-dark/5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Số điện thoại</label>
                      <input 
                        required type="tel" value={formData.phone || ''} 
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl font-bold focus:ring-2 focus:ring-brand-dark/5"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Địa chỉ</label>
                      <input 
                        required type="text" value={formData.address || ''} 
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl font-bold focus:ring-2 focus:ring-brand-dark/5"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-brand-dark text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform">
                    {selectedCustomerId ? 'Cập nhật thông tin' : 'Thêm khách hàng'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
