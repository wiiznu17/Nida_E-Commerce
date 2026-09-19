import { useState, type FormEvent } from 'react';
import { Plus, Search, Trash2, Check, X, Eye, ShoppingBag } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';

export default function AdminProducts() {
  const { language } = useLanguage();
  const { productsList, addProduct, deleteProduct } = useAdmin();

  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New product form state
  const [formData, setFormData] = useState({
    name: '',
    department: 'women',
    category: 'apparel',
    subCategory: 'Sweaters & Knits',
    price: 120,
    originalPrice: 160,
    tag: 'NEW ARRIVAL',
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    colors: '#2B1810, #FFFFFF, #F59E0B',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    const colorsArray = formData.colors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    addProduct({
      name: formData.name,
      department: formData.department,
      category: formData.category,
      subCategory: formData.subCategory,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      tag: formData.tag,
      image: formData.image,
      colors: colorsArray.length ? colorsArray : ['#2B1810', '#FFFFFF'],
      rating: 5.0,
      reviewsCount: 1,
    });

    setIsAddModalOpen(false);
    showToast(language === 'th' ? 'เพิ่มสินค้าใหม่เข้าสู่ระบบเรียบร้อยแล้ว' : 'Product successfully created');
    setFormData({
      name: '',
      department: 'women',
      category: 'apparel',
      subCategory: 'Sweaters & Knits',
      price: 120,
      originalPrice: 160,
      tag: 'NEW ARRIVAL',
      image:
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      colors: '#2B1810, #FFFFFF, #F59E0B',
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        language === 'th'
          ? `คุณต้องการลบสินค้า "${name}" ออกจากระบบหรือไม่?`
          : `Are you sure you want to delete "${name}"?`,
      )
    ) {
      deleteProduct(id);
      showToast(language === 'th' ? 'ลบสินค้าเรียบร้อยแล้ว' : 'Product removed');
    }
  };

  // Filter products
  const filteredProducts = productsList.filter((p) => {
    const matchesDept =
      selectedDept === 'all' || (p.department && p.department.toLowerCase() === selectedDept.toLowerCase());
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const departments = [
    { id: 'all', label: language === 'th' ? 'ทั้งหมด (All)' : 'All Items' },
    { id: 'women', label: language === 'th' ? 'ผู้หญิง (Women)' : 'Women' },
    { id: 'men', label: language === 'th' ? 'ผู้ชาย (Men)' : 'Men' },
    { id: 'kids', label: language === 'th' ? 'เด็ก (Kids)' : 'Kids' },
    { id: 'bags', label: language === 'th' ? 'กระเป๋า (Bags)' : 'Bags' },
    { id: 'shoes', label: language === 'th' ? 'รองเท้า (Shoes)' : 'Shoes' },
    { id: 'home', label: language === 'th' ? 'ของแต่งบ้าน (Home)' : 'Home' },
  ];

  return (
    <AdminLayout
      title={language === 'th' ? 'จัดการรายการสินค้า' : 'Products & Catalog'}
      subtitle={
        language === 'th'
          ? `จัดการแคตตาล็อกสินค้าทั้งหมดในระบบ (แสดง ${filteredProducts.length} จาก ${productsList.length} รายการ)`
          : `Manage master product listings (${filteredProducts.length} of ${productsList.length} products displayed)`
      }
      actionButton={
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#2B1810] hover:bg-[#D97706] text-white px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 shadow-xs"
        >
          <Plus size={16} />
          <span>{language === 'th' ? 'เพิ่มสินค้าใหม่' : 'Add New Product'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 text-xs font-bold flex items-center rounded-xs animate-in fade-in">
            <Check size={16} className="mr-2 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white border border-[#EAE3D9] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Department Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-colors ${
                  selectedDept === dept.id
                    ? 'bg-[#2B1810] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dept.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'th' ? 'ค้นหาชื่อสินค้า, หมวดหมู่...' : 'Search product title, category...'}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 focus:outline-none focus:border-[#2B1810]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-[#EAE3D9] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-[#FAF7F2] text-gray-600 font-bold uppercase tracking-wider">
                  <th className="p-4 w-16">{language === 'th' ? 'รูปภาพ' : 'Image'}</th>
                  <th className="p-4">{language === 'th' ? 'ชื่อสินค้า & รายละเอียด' : 'Product Details'}</th>
                  <th className="p-4">{language === 'th' ? 'หมวดหมู่' : 'Department / Category'}</th>
                  <th className="p-4">{language === 'th' ? 'ราคาขาย' : 'Price'}</th>
                  <th className="p-4">{language === 'th' ? 'ป้ายแท็ก' : 'Badge'}</th>
                  <th className="p-4 text-right">{language === 'th' ? 'จัดการ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Thumbnail */}
                    <td className="p-4">
                      <div className="w-14 h-16 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    </td>

                    {/* Title & Info */}
                    <td className="p-4">
                      <div className="font-bold text-[#2B1810] text-sm hover:underline cursor-pointer">
                        {product.name}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 flex items-center space-x-2">
                        <span>SKU: NIDA-{product.id.toUpperCase()}</span>
                        <span>•</span>
                        <span>
                          คะแนน: ★ {product.rating || 4.9} ({product.reviewsCount || 24})
                        </span>
                      </div>
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1.5">
                          {product.colors.map((c, i) => (
                            <span
                              key={i}
                              className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Department & Subcategory */}
                    <td className="p-4">
                      <span className="inline-block bg-[#FAF7F2] border border-[#EAE3D9] text-[#2B1810] text-[10px] font-black uppercase px-2 py-0.5 rounded-xs">
                        {product.department || 'general'}
                      </span>
                      <div className="text-[11px] text-gray-500 mt-1">{product.subCategory || product.category}</div>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <div className="font-bold font-mono text-[#2B1810] text-sm">${product.price.toFixed(2)}</div>
                      {product.originalPrice && (
                        <div className="text-[11px] text-gray-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Tag */}
                    <td className="p-4">
                      {product.tag ? (
                        <span className="bg-[#2B1810] text-[#F59E0B] text-[10px] font-black uppercase px-2 py-0.5 rounded-xs">
                          {product.tag}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={`http://localhost:3000/product/${product.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-gray-500 hover:text-[#2B1810] hover:bg-gray-100 rounded-xs"
                          title={language === 'th' ? 'ดูหน้าสินค้าบนเว็บ' : 'View on Store'}
                        >
                          <Eye size={16} />
                        </a>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors"
                          title={language === 'th' ? 'ลบสินค้า' : 'Delete'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center">
              <ShoppingBag size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-bold text-gray-600">
                {language === 'th' ? 'ไม่พบสินค้าตามเงื่อนไขที่ค้นหา' : 'No products matched your search filter'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1810]/50 backdrop-blur-xs">
          <div className="bg-white border border-[#EAE3D9] max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-black uppercase text-[#2B1810]">
                  {language === 'th' ? 'เพิ่มสินค้าใหม่ (New Product)' : 'Add New Product'}
                </h3>
                <p className="text-xs text-gray-500">กรอกรายละเอียดสินค้าเพื่อนำขึ้นระบบแคตตาล็อก</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  ชื่อสินค้า (Product Name) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น Signature Cashmere Crewneck"
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#2B1810]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    กลุ่มสินค้า (Department)
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:border-[#2B1810]"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kids">Kids</option>
                    <option value="bags">Bags & Leather</option>
                    <option value="shoes">Shoes</option>
                    <option value="home">Home & Living</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    หมวดย่อย (Sub-Category)
                  </label>
                  <input
                    type="text"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    placeholder="เช่น Sweaters & Knits"
                    className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#2B1810]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    ราคาขาย ($ Price) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#2B1810]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    ราคาเต็มก่อนลด ($ Original)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#2B1810]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  ป้ายแท็ก (Badge Tag)
                </label>
                <select
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:border-[#2B1810]"
                >
                  <option value="NEW ARRIVAL">NEW ARRIVAL</option>
                  <option value="BESTSELLER">BESTSELLER</option>
                  <option value="TRENDING">TRENDING</option>
                  <option value="LIMITED EDITION">LIMITED EDITION</option>
                  <option value="HERITAGE">HERITAGE</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  ลิงก์รูปภาพ (Image URL)
                </label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#2B1810]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  รหัสสี Hex (คั่นด้วยเครื่องหมายจุลภาค)
                </label>
                <input
                  type="text"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  placeholder="#2B1810, #FFFFFF, #F59E0B"
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#2B1810]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 font-bold text-gray-600 hover:bg-gray-100"
                >
                  {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2B1810] hover:bg-[#D97706] text-white font-bold uppercase tracking-wider shadow-xs"
                >
                  {language === 'th' ? 'บันทึกสินค้า' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
