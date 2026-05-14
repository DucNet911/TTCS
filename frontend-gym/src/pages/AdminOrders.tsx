import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ChevronRight, 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  X,
  Eye,
  Trash2,
  Edit,
  Plus,
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  ArrowUpRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Tag,
  PieChart,
  Phone,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderItem, Customer } from '../types';
import { orderAPI, customerAPI, paymentAPI } from '../api';
import { useAuth } from '../AuthContext';
import { Navigate, Link } from 'react-router-dom';

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-yellow-50 text-yellow-600 border-yellow-200',
  'Confirmed': 'bg-blue-50 text-blue-600 border-blue-200',
  'Shipping': 'bg-purple-50 text-purple-600 border-purple-200',
  'Completed': 'bg-green-50 text-green-600 border-green-200',
  'Canceled': 'bg-red-50 text-red-600 border-red-100',
};

const STATUS_LABELS: Record<string, string> = {
  'Pending': 'Chờ xác nhận',
  'Confirmed': 'Đang chuẩn bị',
  'Shipping': 'Đang giao hàng',
  'Completed': 'Hoàn thành',
  'Canceled': 'Đã hủy',
};

const NEXT_STATUS: Record<string, string> = {
  'Pending': 'Confirmed',
  'Confirmed': 'Shipping',
  'Shipping': 'Completed',
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  'Pending': 'Xác nhận đơn hàng',
  'Confirmed': 'Bắt đầu giao hàng',
  'Shipping': 'Hoàn thành giao hàng',
};

export const AdminOrders = () => {
  const { user, isAdmin, isOwner, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Expand order items
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<number, any[]>>({});
  const [itemsLoading, setItemsLoading] = useState(false);

  const toggleOrderExpand = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    if (!orderItemsMap[orderId]) {
      setItemsLoading(true);
      try {
        const detail = await orderAPI.getById(orderId);
        setOrderItemsMap(prev => ({ ...prev, [orderId]: detail.items || [] }));
      } catch {
        setOrderItemsMap(prev => ({ ...prev, [orderId]: [] }));
      } finally {
        setItemsLoading(false);
      }
    }
  };

  // Sort state
  const [sortField, setSortField] = useState<'order_id' | 'order_date' | 'customer_name' | 'total_amount' | 'status'>('order_id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-30" />;
    return sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allSkus, setAllSkus] = useState<any[]>([]);

  // New Order Form State
  const [newOrderForm, setNewOrderForm] = useState<{
    customerId: number | '';
    selectedSkuId: number | '';
    items: { sku_id: number; quantity: number; price: number }[];
  }>({
    customerId: '',
    selectedSkuId: '',
    items: []
  });

  // Fetch data from API on mount
  useEffect(() => {
    orderAPI.getAll().then(setOrders).catch(() => {});
    customerAPI.getAll().then(setCustomers).catch(() => {});
    fetch('http://localhost:5000/api/allProducts').then(r => r.json()).then(setAllProducts).catch(() => {});
    fetch('http://localhost:5000/api/product-skus').then(r => r.json()).then(setAllSkus).catch(() => {});
  }, []);

  const filteredOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      const matchesSearch = 
        order.order_id.toString().includes(searchQuery) ||
        (order.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shipping_address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' 
        || (statusFilter === 'payment_pending' 
            ? (order.payment_status === 'Pending' && order.status !== 'Canceled' && order.status !== 'Pending')
            : order.status === statusFilter);
      
      return matchesSearch && matchesStatus;
    });

    // Sắp xếp
    return filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'order_id': cmp = a.order_id - b.order_id; break;
        case 'order_date': cmp = new Date(a.order_date).getTime() - new Date(b.order_date).getTime(); break;
        case 'customer_name': cmp = (a.customer_name || '').localeCompare(b.customer_name || ''); break;
        case 'total_amount': cmp = a.total_amount - b.total_amount; break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [orders, searchQuery, statusFilter, sortField, sortDirection]);

  const handleStatusChange = async (orderId: number, newStatus: Order['status']) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      const updated = await orderAPI.getAll();
      setOrders(updated);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const getOrderItems = (orderId: number): any[] => {
    return orderItemsMap[orderId] || [];
  };

  useEffect(() => {
    if (selectedOrderId && !orderItemsMap[selectedOrderId]) {
      orderAPI.getById(selectedOrderId).then(detail => {
        setOrderItemsMap(prev => ({ ...prev, [selectedOrderId]: detail.items || [] }));
      }).catch(() => {});
    }
  }, [selectedOrderId]);

  if (!isAdmin) {
    return <Navigate to="/account" />;
  }

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      try {
        await orderAPI.delete(id);
        const updated = await orderAPI.getAll();
        setOrders(updated);
        if (selectedOrderId === id) setSelectedOrderId(null);
      } catch {
        alert('Lỗi khi xóa đơn hàng');
      }
    }
  };

  const activeOrder = orders.find(o => o.order_id === selectedOrderId);

  const handlePrintInvoice = async () => {
    if (!activeOrder) return;
    
    let orderItems = orderItemsMap[activeOrder.order_id];
    if (!orderItems) {
      try {
        const detail = await orderAPI.getById(activeOrder.order_id);
        orderItems = detail.items || [];
        setOrderItemsMap(prev => ({ ...prev, [activeOrder.order_id]: orderItems }));
      } catch {
        orderItems = [];
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>Hóa đơn #${activeOrder.order_id}</title>
          <style>
            body { font-family: 'Inter', -apple-system, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
            .header p { margin: 5px 0 0; color: #666; font-size: 12px; font-weight: bold; letter-spacing: 1px; }
            .info { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .info div { width: 48%; }
            .info h3 { font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 2px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .info p { margin: 5px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 16px 12px; text-align: left; border-bottom: 1px solid #eee; }
            th { font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 1px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total { text-align: right; margin-top: 30px; border-top: 2px solid #111; padding-top: 20px; }
            .total p { margin: 5px 0; font-size: 14px; }
            .total .grand-total { font-size: 24px; font-weight: 900; margin-top: 10px; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FITGEAR</h1>
            <p>HÓA ĐƠN MUA HÀNG</p>
            <p style="margin-top: 10px; color: #111;">MÃ ĐƠN: #${activeOrder.order_id} - NGÀY: ${new Date(activeOrder.order_date).toLocaleString('vi-VN')}</p>
          </div>
          
          <div class="info">
            <div>
              <h3>Khách hàng</h3>
              <p><strong>${activeOrder.customer_name}</strong></p>
              <p>${activeOrder.customer_email}</p>
              <p>${activeOrder.customer_phone || ''}</p>
            </div>
            <div>
              <h3>Giao hàng đến</h3>
              <p>${activeOrder.shipping_address || 'Nhận tại cửa hàng'}</p>
            </div>
          </div>
  
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th class="text-center">SL</th>
                <th class="text-right">Đơn giá</th>
                <th class="text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.map((item: any) => `
                <tr>
                  <td>
                    <strong>${item.product_name}</strong><br/>
                    <span style="font-size:12px;color:#666;font-family:monospace;">SKU: ${item.sku_code || 'N/A'}</span>
                    <span style="font-size:12px;color:#666;"> | Size: ${item.size_name || '-'} | Color: ${item.color_name || '-'}</span>
                  </td>
                  <td class="text-center"><strong>${item.quantity}</strong></td>
                  <td class="text-right">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_at_order)}</td>
                  <td class="text-right"><strong>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.quantity * item.price_at_order)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
  
          <div class="total">
            ${activeOrder.discount_amount ? `<p>Giảm giá: <strong>-${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeOrder.discount_amount)}</strong></p>` : ''}
            <p class="grand-total">TỔNG CỘNG: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeOrder.total_amount)}</p>
          </div>
  
          <div class="footer">
            <p><strong>Cảm ơn quý khách đã mua sắm tại FITGEAR!</strong></p>
            <p>Mọi thắc mắc xin liên hệ: support@fitgear.com | Hotline: 1900 1234</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Sidebar - Brand Dark Style */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col sticky top-0 h-screen hidden lg:flex">
        <div className="h-20 px-8 border-b border-white/5 flex items-center">
          <Link to="/" className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap">FitGear Admin</Link>
        </div>
        
        <nav className="flex-1 mt-8 px-4 space-y-2">
          {[
            { icon: FileText, label: 'Đơn hàng', path: '/admin/orders', active: true },
            { icon: Tag, label: 'Sản phẩm', path: '/admin/products', active: false },
            { icon: Users, label: 'Khách hàng', path: '/admin/customers', active: false },
            { icon: MessageSquare, label: 'Đánh giá', path: '/admin/reviews', active: false },
            ...(isOwner ? [{ icon: PieChart, label: 'Báo cáo', path: '/admin/reports', active: false }] : []),
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
            className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-white transition-[]"
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
               <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{user?.role === 'admin' ? 'Super Admin' : 'Nhân viên'}</p>
             </div>
             <div className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center text-white font-black text-xs uppercase shadow-lg shadow-black/20">
               {user?.name.substring(0, 2).toUpperCase()}
             </div>
          </div>
        </header>

        <div className="p-10">
          {!isAddOrderOpen ? (
            <>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <h1 className="text-[46px] font-black uppercase tracking-tighter text-brand-dark leading-none">Quản lý Đơn hàng</h1>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Tổng số {orders.length} đơn hàng đã đăng ký</p>
                </div>
                <button 
                  onClick={() => setIsAddOrderOpen(true)}
                  className="bg-brand-dark hover:scale-[1.02] active:scale-[0.98] text-white px-8 py-4 rounded-full flex items-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/10"
                >
                  <Plus size={18} /> Tạo đơn hàng mới
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabs Filter */}
                <div className="flex border-b border-gray-100 px-6 overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'Pending', label: 'Chờ xác nhận' },
                    { id: 'Confirmed', label: 'Đang chuẩn bị' },
                    { id: 'Shipping', label: 'Đang giao hàng' },
                    { id: 'payment_pending', label: 'Chờ thanh toán' },
                    { id: 'Completed', label: 'Hoàn thành' },
                    { id: 'Canceled', label: 'Đã hủy' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setStatusFilter(tab.id as any); setCurrentPage(1); }}
                      className={`px-4 py-4 text-sm font-black uppercase tracking-widest transition-all relative min-w-fit ${
                        statusFilter === tab.id 
                          ? 'text-brand-dark border-b-2 border-brand-dark' 
                          : 'text-gray-400 hover:text-brand-dark'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Bar Area */}
                <div className="p-6 flex flex-wrap gap-4 items-center bg-gray-50/10">
                  <div className="flex-1 max-w-sm relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Tìm mã đơn hàng..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="w-full bg-white border border-gray-200 py-2 pl-10 pr-4 rounded-md text-sm outline-none focus:border-brand-dark transition-all shadow-sm"
                    />
                  </div>
                  <button className="bg-brand-dark border border-brand-dark px-6 py-2 rounded-md text-xs font-black uppercase tracking-widest text-white hover:bg-black/80 shadow-sm transition-[]">
                    Tìm kiếm
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-[#F8F9FA]">
                      <tr>
                        <th onClick={() => handleSort('order_id')} className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 border-b border-gray-100 cursor-pointer hover:text-brand-dark transition-colors select-none"><div className="flex items-center gap-1">Mã ĐH <SortIcon field="order_id" /></div></th>
                        <th onClick={() => handleSort('order_date')} className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 border-b border-gray-100 cursor-pointer hover:text-brand-dark transition-colors select-none"><div className="flex items-center gap-1">Ngày tạo <SortIcon field="order_date" /></div></th>
                        <th onClick={() => handleSort('customer_name')} className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 border-b border-gray-100 cursor-pointer hover:text-brand-dark transition-colors select-none"><div className="flex items-center gap-1">Khách hàng <SortIcon field="customer_name" /></div></th>
                        <th onClick={() => handleSort('total_amount')} className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 border-b border-gray-100 text-right cursor-pointer hover:text-brand-dark transition-colors select-none"><div className="flex items-center justify-end gap-1">Tổng tiền <SortIcon field="total_amount" /></div></th>
                        <th onClick={() => handleSort('status')} className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 border-b border-gray-100 text-center cursor-pointer hover:text-brand-dark transition-colors select-none"><div className="flex items-center justify-center gap-1">Trạng thái <SortIcon field="status" /></div></th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 border-b border-gray-100 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(() => {
                        const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
                        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
                        const paginatedOrders = filteredOrders.slice(startIdx, startIdx + ITEMS_PER_PAGE);
                        return paginatedOrders.length > 0 ? paginatedOrders.map((order) => {
                        const isExpanded = expandedOrderId === order.order_id;
                        const orderItems = orderItemsMap[order.order_id] || [];
                        return (
                          <React.Fragment key={order.order_id}>
                          <tr className={`hover:bg-gray-50/80 transition-all group ${isExpanded ? 'bg-gray-50/50' : ''}`}>
                            <td className="px-6 py-4 border-b border-gray-50">
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleOrderExpand(order.order_id)} className="p-1 hover:bg-gray-200 rounded-md transition-all flex-shrink-0" title="Xem sản phẩm">
                                  {isExpanded ? <ChevronDown size={14} className="text-brand-dark" /> : <ChevronRight size={14} className="text-gray-400" />}
                                </button>
                                <button 
                                  onClick={() => setSelectedOrderId(order.order_id)}
                                  className="text-sm font-black text-brand-dark hover:underline uppercase tracking-tight"
                                >
                                  #{order.order_id}
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 border-b border-gray-50">
                              <p className="text-sm font-bold text-gray-400 capitalize">{new Date(order.order_date).toLocaleString('vi-VN')}</p>
                            </td>
                            <td className="px-6 py-4 border-b border-gray-50">
                              <p className="text-sm font-black text-brand-dark uppercase tracking-tight">{order.customer_name || ''}</p>
                            </td>
                            <td className="px-6 py-4 border-b border-gray-50 text-right">
                              <p className="text-sm font-black text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}</p>
                            </td>
                            <td className="px-6 py-4 border-b border-gray-50 text-center">
                              <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${STATUS_COLORS[order.status] || 'bg-white text-gray-600 border-gray-200'}`}>
                                {STATUS_LABELS[order.status] || order.status}
                              </span>
                              {order.payment_status === 'Pending' && order.status !== 'Pending' && order.status !== 'Canceled' && (
                                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-orange-50 text-orange-600 border-orange-200 mt-1 inline-block">
                                  {order.payment_method === 'COD' ? 'Chờ thu tiền' : 'Chờ CK'}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 border-b border-gray-50 text-right">
                              <div className="flex items-center justify-end gap-3 text-gray-400">
                                 <button onClick={() => setSelectedOrderId(order.order_id)} className="p-2 hover:bg-black hover:text-white rounded-lg transition-all" title="Chi tiết"><Edit size={16} /></button>
                                 <button 
                                  onClick={() => handleDelete(order.order_id)} 
                                  className="p-2 hover:bg-red-600 hover:text-white rounded-lg transition-all" 
                                  title="Xóa"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                            </td>
                          </tr>
                          {/* Order Items Sub-rows */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="px-0 py-0">
                                <div className="bg-gray-50/80 border-y border-gray-100">
                                  {itemsLoading && orderItems.length === 0 ? (
                                    <div className="px-12 py-6 text-center">
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Đang tải sản phẩm...</p>
                                    </div>
                                  ) : orderItems.length > 0 ? (
                                    <table className="w-full">
                                      <thead>
                                        <tr className="bg-gray-100/60">
                                          <th className="px-10 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">Sản phẩm</th>
                                          <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">Phiên bản</th>
                                          <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Số lượng</th>
                                          <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Đơn giá</th>
                                          <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Thành tiền</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {orderItems.map((item: any, idx: number) => (
                                          <tr key={idx} className="border-t border-gray-100/80 hover:bg-white/60 transition-colors">
                                            <td className="px-10 py-3">
                                              <div className="flex items-center gap-3">
                                                {item.image_url && (
                                                  <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                                                    <img src={item.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                  </div>
                                                )}
                                                <span className="text-[10px] font-black text-brand-dark uppercase">{item.product_name}</span>
                                              </div>
                                            </td>
                                            <td className="px-4 py-3">
                                              <div className="flex items-center gap-2">
                                                {item.color_name && item.hex_code && <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: item.hex_code }}></div>}
                                                <span className="text-[10px] font-bold text-gray-500">
                                                  {[item.size_name, item.color_name].filter(Boolean).join(' / ') || '—'}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                              <span className="text-[10px] font-black text-brand-dark">x{item.quantity}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                              <span className="text-[10px] font-bold text-gray-500">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_at_order)}
                                              </span>
                                            </td>
                                            <td className="px-8 py-3 text-right">
                                              <span className="text-[10px] font-black text-brand-dark">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_at_order * item.quantity)}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <div className="px-12 py-6 text-center">
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Không có sản phẩm trong đơn hàng này</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                          </React.Fragment>
                        );
                      }) : (
                        <tr>
                          <td colSpan={6} className="px-8 py-20 text-center text-gray-400 text-sm">
                            Không tìm thấy đơn hàng nào
                          </td>
                        </tr>
                      );
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {(() => {
                  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
                  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
                  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, filteredOrders.length);
                  if (filteredOrders.length === 0) return null;
                  return (
                    <div className="px-8 py-6 flex items-center justify-between border-t border-gray-50 bg-gray-50/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Đang hiển thị {startIdx + 1} đến {endIdx} của {filteredOrders.length} đơn hàng</p>
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
                  );
                })()}
              </div>
            </>
          ) : (
            <div className="max-w-6xl mx-auto">
              {/* Sub Title */}
              <div className="flex items-center gap-4 mb-10">
                <button onClick={() => setIsAddOrderOpen(false)} className="text-brand-dark hover:translate-x-[-4px] transition-transform">
                  <ChevronRight size={32} className="rotate-180" />
                </button>
                <h1 className="text-[34px] font-black uppercase tracking-tighter text-brand-dark leading-none">Tạo đơn hàng mới</h1>
              </div>

              <div className="space-y-8">
                {/* Customer Info Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-10 py-6 border-b border-gray-50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center text-white shadow-lg shadow-black/10">
                      <User size={18} />
                    </div>
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-brand-dark">Thông tin khách hàng</h3>
                  </div>
                  
                  <div className="p-10">
                    <div className="max-w-xl">
                      <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Lựa chọn khách hàng</label>
                      <div className="relative">
                        <select 
                          value={newOrderForm.customerId}
                          onChange={(e) => setNewOrderForm({ ...newOrderForm, customerId: e.target.value ? parseInt(e.target.value) : '' })}
                          className="w-full bg-[#F5F5F5] border-none py-4 px-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none cursor-pointer"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
                        >
                          <option value="">-- Chọn khách hàng --</option>
                          {customers.map(c => (
                            <option key={c.customer_id} value={c.customer_id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <AnimatePresence>
                        {newOrderForm.customerId && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 p-8 bg-brand-light/50 rounded-3xl space-y-4 border border-brand-light/50"
                          >
                            <div className="flex flex-wrap gap-8">
                              <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                  <Phone size={12} className="text-brand-dark" /> Số điện thoại
                                </p>
                                <p className="text-[11px] font-black text-brand-dark">{customers.find(c => c.customer_id === newOrderForm.customerId)?.phone || '090-XXX-XXXX'}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                  <Mail size={12} className="text-brand-dark" /> Email
                                </p>
                                <p className="text-[11px] font-black text-brand-dark lowercase">{customers.find(c => c.customer_id === newOrderForm.customerId)?.email}</p>
                              </div>
                              <div className="flex-1 min-w-full md:min-w-0 space-y-1">
                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                  <MapPin size={12} className="text-brand-dark" /> Địa chỉ giao hàng
                                </p>
                                <p className="text-[11px] font-black text-brand-dark uppercase tracking-tight">{customers.find(c => c.customer_id === newOrderForm.customerId)?.address}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Product Info Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-10 py-6 border-b border-gray-50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center text-white shadow-lg shadow-black/10">
                      <Package size={18} />
                    </div>
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-brand-dark">Thông tin sản phẩm</h3>
                  </div>
                  
                  <div className="p-10">
                    <div className="flex flex-col md:flex-row gap-6 mb-10">
                      <div className="flex-1 relative">
                        <select 
                          value={newOrderForm.selectedSkuId}
                          onChange={(e) => setNewOrderForm({ ...newOrderForm, selectedSkuId: e.target.value ? parseInt(e.target.value) : '' })}
                          className="w-full bg-[#F5F5F5] border-none py-4 px-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none cursor-pointer"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {allSkus.map(sku => {
                            const product = allProducts.find(p => p.product_id === sku.product_id);
                            return (
                              <option key={sku.sku_id} value={sku.sku_id}>
                                {product?.name || sku.product_name || `SP#${sku.product_id}`} ({sku.size_name || 'N/A'} / {sku.color_name || 'N/A'})
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <button 
                        onClick={() => {
                          if (!newOrderForm.selectedSkuId) return;
                          const sku = allSkus.find(s => s.sku_id === newOrderForm.selectedSkuId);
                          if (!sku) return;
                          
                          const existingItemIdx = newOrderForm.items.findIndex(item => item.sku_id === sku.sku_id);
                          if (existingItemIdx > -1) {
                            const newItems = [...newOrderForm.items];
                            newItems[existingItemIdx].quantity += 1;
                            setNewOrderForm({ ...newOrderForm, items: newItems });
                          } else {
                            setNewOrderForm({ 
                              ...newOrderForm, 
                              items: [...newOrderForm.items, { sku_id: sku.sku_id, quantity: 1, price: sku.price }] 
                            });
                          }
                        }}
                        className="bg-brand-dark hover:scale-[1.02] active:scale-[0.98] text-white px-10 py-4 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/10 h-[56px] min-w-fit"
                      >
                        <Plus size={18} /> Chọn
                      </button>
                    </div>

                    <AnimatePresence>
                      {newOrderForm.selectedSkuId && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mb-10 p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-wrap gap-10"
                        >
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                              <Tag size={12} className="text-brand-dark" /> Giá niêm yết
                            </p>
                            <p className="text-[14px] font-black text-brand-dark">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(allSkus.find(s => s.sku_id === newOrderForm.selectedSkuId)?.price || 0)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                              <Package size={12} className="text-brand-dark" /> Trạng thái kho
                            </p>
                            <p className="text-[11px] font-black text-brand-dark uppercase tracking-widest">
                              Còn {allSkus.find(s => s.sku_id === newOrderForm.selectedSkuId)?.stock || 100} sản phẩm
                            </p>
                          </div>
                          <div className="flex-1 min-w-full lg:min-w-0 space-y-1">
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                              <AlertCircle size={12} className="text-brand-dark" /> Đặc điểm sản phẩm
                            </p>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight italic">
                              {allProducts.find(p => p.product_id === allSkus.find(s => s.sku_id === newOrderForm.selectedSkuId)?.product_id)?.description || 'Sản phẩm cao cấp FitGear với chất liệu thoáng khí.'}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Items Table */}
                    <div className="border border-gray-50 rounded-3xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">STT</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Tên sản phẩm</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 text-center">Số lượng</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 text-right">Đơn giá</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 text-right">Thành tiền</th>
                            <th className="px-8 py-5"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {newOrderForm.items.length > 0 ? newOrderForm.items.map((item, idx) => {
                            const sku = allSkus.find(s => s.sku_id === item.sku_id);
                            const product = allProducts.find(p => p.product_id === sku?.product_id);
                            return (
                              <tr key={item.sku_id} className="bg-white hover:bg-gray-50/50 transition-[] group">
                                <td className="px-8 py-5">
                                  <span className="text-[10px] font-black text-gray-300">#{idx + 1}</span>
                                </td>
                                <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <p className="text-[11px] font-black uppercase tracking-tight text-brand-dark">{product?.name}</p>
                                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Size: {sku?.size_name || 'N/A'} / {sku?.color_name || 'N/A'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-5">
                                  <div className="flex items-center justify-center">
                                    <div className="flex items-center bg-gray-100 rounded-xl px-2 h-10 w-24">
                                      <button 
                                        onClick={() => {
                                          if (item.quantity <= 1) return;
                                          const newItems = [...newOrderForm.items];
                                          newItems[idx].quantity -= 1;
                                          setNewOrderForm({ ...newOrderForm, items: newItems });
                                        }}
                                        className="p-2 text-gray-400 hover:text-brand-dark transition-[]"
                                      >-</button>
                                      <input 
                                        type="number" 
                                        value={item.quantity} 
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value);
                                          if (val < 1) return;
                                          const newItems = [...newOrderForm.items];
                                          newItems[idx].quantity = val;
                                          setNewOrderForm({ ...newOrderForm, items: newItems });
                                        }}
                                        className="bg-transparent border-none w-full text-center text-xs font-black outline-none"
                                      />
                                      <button 
                                        onClick={() => {
                                          const newItems = [...newOrderForm.items];
                                          newItems[idx].quantity += 1;
                                          setNewOrderForm({ ...newOrderForm, items: newItems });
                                        }}
                                        className="p-2 text-gray-400 hover:text-brand-dark transition-[]"
                                      >+</button>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                  </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  <span className="text-xs font-black tracking-tight text-brand-dark">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                                  </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  <button 
                                    onClick={() => {
                                      const newItems = newOrderForm.items.filter((_, i) => i !== idx);
                                      setNewOrderForm({ ...newOrderForm, items: newItems });
                                    }}
                                    className="p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          }) : (
                            <tr>
                              <td colSpan={6} className="px-8 py-20 text-center text-gray-400 text-xs font-bold uppercase tracking-widest italic bg-gray-50/20">
                                Chưa có sản phẩm nào được chọn
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-10 flex flex-col items-end gap-2 border-t border-gray-50 pt-10">
                      <div className="flex items-center gap-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tổng số lượng sản phẩm:</span>
                        <span className="text-sm font-black text-brand-dark">{newOrderForm.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                      </div>
                      <div className="flex items-center gap-10 mt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark">Tổng khách phải trả:</span>
                        <span className="text-4xl font-black text-red-600 tracking-tighter">
                           {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                             newOrderForm.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
                           )}
                        </span>
                      </div>
                      <div className="mt-10 w-full md:w-fit flex gap-4">
                         <button 
                          onClick={() => setIsAddOrderOpen(false)}
                          className="bg-white border-2 border-gray-100 text-gray-400 hover:bg-gray-50 px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                          Hủy bỏ
                        </button>
                         <button 
                          onClick={async () => {
                            if (!newOrderForm.customerId || newOrderForm.items.length === 0) {
                              alert('Vui lòng chọn khách hàng và ít nhất một sản phẩm');
                              return;
                            }
                            
                            const customer = customers.find(c => c.customer_id === newOrderForm.customerId);
                            
                            try {
                              await orderAPI.create({
                                customer_id: newOrderForm.customerId,
                                total_amount: newOrderForm.items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                                status: 'Pending',
                                shipping_address: customer?.address || '',
                                payment_method: 'COD',
                                items: newOrderForm.items.map(item => ({
                                  sku_id: item.sku_id,
                                  quantity: item.quantity,
                                  price_at_order: item.price
                                }))
                              });
                              
                              const updated = await orderAPI.getAll();
                              setOrders(updated);
                              setNewOrderForm({ customerId: '', selectedSkuId: '', items: [] });
                              setIsAddOrderOpen(false);
                            } catch (err) {
                              alert('Lỗi khi tạo đơn hàng');
                            }
                          }}
                          className="bg-brand-dark hover:scale-[1.02] active:scale-[0.98] text-white px-12 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-black/20"
                        >
                          Xác nhận tạo Đơn hàng
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Order Modal / Overlay - MOVED TO MAIN CONTENT */}

        <AnimatePresence>
          {activeOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end"
              onClick={() => setSelectedOrderId(null)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-full max-w-xl bg-white h-screen shadow-2xl p-8 md:p-12 overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="text-[28px] md:text-[34px] font-black uppercase tracking-tighter mb-2 text-brand-dark">Chi tiết đơn hàng</h2>
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                       <Clock size={12} /> #ORD-{activeOrder.order_id}
                    </p>
                  </div>
                  <button onClick={() => setSelectedOrderId(null)} className="p-3 hover:bg-gray-100 rounded-full transition-[] text-gray-400 hover:text-brand-dark">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-12">
                  <section>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 mb-6 border-b border-gray-50 pb-4">Thông tin khách hàng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Họ tên</p>
                         <p className="font-black uppercase tracking-tight text-brand-dark">{customers.find(c => c.customer_id === activeOrder.customer_id)?.name}</p>
                       </div>
                       <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email</p>
                         <p className="font-bold text-sm text-gray-600">{customers.find(c => c.customer_id === activeOrder.customer_id)?.email}</p>
                       </div>
                       <div className="col-span-1 md:col-span-2 space-y-1">
                         <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Địa chỉ giao hàng</p>
                         <p className="font-bold text-sm leading-relaxed text-gray-600">{activeOrder.shipping_address}</p>
                       </div>
                    </div>
                  </section>

                   <section>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 mb-6 border-b border-gray-50 pb-4">Sản phẩm</h3>
                    <div className="space-y-6">
                      {getOrderItems(activeOrder.order_id).map((item, i) => (
                        <div key={i} className="flex gap-6 items-center group">
                          <div className="w-20 h-24 bg-brand-light rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                            {item.image && <img src={item.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-black uppercase tracking-tight text-brand-dark">{item.product?.name}</h4>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1 space-x-2">
                              <span>Kích cỡ: {item.size?.name}</span>
                              <span className="opacity-20">|</span>
                              <span>Màu: {item.color?.name}</span>
                              <span className="opacity-20">|</span>
                              <span className="text-brand-dark">x{item.quantity}</span>
                            </p>
                            <p className="text-base font-black mt-3 text-brand-dark">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_at_order)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 mb-6 border-b border-gray-50 pb-4">Trạng thái đơn hàng</h3>
                    
                    {/* Current status */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[activeOrder.status] || ''}`}>
                        {STATUS_LABELS[activeOrder.status] || activeOrder.status}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        PTTT: {activeOrder.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : activeOrder.payment_method === 'Bank Transfer' ? 'Chuyển khoản NH' : activeOrder.payment_method}
                      </span>
                    </div>

                    {/* Payment status */}
                    {activeOrder.payment_status && activeOrder.status !== 'Canceled' && (
                      <div className={`p-4 rounded-2xl mb-6 border ${
                        activeOrder.payment_status === 'Success' ? 'bg-green-50 border-green-200' :
                        activeOrder.payment_status === 'Failed' ? 'bg-red-50 border-red-200' :
                        'bg-orange-50 border-orange-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Thanh toán</p>
                            <p className={`text-xs font-black uppercase ${
                              activeOrder.payment_status === 'Success' ? 'text-green-600' :
                              activeOrder.payment_status === 'Failed' ? 'text-red-600' :
                              'text-orange-600'
                            }`}>
                              {activeOrder.payment_status === 'Success' ? 'Đã thanh toán' :
                               activeOrder.payment_status === 'Failed' ? 'Thất bại' :
                               activeOrder.payment_method === 'COD' ? 'Chờ thu tiền khi giao' : 'Chờ xác nhận chuyển khoản'}
                            </p>
                          </div>
                          {activeOrder.payment_status === 'Pending' && activeOrder.payment_method === 'Bank Transfer' && activeOrder.payment_id && (
                            <button
                              onClick={async () => {
                                if (!confirm('Xác nhận đã nhận được chuyển khoản?')) return;
                                try {
                                  await paymentAPI.updateStatus(activeOrder.payment_id!, 'Success');
                                  const updated = await orderAPI.getAll();
                                  setOrders(updated);
                                } catch { alert('Lỗi xác nhận thanh toán'); }
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all"
                            >
                              Xác nhận đã nhận tiền
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sequential action buttons */}
                    <div className="space-y-3">
                      {NEXT_STATUS[activeOrder.status] && (
                        <button
                          onClick={() => {
                            if (!confirm(`Chuyển trạng thái sang "${STATUS_LABELS[NEXT_STATUS[activeOrder.status]]}"?`)) return;
                            handleStatusChange(activeOrder.order_id, NEXT_STATUS[activeOrder.status] as Order['status']);
                          }}
                          className="w-full bg-brand-dark text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          {NEXT_STATUS_LABEL[activeOrder.status]}
                        </button>
                      )}
                      {activeOrder.status !== 'Completed' && activeOrder.status !== 'Canceled' && (
                        <button
                          onClick={() => {
                            if (!confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;
                            handleStatusChange(activeOrder.order_id, 'Canceled');
                          }}
                          className="w-full border-2 border-red-200 text-red-500 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                        >
                          <AlertCircle size={16} />
                          Hủy đơn hàng
                        </button>
                      )}
                      {(activeOrder.status === 'Completed' || activeOrder.status === 'Canceled') && (
                        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest py-4">
                          Đơn hàng đã {activeOrder.status === 'Completed' ? 'hoàn thành' : 'bị hủy'}
                        </p>
                      )}
                    </div>
                  </section>

                  <div className="pt-12 flex flex-col gap-4">
                     {activeOrder.discount_amount && activeOrder.discount_amount > 0 ? (
                       <div className="flex items-center justify-between">
                         <div className="text-left">
                           <p className="text-[10px] font-black uppercase text-green-500 tracking-widest mb-1">Giảm giá</p>
                           <p className="text-xl font-black text-green-500">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeOrder.discount_amount)}</p>
                         </div>
                       </div>
                     ) : null}
                     <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                       <div className="text-left">
                          <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest mb-1">Tổng cộng tiền</p>
                          <p className="text-3xl font-black text-brand-dark">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeOrder.total_amount)}</p>
                       </div>
                       <button 
                         onClick={handlePrintInvoice}
                         className="bg-brand-dark text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-[1.02] transition-transform"
                       >
                          In hóa đơn
                       </button>
                     </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
