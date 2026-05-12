const fs = require('fs');
const file = 'c:/Users/ADMIN/Desktop/TTCS/frontend-gym/src/pages/AdminProducts.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update imports
content = content.replace(
  /import \{ productAPI, categoryAPI, brandAPI \} from '\.\.\/api';/,
  "import { productAPI, categoryAPI, brandAPI, catalogAPI, skuAPI, imageAPI } from '../api';"
);

// 2. Add state inside component
content = content.replace(
  /const \[brands, setBrands\] = useState<Brand\[\]>\(\[\]\);/,
  `const [brands, setBrands] = useState<Brand[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [skusForm, setSkusForm] = useState<any[]>([]);
  const [imagesForm, setImagesForm] = useState<any[]>([]);`
);

// 3. Update useEffect
content = content.replace(
  /brandAPI\.getAll\(\)\.then\(setBrands\)\.catch\(\(\) => \{\}\);/,
  `brandAPI.getAll().then(setBrands).catch(() => {});
    catalogAPI.getSizes().then(setSizes).catch(() => {});
    catalogAPI.getColors().then(setColors).catch(() => {});`
);

// 4. Update handleCreate
content = content.replace(
  /setSelectedProduct\(null\);/,
  `setSelectedProduct(null);
    setSkusForm([]);
    setImagesForm([]);`
);

// 5. Update handleEdit
content = content.replace(
  /const handleEdit = \(product: Product\) => \{[^\}]*setIsFormOpen\(true\);\n\s*\};/m,
  `const handleEdit = async (product: Product) => {
    setFormData(product);
    setSelectedProduct(product);
    try {
      const [skus, imgs] = await Promise.all([
        skuAPI.getAll(product.product_id),
        imageAPI.getAll(product.product_id)
      ]);
      setSkusForm(skus);
      setImagesForm(imgs);
    } catch (e) {
      console.error(e);
      setSkusForm([]);
      setImagesForm([]);
    }
    setIsFormOpen(true);
  };`
);

// 6. Update handleSubmit
content = content.replace(
  /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?\} catch \(err\) \{[\s\S]*?alert\('Lỗi khi lưu sản phẩm'\);\n\s*\}\n\s*\};/m,
  `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let productId = selectedProduct?.product_id;
      if (productId) {
        await productAPI.update(productId, formData);
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

      const updated = await productAPI.getAll();
      setProducts(updated);
      setIsFormOpen(false);
    } catch (err) {
      alert('Lỗi khi lưu sản phẩm');
    }
  };`
);

// 7. Update Modal Form Fields
// Insert Gender and Brand dropdowns after Danh mục
content = content.replace(
  /(<label className="text-\[10px\].*Danh mục.*<\/select>\n\s*<\/div>)/m,
  `$1
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Thương hiệu</label>
                      <select 
                        value={formData.brand_id || ''}
                        onChange={e => setFormData({...formData, brand_id: parseInt(e.target.value)})}
                        className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl font-bold focus:ring-2 focus:ring-brand-dark/5"
                      >
                        {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Giới tính</label>
                      <select 
                        value={formData.gender || 'unisex'}
                        onChange={e => setFormData({...formData, gender: e.target.value as any})}
                        className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl font-bold focus:ring-2 focus:ring-brand-dark/5"
                      >
                        <option value="unisex">Unisex</option>
                        <option value="men">Nam</option>
                        <option value="women">Nữ</option>
                      </select>
                    </div>`
);

// Insert Upload Area and SKUs Area after Mô tả
content = content.replace(
  /(<div className="col-span-2\">\n\s*<label.*Mô tả.*<\/textarea>\n\s*<\/div>)/m,
  `$1
                    <div className="col-span-2 space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Khu vực tải ảnh</label>
                      <div className="flex gap-4 overflow-x-auto pb-4">
                        {imagesForm.map((img, idx) => (
                          <div key={idx} className="relative w-32 h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden group border border-gray-100">
                             <img src={img.image_url} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                               <button type="button" onClick={() => setImagesForm(imagesForm.filter((_, i) => i !== idx))} className="text-white hover:text-red-400"><Trash2 size={16} /></button>
                               {!img.is_primary && <button type="button" onClick={() => {
                                 const newImgs = [...imagesForm];
                                 newImgs.forEach(i => i.is_primary = false);
                                 newImgs[idx].is_primary = true;
                                 setImagesForm(newImgs);
                               }} className="text-[10px] text-white font-bold bg-brand-dark px-2 py-1 rounded hover:bg-gray-800 transition-colors">Đặt làm ảnh bìa</button>}
                             </div>
                             {img.is_primary && <span className="absolute top-2 left-2 bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-sm">Ảnh bìa</span>}
                          </div>
                        ))}
                        <label className="w-32 h-32 flex-shrink-0 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-brand-dark hover:text-brand-dark transition-colors cursor-pointer">
                           <ImageIcon size={24} className="mb-2" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">Kéo thả hoặc<br/>chọn ảnh</span>
                           <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                             if (!e.target.files) return;
                             const newImgs = Array.from(e.target.files).map(file => ({
                               image_url: '/images/' + file.name,
                               is_primary: imagesForm.length === 0
                             }));
                             setImagesForm([...imagesForm, ...newImgs]);
                           }} />
                        </label>
                      </div>
                    </div>

                    <div className="col-span-2 space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Các biến thể (SKU)</label>
                        <button type="button" onClick={() => setSkusForm([...skusForm, { size_id: sizes[0]?.size_id, color_id: colors[0]?.color_id, stock: 10, sku_code: '', price: formData.base_price }])} className="text-[10px] font-black uppercase tracking-widest text-brand-dark hover:underline flex items-center gap-1"><Plus size={14}/> Thêm biến thể</button>
                      </div>
                      <div className="space-y-3">
                        {skusForm.map((sku, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                             <select value={sku.size_id || ''} onChange={e => { const newSkus = [...skusForm]; newSkus[idx].size_id = parseInt(e.target.value); setSkusForm(newSkus); }} className="flex-1 bg-white border-none py-2 px-3 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-brand-dark/10">
                               <option value="">Chọn Size</option>
                               {sizes.map(s => <option key={s.size_id} value={s.size_id}>Size {s.name}</option>)}
                             </select>
                             <select value={sku.color_id || ''} onChange={e => { const newSkus = [...skusForm]; newSkus[idx].color_id = parseInt(e.target.value); setSkusForm(newSkus); }} className="flex-1 bg-white border-none py-2 px-3 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-brand-dark/10">
                               <option value="">Chọn Màu</option>
                               {colors.map(c => <option key={c.color_id} value={c.color_id}>Màu {c.name}</option>)}
                             </select>
                             <input type="text" placeholder="Mã SKU (VD: AO-M-DEN)" value={sku.sku_code || ''} onChange={e => { const newSkus = [...skusForm]; newSkus[idx].sku_code = e.target.value; setSkusForm(newSkus); }} className="flex-[1.5] bg-white border-none py-2 px-3 rounded-lg text-xs font-bold outline-none placeholder:text-gray-300 focus:ring-2 focus:ring-brand-dark/10" />
                             <div className="flex items-center gap-2 flex-1 bg-white px-3 py-2 rounded-lg focus-within:ring-2 focus-within:ring-brand-dark/10">
                               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tồn kho</span>
                               <input type="number" min="0" value={sku.stock} onChange={e => { const newSkus = [...skusForm]; newSkus[idx].stock = parseInt(e.target.value); setSkusForm(newSkus); }} className="w-full bg-transparent border-none p-0 text-xs font-bold outline-none text-right" />
                             </div>
                             <button type="button" onClick={() => setSkusForm(skusForm.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-600 p-2 transition-colors"><Trash2 size={16}/></button>
                          </div>
                        ))}
                        {skusForm.length === 0 && <p className="text-xs text-gray-400 italic text-center py-4">Chưa có biến thể nào. Hãy bấm "Thêm biến thể" để quản lý kho thực tế.</p>}
                      </div>
                    </div>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('AdminProducts.tsx updated successfully.');
