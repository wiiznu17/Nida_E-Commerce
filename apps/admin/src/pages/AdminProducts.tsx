import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, Trash2, Check, Eye, ShoppingBag, Edit, X, Boxes } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';

export default function AdminProducts() {
  const { language } = useLanguage();
  const location = useLocation();
  const { productsList, deleteProduct, inventoryList, toggleProductStatus } = useAdmin();

  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Listen for toast from navigation redirect (create/edit)
  useEffect(() => {
    if (location.state && (location.state as any).toast) {
      showToast((location.state as any).toast);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  const handleToggleStatus = async (product: any) => {
    const nextStatus = product.isActive === false ? true : false;
    setTogglingId(product.id);
    try {
      await toggleProductStatus(product.id, nextStatus);
      showToast(
        language === 'th'
          ? `ปรับสถานะเป็น "${nextStatus ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}" เรียบร้อย`
          : `Product marked as ${nextStatus ? 'Published' : 'Draft'}`,
      );
    } catch {
      showToast(language === 'th' ? 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ' : 'Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  // Filter products
  const filteredProducts = productsList.filter((p) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'published'
          ? p.isActive !== false
          : p.isActive === false;
    const matchesDept =
      selectedDept === 'all' || (p.department && p.department.toLowerCase() === selectedDept.toLowerCase());
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesDept && matchesSearch;
  });

  const totalPublished = productsList.filter((p) => p.isActive !== false).length;
  const totalDrafts = productsList.filter((p) => p.isActive === false).length;

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
        <Link
          to="/admin/products/new"
          className="bg-[#2B1810] hover:bg-[#D97706] text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 rounded-md shadow-xs"
        >
          <Plus size={16} />
          <span>{language === 'th' ? 'เพิ่มสินค้าใหม่' : 'Add New Product'}</span>
        </Link>
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
        <div className="bg-white border border-[#EAE3D9] p-4 space-y-3">
          {/* Top Row: Status Tabs & Search Box */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-3 border-b border-[#FAF7F2]">
            {/* Status Segmented Tabs */}
            <div className="flex items-center space-x-1 p-1 bg-[#FAF7F2] border border-[#EAE3D9] rounded-md w-full md:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-[#2B1810] shadow-2xs font-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {language === 'th' ? 'ทั้งหมด' : 'All'} ({productsList.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('published')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all ${
                  statusFilter === 'published'
                    ? 'bg-emerald-600 text-white shadow-2xs font-black'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'published' ? 'bg-white' : 'bg-emerald-500'}`} />
                <span>{language === 'th' ? 'เผยแพร่แล้ว' : 'Published'} ({totalPublished})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('draft')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all ${
                  statusFilter === 'draft'
                    ? 'bg-amber-600 text-white shadow-2xs font-black'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'draft' ? 'bg-white' : 'bg-amber-500'}`} />
                <span>{language === 'th' ? 'ฉบับร่าง' : 'Draft'} ({totalDrafts})</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'th' ? 'ค้นหาชื่อสินค้า, หมวดหมู่...' : 'Search product title, category...'}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 focus:outline-none focus:border-[#2B1810] rounded-xs"
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

          {/* Bottom Row: Department Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full pb-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              {language === 'th' ? 'แผนก:' : 'Dept:'}
            </span>
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded-xs whitespace-nowrap transition-colors ${
                  selectedDept === dept.id
                    ? 'bg-[#2B1810] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dept.label}
              </button>
            ))}
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
                  <th className="p-4">{language === 'th' ? 'สถานะ' : 'Status'}</th>
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
                      {(() => {
                        const productInventory = inventoryList.filter((item) => item.productId === product.id);
                        const totalStock = productInventory.reduce((acc, curr) => acc + curr.availableStock, 0);
                        const skuCount = productInventory.length;

                        return (
                          <>
                            <div className="font-bold text-[#2B1810] text-sm hover:underline cursor-pointer">
                              {product.name}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-mono text-gray-700">
                                {skuCount > 1
                                  ? `${skuCount} SKUs`
                                  : productInventory[0]?.sku || `NIDA-${product.id.toUpperCase()}`}
                              </span>
                              <span>•</span>
                              <Link
                                to={`/admin/inventory?search=${encodeURIComponent(product.name)}`}
                                className={`font-semibold hover:underline cursor-pointer inline-flex items-center space-x-1 ${
                                  totalStock === 0
                                    ? 'text-red-600'
                                    : totalStock <= 10
                                      ? 'text-amber-600'
                                      : 'text-emerald-700'
                                }`}
                                title={language === 'th' ? 'จัดการสต็อกในหน้าคลังสินค้า' : 'Manage in Inventory'}
                              >
                                <span>
                                  {language === 'th' ? `สต็อก: ${totalStock} ชิ้น` : `Stock: ${totalStock} units`}
                                </span>
                              </Link>
                              <span>•</span>
                              <span>
                                ★ {product.rating || 4.9} ({product.reviewsCount || 24})
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
                          </>
                        );
                      })()}
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

                    {/* Status & Quick Toggle */}
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          disabled={togglingId === product.id}
                          onClick={() => handleToggleStatus(product)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            product.isActive !== false ? 'bg-emerald-500' : 'bg-gray-300'
                          } ${togglingId === product.id ? 'opacity-50 cursor-wait' : ''}`}
                          title={
                            product.isActive !== false
                              ? language === 'th'
                                ? 'คลิกเพื่อเปลี่ยนเป็นฉบับร่าง (ซ่อนจากหน้าร้าน)'
                                : 'Click to unpublish (hide from storefront)'
                              : language === 'th'
                                ? 'คลิกเพื่อเผยแพร่สินค้าทันที'
                                : 'Click to publish live'
                          }
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              product.isActive !== false ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-black uppercase ${
                            product.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              product.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                            }`}
                          />
                          {product.isActive !== false
                            ? language === 'th'
                              ? 'เผยแพร่'
                              : 'Live'
                            : language === 'th'
                              ? 'ฉบับร่าง'
                              : 'Draft'}
                        </span>
                      </div>
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
                      <div className="flex items-center justify-end space-x-1.5">
                        <Link
                          to={`/admin/inventory?search=${encodeURIComponent(product.name)}`}
                          className="p-1.5 text-gray-500 hover:text-[#D97706] hover:bg-amber-50 rounded-xs transition-colors"
                          title={language === 'th' ? 'จัดการสต็อกในหน้าคลังสินค้า' : 'Manage in Inventory'}
                        >
                          <Boxes size={16} />
                        </Link>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="p-1.5 text-gray-500 hover:text-[#D97706] hover:bg-amber-50 rounded-xs transition-colors"
                          title={language === 'th' ? 'แก้ไขสเปกสินค้า' : 'Edit Product'}
                        >
                          <Edit size={16} />
                        </Link>
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
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
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

    </AdminLayout>
  );
}
