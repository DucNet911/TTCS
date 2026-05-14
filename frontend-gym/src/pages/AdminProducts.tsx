import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Package,
  Plus,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
  Trash2,
  Edit,
  X,
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  ArrowUpRight,
  Filter,
  MoreVertical,
  Image as ImageIcon,
  FileText,
  Tag,
  PieChart,
  Target,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, Brand } from '../types';
import { productAPI, categoryAPI, brandAPI, catalogAPI, skuAPI, imageAPI, productGoalAPI } from '../api';
import { useAuth } from '../AuthContext';
import { Navigate, Link } from 'react-router-dom';

export const AdminProducts = () => {
  const { user, isAdmin, isOwner, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [skusForm, setSkusForm] = useState<any[]>([]);
  const [imagesForm, setImagesForm] = useState<any[]>([]);
  const [fitnessGoals, setFitnessGoals] = useState<any[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<number[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [skuMap, setSkuMap] = useState<Record<number, any[]>>({});
  const [skuLoading, setSkuLoading] = useState(false);

  const toggleExpand = async (productId: number) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null);
      return;
    }
    setExpandedProductId(productId);
    if (!skuMap[productId]) {
      setSkuLoading(true);
      try {
        const skus = await skuAPI.getAll(productId);
        setSkuMap(prev => ({ ...prev, [productId]: skus }));
      } catch {
        setSkuMap(prev => ({ ...prev, [productId]: [] }));
      } finally {
        setSkuLoading(false);
      }
    }
  };
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandFormData, setBrandFormData] = useState<Partial<Brand>>({});
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [catTab, setCatTab] = useState<string>('men');
  const [catSearch, setCatSearch] = useState<string>('');

  // Sort state
  const [sortField, setSortField] = useState<'product_id' | 'name' | 'category_name' | 'base_price' | 'status'>('product_id');
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

  // Fetch data from API
  useEffect(() => {
    productAPI.getAll().then(setProducts).catch(() => { });
    categoryAPI.getAll().then(setCategories).catch(() => { });
    brandAPI.getAll().then(setBrands).catch(() => { });
    catalogAPI.getSizes().then(setSizes).catch(() => { });
    catalogAPI.getColors().then(setColors).catch(() => { });
    catalogAPI.getGoals().then(setFitnessGoals).catch(() => { });
  }, []);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'product_id': cmp = a.product_id - b.product_id; break;
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'category_name': cmp = (a.category_name || '').localeCompare(b.category_name || ''); break;
        case 'base_price': cmp = Number(a.base_price) - Number(b.base_price); break;
        case 'status': cmp = (a.status || '').localeCompare(b.status || ''); break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [products, searchQuery, sortField, sortDirection]);

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      base_price: 0,
      material: '',
      brand_id: brands[0]?.brand_id,
      category_id: categories[0]?.category_id,
      gender: 'unisex'
    });
    setSelectedProduct(null);
    setSkusForm([]);
    setImagesForm([]);
    setSelectedGoalIds([]);
    setCatTab('men');
    setCatSearch('');
    setIsFormOpen(true);
  };

  const openBrandModal = () => {
    setIsBrandModalOpen(true);
    setBrandFormData({ name: '', description: '', logo: '' });
    setSelectedBrand(null);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedBrand) {
        await brandAPI.update(selectedBrand.brand_id, brandFormData);
      } else {
        await brandAPI.create(brandFormData);
      }
      const updatedBrands = await brandAPI.getAll();
      setBrands(updatedBrands);
      setBrandFormData({ name: '', description: '', logo: '' });
      setSelectedBrand(null);
    } catch (err) {
      alert('Lỗi khi lưu thương hiệu');
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
      try {
        await brandAPI.delete(id);
        const updatedBrands = await brandAPI.getAll();
        setBrands(updatedBrands);
      } catch (err) {
        alert('Lỗi khi xóa thương hiệu');
      }
    }
  };

  const handleEdit = async (product: Product) => {
    setFormData(product);
    setSelectedProduct(product);
    try {
      const [skus, imgs, goals] = await Promise.all([
        skuAPI.getAll(product.product_id),
        imageAPI.getAll(product.product_id),
        productGoalAPI.getByProduct(product.product_id)
      ]);
      setSkusForm(skus);
      setImagesForm(imgs);
      setSelectedGoalIds(goals.map(g => g.goal_id));
    } catch (e) {
      console.error(e);
      setSkusForm([]);
      setImagesForm([]);
      setSelectedGoalIds([]);
    }

    const cid = product.category_id;
    if (cid) {
      const ACC_IDS = categories.filter(c => c.category_id >= 8).map(c => c.category_id);
      const WOMEN_IDS = [5, 2, 6, 3, 7];
      const MEN_IDS = [1, 2, 3, 4];
      if (ACC_IDS.includes(cid)) setCatTab('acc');
      else if (WOMEN_IDS.includes(cid) && !MEN_IDS.includes(cid)) setCatTab('women');
      else setCatTab('men');
    }
    setCatSearch('');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const product = products.find(p => p.product_id === id);
    if (!product) return;

    const actionText = product.is_deleted ? 'khôi phục' : 'ẩn (xóa mềm)';
    if (confirm(`Bạn có chắc chắn muốn ${actionText} sản phẩm này?`)) {
      try {
        if (product.is_deleted) {
          await fetch(`http://localhost:5000/api/products/${id}/restore`, { method: 'PATCH' });
        } else {
          await productAPI.delete(id);
        }
        const updated = await productAPI.getAll();
        setProducts(updated);
      } catch (err) {
        alert('Lỗi khi thao tác sản phẩm');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let productId = selectedProduct?.product_id;
      if (productId) {
        await productAPI.update(productId, formData);

        // Delete removed SKUs
        const existingSkus = await skuAPI.getAll(productId);
        for (const ex of existingSkus) {
          if (!skusForm.find(sku => sku.sku_id === ex.sku_id)) {
            await skuAPI.delete(ex.sku_id);
          }
        }

        // Delete removed Images
        const existingImages = await imageAPI.getAll(productId);
        for (const ex of existingImages) {
          if (!imagesForm.find(img => img.image_id === ex.image_id)) {
            await imageAPI.delete(ex.image_id);
          }
        }
      } else {
        const res = await productAPI.create(formData);
        productId = res.product_id;
      }

      // Save SKUs
      for (const sku of skusForm) {
        if (sku.sku_id) {
          await skuAPI.update(sku.sku_id, sku);
        } else {
          await skuAPI.create({ ...sku, product_id: productId, price: sku.price || formData.base_price });
        }
      }

      // Save Images
      for (const img of imagesForm) {
        if (img.image_id) {
          await imageAPI.update(img.image_id, img);
        } else {
          await imageAPI.create({ ...img, product_id: productId });
        }
      }

      // Save Goals (Mục tiêu thể hình)
      await productGoalAPI.updateGoals(productId!, selectedGoalIds);

      const updated = await productAPI.getAll();
      setProducts(updated);
      setIsFormOpen(false);
    } catch (err) {
      alert('Lỗi khi lưu sản phẩm');
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
            { icon: Tag, label: 'Sản phẩm', path: '/admin/products', active: true },
            { icon: Users, label: 'Khách hàng', path: '/admin/customers', active: false },
            { icon: MessageSquare, label: 'Đánh giá', path: '/admin/reviews', active: false },
            { icon: PieChart, label: 'Báo cáo', path: '/admin/reports', active: false },
          ].filter(item => item.label !== 'Báo cáo' || isOwner).map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-4 rounded transition-all group ${item.active
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
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{user?.role === 'admin' ? 'Super Admin' : 'Nhân viên'}</p>
            </div>
            <div className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center text-white font-black text-xs uppercase shadow-lg shadow-black/20">
              {user?.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-[46px] font-black uppercase tracking-tighter text-brand-dark leading-none">Sản phẩm</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Tổng số {products.length} sản phẩm hiện có</p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-brand-dark hover:scale-[1.02] active:scale-[0.98] text-white px-8 py-4 rounded-full flex items-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/10"
            >
              <Plus size={18} /> Thêm sản phẩm mới
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Search Bar Area */}
            <div className="p-8 flex flex-wrap gap-6 items-center border-b border-gray-50">
              <div className="flex-1 max-w-sm relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="text"
                  placeholder="TÌM KIẾM SẢN PHẨM..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-[#F5F5F5] border-none py-4 pl-12 pr-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th onClick={() => handleSort('product_id')} className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 cursor-pointer hover:text-brand-dark transition-colors select-none"><div className="flex items-center gap-1">ID <SortIcon field="product_id" /></div></th>
                    <th onClick={() => handleSort('name')} className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 cursor-pointer hover:text-brand-dark transition-colors select-none"><div className="flex items-center gap-1">Tên sản phẩm <SortIcon field="name" /></div></th>
                    <th onClick={() => handleSort('category_name')} className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 text-center cursor-pointer hover:text-brand-dark transition-colors select-none"><div className="flex items-center justify-center gap-1">Phân loại <SortIcon field="category_name" /></div></th>
                    <th onClick={() => handleSort('base_price')} className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 text-right cursor-pointer hover:text-brand-dark transition-colors select-none"><div className="flex items-center justify-end gap-1">Giá niêm yết <SortIcon field="base_price" /></div></th>
                    <th onClick={() => handleSort('status')} className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 text-center cursor-pointer hover:text-brand-dark transition-colors select-none"><div className="flex items-center justify-center gap-1">Trạng thái kho <SortIcon field="status" /></div></th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(() => {
                    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
                    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
                    const paginatedProducts = filteredProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);
                    return paginatedProducts.map((product) => {
                      const isExpanded = expandedProductId === product.product_id;
                      const productSkus = skuMap[product.product_id] || [];
                      return (
                        <React.Fragment key={product.product_id}>
                          <tr className={`hover:bg-gray-50/80 transition-colors group border-b border-gray-50 last:border-none ${isExpanded ? 'bg-gray-50/50' : ''}`}>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <button onClick={() => toggleExpand(product.product_id)} className="p-1 hover:bg-gray-200 rounded-md transition-all flex-shrink-0" title="Xem SKU">
                                  {isExpanded ? <ChevronDownIcon size={14} className="text-brand-dark" /> : <ChevronRight size={14} className="text-gray-400" />}
                                </button>
                                <span className="text-xs font-black text-brand-dark">#{product.product_id}</span>
                                <div className="w-10 h-10 bg-brand-light rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                                  {product.primary_image && <img src={product.primary_image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />}
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div>
                                <p className="text-sm font-black uppercase tracking-tight text-brand-dark group-hover:translate-x-1 transition-transform inline-block">{product.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Material: {product.material || 'Premium Fabric'}</p>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <span className="bg-brand-dark text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                  {product.category_name || ''}
                                </span>
                                {Boolean(product.is_deleted) && (
                                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                    Đã ẩn
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <p className="text-base font-black tracking-tight text-brand-dark">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.base_price)}
                              </p>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`text-[10px] font-black uppercase ${product.status === 'out_of_stock' ? 'text-red-600' : 'text-brand-dark'}`}>
                                  {product.status === 'out_of_stock' ? 'Hết hàng' : 'Còn hàng'}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2 text-gray-400">
                                <button onClick={() => handleEdit(product)} className="p-2 hover:bg-black hover:text-white rounded-xl transition-all" title="Chỉnh sửa"><Edit size={16} /></button>
                                <button
                                  onClick={() => handleDelete(product.product_id)}
                                  className={`p-2 rounded-xl transition-all ${product.is_deleted ? 'text-green-500 hover:bg-green-500 hover:text-white' : 'hover:bg-red-600 hover:text-white'}`}
                                  title={product.is_deleted ? "Khôi phục" : "Xóa mềm"}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {/* SKU Sub-rows */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="px-0 py-0">
                                <div className="bg-gray-50/80 border-y border-gray-100">
                                  {skuLoading && productSkus.length === 0 ? (
                                    <div className="px-12 py-6 text-center">
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Đang tải SKU...</p>
                                    </div>
                                  ) : productSkus.length > 0 ? (
                                    <table className="w-full">
                                      <thead>
                                        <tr className="bg-gray-100/60">
                                          <th className="px-12 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">SKU Code</th>
                                          <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">Size</th>
                                          <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">Màu sắc</th>
                                          <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Giá</th>
                                          <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Tồn kho</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {productSkus.map((sku: any) => (
                                          <tr key={sku.sku_id} className="border-t border-gray-100/80 hover:bg-white/60 transition-colors">
                                            <td className="px-12 py-3">
                                              <span className="text-[10px] font-bold text-gray-500 font-mono">{sku.sku_code || `SKU-${sku.sku_id}`}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className="text-[10px] font-black uppercase text-brand-dark">{sku.size_name || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                              <div className="flex items-center gap-2">
                                                {sku.hex_code && <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: sku.hex_code }}></div>}
                                                <span className="text-[10px] font-black uppercase text-brand-dark">{sku.color_name || '—'}</span>
                                              </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                              <span className="text-[10px] font-black text-brand-dark">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sku.price)}
                                              </span>
                                            </td>
                                            <td className="px-8 py-3 text-right">
                                              <span className={`text-[10px] font-black ${sku.stock <= 0 ? 'text-red-500' : sku.stock <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                                                {sku.stock}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <div className="px-12 py-6 text-center">
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chưa có biến thể SKU nào</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(() => {
              const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
              const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
              const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, filteredProducts.length);
              if (filteredProducts.length === 0 || totalPages <= 1) return null;
              return (
                <div className="px-8 py-6 flex items-center justify-between border-t border-gray-50 bg-gray-50/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Đang hiển thị {startIdx + 1} đến {endIdx} của {filteredProducts.length} sản phẩm</p>
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
        </div>

        {/* Modal Applet */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4"
              onClick={() => setIsFormOpen(false)}
            >
              <motion.div
                initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-4xl rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 flex-shrink-0">
                  <h2 className="text-[22px] font-black uppercase tracking-tighter">{selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
                </div>
                <div className="overflow-y-auto flex-1 p-8">
                  <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Tên sản phẩm</label>
                        <input
                          required type="text" value={formData.name || ''}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-gray-50 border-none px-4 py-4 rounded-xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-brand-dark/10"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Danh mục</label>
                        {(() => {
                          const MEN_IDS = [1, 2, 3, 4];
                          const WOMEN_IDS = [5, 2, 6, 3, 7];
                          const ACC_IDS = categories.filter(c => c.category_id >= 8).map(c => c.category_id);

                          const catGroupTabs = [
                            { key: 'men', label: 'Nam', ids: MEN_IDS },
                            { key: 'women', label: 'Nữ', ids: WOMEN_IDS },
                            { key: 'acc', label: 'Phụ kiện', ids: ACC_IDS },
                          ];

                          // Determine active tab based on current category_id
                          const activeCatGroup = (() => {
                            const cid = formData.category_id;
                            if (!cid) return catGroupTabs[0].key;
                            if (ACC_IDS.includes(cid)) return 'acc';
                            if (WOMEN_IDS.includes(cid) && !MEN_IDS.includes(cid)) return 'women';
                            // IDs shared between men/women (2,3) default to men unless already in women tab
                            return 'men';
                          })();

                          const activeTabData = catGroupTabs.find(t => t.key === catTab) || catGroupTabs[0];
                          const filteredCats = categories
                            .filter(c => activeTabData.ids.includes(c.category_id))
                            .filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()));

                          return (
                            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                              {/* Tab buttons */}
                              <div className="flex border-b border-gray-100">
                                {catGroupTabs.map(tab => (
                                  <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => { setCatTab(tab.key); setCatSearch(''); }}
                                    className={`flex-1 px-3 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${catTab === tab.key
                                        ? 'bg-brand-dark text-white'
                                        : 'text-gray-400 hover:text-brand-dark hover:bg-gray-100'
                                      }`}
                                  >
                                    {tab.icon} {tab.label}
                                  </button>
                                ))}
                              </div>
                              {/* Search */}
                              <div className="px-3 pt-3 pb-2">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                  <input
                                    type="text"
                                    placeholder="Tìm danh mục con..."
                                    value={catSearch}
                                    onChange={e => setCatSearch(e.target.value)}
                                    className="w-full bg-white border border-gray-100 py-2 pl-9 pr-3 rounded-lg text-[11px] font-bold outline-none focus:border-brand-dark/30 transition-all placeholder:text-gray-300"
                                  />
                                </div>
                              </div>
                              {/* Category items */}
                              <div className="px-3 pb-3 flex flex-wrap gap-2 max-h-[140px] overflow-y-auto">
                                {filteredCats.length > 0 ? filteredCats.map(c => (
                                  <button
                                    key={c.category_id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category_id: c.category_id })}
                                    className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all border ${formData.category_id === c.category_id
                                        ? 'bg-brand-dark text-white border-brand-dark shadow-md shadow-black/10'
                                        : 'bg-white text-gray-600 border-gray-100 hover:border-brand-dark/30 hover:text-brand-dark'
                                      }`}
                                  >
                                    {c.name}
                                  </button>
                                )) : (
                                  <p className="text-[10px] text-gray-400 italic py-2 w-full text-center">Không tìm thấy danh mục nào</p>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Thương hiệu</label>
                          <button type="button" onClick={openBrandModal} className="text-[10px] font-black uppercase tracking-widest text-brand-dark hover:underline">+ Thêm / Quản lý</button>
                        </div>
                        <select
                          value={formData.brand_id || ''}
                          onChange={e => setFormData({ ...formData, brand_id: parseInt(e.target.value) })}
                          className="w-full bg-gray-50 border-none px-4 py-4 rounded-xl font-bold focus:ring-2 focus:ring-brand-dark/10"
                        >
                          <option value="">Chọn thương hiệu</option>
                          {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Giới tính</label>
                        <select
                          value={formData.gender || 'unisex'}
                          onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                          className="w-full bg-gray-50 border-none px-4 py-4 rounded-xl font-bold focus:ring-2 focus:ring-brand-dark/10"
                        >
                          <option value="unisex">Unisex</option>
                          <option value="men">Nam</option>
                          <option value="women">Nữ</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Giá cơ bản (VND)</label>
                        <input
                          required type="number" value={formData.base_price || 0}
                          onChange={e => setFormData({ ...formData, base_price: parseInt(e.target.value) })}
                          className="w-full bg-gray-50 border-none px-4 py-4 rounded-xl font-bold focus:ring-2 focus:ring-brand-dark/10"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Chất liệu</label>
                        <input
                          required type="text" value={formData.material || ''}
                          onChange={e => setFormData({ ...formData, material: e.target.value })}
                          placeholder="VD: 100% Cotton, Polyester thấm hút mồ hôi..."
                          className="w-full bg-gray-50 border-none px-4 py-4 rounded-xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-brand-dark/10"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Mô tả</label>
                        <textarea
                          required value={formData.description || ''}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          className="w-full bg-gray-50 border-none px-4 py-4 rounded-xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-brand-dark/10 resize-none"
                        />
                      </div>

                      {/* Image Upload Area */}
                      <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark block mb-4 flex items-center gap-2"><ImageIcon size={14} /> Khu vực tải ảnh</label>
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                          {imagesForm.map((img, idx) => (
                            <div key={idx} className="relative w-36 h-36 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden group border border-gray-100">
                              <img src={img.image_url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <button type="button" onClick={() => setImagesForm(imagesForm.filter((_, i) => i !== idx))} className="text-white hover:text-red-400 bg-white/10 p-2 rounded-full backdrop-blur-sm"><Trash2 size={16} /></button>
                                {!img.is_primary && <button type="button" onClick={() => {
                                  const newImgs = [...imagesForm];
                                  newImgs.forEach(i => i.is_primary = false);
                                  newImgs[idx].is_primary = true;
                                  setImagesForm(newImgs);
                                }} className="text-[9px] text-white font-black uppercase tracking-widest bg-brand-dark px-3 py-2 rounded-full hover:bg-gray-800 transition-colors">Ảnh bìa</button>}
                              </div>
                              {img.is_primary && <span className="absolute top-2 left-2 bg-green-500 text-white text-[8px] px-2 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">Ảnh bìa</span>}
                            </div>
                          ))}
                          <label className="w-36 h-36 flex-shrink-0 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-brand-dark hover:text-brand-dark hover:bg-gray-100 transition-all cursor-pointer">
                            <ImageIcon size={28} className="mb-2 opacity-50" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Kéo thả /<br />Chọn ảnh</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                              if (!e.target.files) return;
                              const newImgs: any[] = [];
                              let hasPrimary = imagesForm.some(i => i.is_primary);

                              for (const file of Array.from(e.target.files) as File[]) {
                                const base64 = await new Promise<string>((resolve) => {
                                  const reader = new FileReader();
                                  reader.onloadend = () => resolve(reader.result as string);
                                  reader.readAsDataURL(file);
                                });
                                newImgs.push({
                                  image_url: base64,
                                  is_primary: !hasPrimary
                                });
                                hasPrimary = true;
                              }
                              setImagesForm([...imagesForm, ...newImgs]);
                            }} />
                          </label>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 italic">*Kéo thả ảnh thực tế vào. Tên file sẽ tự động map với /images/ten-file</p>
                      </div>

                      {/* SKUs Area */}
                      <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark flex items-center gap-2"><Package size={14} /> Các biến thể (SKU)</label>
                          <button type="button" onClick={() => setSkusForm([...skusForm, { size_id: sizes[0]?.size_id, color_id: colors[0]?.color_id, stock: 10, sku_code: '', price: formData.base_price }])} className="text-[10px] font-black uppercase tracking-widest text-brand-dark hover:bg-gray-100 px-4 py-2 rounded-full transition-colors flex items-center gap-1"><Plus size={14} /> Thêm SKU</button>
                        </div>
                        <div className="space-y-4">
                          {skusForm.map((sku, idx) => (
                            <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <select value={sku.size_id || ''} onChange={e => { const newSkus = [...skusForm]; newSkus[idx].size_id = parseInt(e.target.value); setSkusForm(newSkus); }} className="w-full md:w-auto flex-1 bg-white border-none py-3 px-4 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-brand-dark/10 shadow-sm">
                                <option value="">Chọn Size</option>
                                {sizes.map(s => <option key={s.size_id} value={s.size_id}>Size {s.name}</option>)}
                              </select>
                              <select value={sku.color_id || ''} onChange={e => { const newSkus = [...skusForm]; newSkus[idx].color_id = parseInt(e.target.value); setSkusForm(newSkus); }} className="w-full md:w-auto flex-1 bg-white border-none py-3 px-4 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-brand-dark/10 shadow-sm">
                                <option value="">Chọn Màu</option>
                                {colors.map(c => <option key={c.color_id} value={c.color_id}>Màu {c.name}</option>)}
                              </select>
                              <input type="text" placeholder="Mã SKU (VD: AO-DEN)" value={sku.sku_code || ''} onChange={e => { const newSkus = [...skusForm]; newSkus[idx].sku_code = e.target.value; setSkusForm(newSkus); }} className="w-full md:w-auto flex-[1.5] bg-white border-none py-3 px-4 rounded-lg text-xs font-bold outline-none placeholder:text-gray-300 focus:ring-2 focus:ring-brand-dark/10 shadow-sm" />
                              <div className="flex items-center gap-2 w-full md:w-auto flex-1 bg-white px-4 py-3 rounded-lg focus-within:ring-2 focus-within:ring-brand-dark/10 shadow-sm">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tồn kho</span>
                                <input type="number" min="0" value={sku.stock} onChange={e => { const newSkus = [...skusForm]; newSkus[idx].stock = parseInt(e.target.value); setSkusForm(newSkus); }} className="w-full bg-transparent border-none p-0 text-xs font-bold outline-none text-right" />
                              </div>
                              <button type="button" onClick={() => setSkusForm(skusForm.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-white hover:bg-red-500 w-10 h-10 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 bg-white shadow-sm"><Trash2 size={16} /></button>
                            </div>
                          ))}
                          {skusForm.length === 0 && (
                            <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                              <Package className="mx-auto text-gray-300 mb-3" size={32} />
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Chưa có biến thể nào</p>
                              <p className="text-[10px] text-gray-400 mt-1">Bấm "Thêm SKU" để phân loại hàng hoá theo màu/size</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Goals Area */}
                      <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-dark block mb-4 flex items-center gap-2"><Target size={14} /> Mục tiêu thể hình</label>
                        <p className="text-[10px] text-gray-400 font-medium mb-4">Chọn mục tiêu mà sản phẩm này hỗ trợ (dùng cho tính năng Gợi ý cá nhân hóa)</p>
                        <div className="flex flex-wrap gap-3">
                          {fitnessGoals.map(goal => (
                            <label
                              key={goal.goal_id}
                              className={`flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all border-2 ${selectedGoalIds.includes(goal.goal_id)
                                  ? 'border-brand-dark bg-brand-dark/5 shadow-sm'
                                  : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedGoalIds.includes(goal.goal_id)}
                                onChange={() => {
                                  setSelectedGoalIds(prev =>
                                    prev.includes(goal.goal_id)
                                      ? prev.filter(id => id !== goal.goal_id)
                                      : [...prev, goal.goal_id]
                                  );
                                }}
                                className="accent-brand-dark w-4 h-4"
                              />
                              <div>
                                <span className="text-xs font-black uppercase tracking-tight">{goal.name}</span>
                                {goal.description && <span className="text-[10px] text-gray-400 ml-2">{goal.description}</span>}
                              </div>
                            </label>
                          ))}
                        </div>
                        {fitnessGoals.length === 0 && (
                          <p className="text-[10px] text-gray-400 italic">Chưa có mục tiêu nào trong database</p>
                        )}
                      </div>

                    </div>
                  </form>
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex-shrink-0 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-gray-200 transition-colors">Hủy</button>
                  <button form="productForm" type="submit" className="bg-brand-dark text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-transform shadow-xl shadow-black/10">
                    {selectedProduct ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brand Management Modal */}
        <AnimatePresence>
          {isBrandModalOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setIsBrandModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 overflow-hidden max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-brand-dark">Quản lý thương hiệu</h2>
                  <button onClick={() => setIsBrandModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
                  {/* Form */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{selectedBrand ? 'Chỉnh sửa' : 'Thêm mới'}</h3>
                    <form onSubmit={handleSaveBrand} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Tên thương hiệu *</label>
                        <input required type="text" value={brandFormData.name || ''} onChange={e => setBrandFormData({ ...brandFormData, name: e.target.value })} className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-dark/10" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Logo URL</label>
                        <input type="text" value={brandFormData.logo || ''} onChange={e => setBrandFormData({ ...brandFormData, logo: e.target.value })} className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-dark/10" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Mô tả</label>
                        <textarea rows={3} value={brandFormData.description || ''} onChange={e => setBrandFormData({ ...brandFormData, description: e.target.value })} className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-dark/10 resize-none" />
                      </div>
                      <div className="flex gap-2">
                        {selectedBrand && <button type="button" onClick={() => { setSelectedBrand(null); setBrandFormData({ name: '', description: '', logo: '' }); }} className="flex-1 bg-gray-100 text-brand-dark py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200">Hủy sửa</button>}
                        <button type="submit" className="flex-[2] bg-brand-dark text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 shadow-lg">{selectedBrand ? 'Cập nhật' : 'Thêm mới'}</button>
                      </div>
                    </form>
                  </div>

                  {/* List */}
                  <div className="bg-gray-50 rounded-2xl p-4 flex flex-col h-full max-h-[400px]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Danh sách hiện có</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {brands.map(brand => (
                        <div key={brand.brand_id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group">
                          <div>
                            <p className="text-xs font-black uppercase text-brand-dark">{brand.name}</p>
                            {brand.description && <p className="text-[9px] text-gray-400 truncate w-32">{brand.description}</p>}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedBrand(brand); setBrandFormData(brand); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-brand-dark"><Edit size={14} /></button>
                            <button onClick={() => handleDeleteBrand(brand.brand_id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                      {brands.length === 0 && <p className="text-[10px] text-gray-400 text-center italic py-4">Chưa có thương hiệu nào</p>}
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
