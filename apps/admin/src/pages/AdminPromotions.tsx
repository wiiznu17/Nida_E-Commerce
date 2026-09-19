import { useState, type FormEvent } from 'react';
import { Plus, Trash2, CheckCircle2, X, Clock, Copy, Check } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';

export default function AdminPromotions() {
  const { language } = useLanguage();
  const { couponsList, addCoupon, toggleCouponActive, deleteCoupon } = useAdmin();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New coupon form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: 20,
    minOrderAmount: 100,
    usageLimit: 500,
    expiresAt: '2026-12-31',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    addCoupon({
      code: formData.code.toUpperCase().trim(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount),
      usageLimit: Number(formData.usageLimit),
      expiresAt: formData.expiresAt,
      isActive: true,
    });

    setIsAddModalOpen(false);
    showToast(
      language === 'th'
        ? `สร้างโค้ดส่วนลด "${formData.code.toUpperCase()}" สำเร็จแล้ว`
        : `Promo code ${formData.code.toUpperCase()} created successfully`,
    );
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderAmount: 100,
      usageLimit: 500,
      expiresAt: '2026-12-31',
    });
  };

  const handleDelete = (id: string, code: string) => {
    if (
      window.confirm(
        language === 'th' ? `คุณต้องการลบโค้ด "${code}" หรือไม่?` : `Are you sure you want to delete coupon "${code}"?`,
      )
    ) {
      deleteCoupon(id);
      showToast(language === 'th' ? `ลบโค้ดส่วนลด "${code}" เรียบร้อย` : `Coupon "${code}" deleted`);
    }
  };

  return (
    <AdminLayout
      title={language === 'th' ? 'แคมเปญและโค้ดส่วนลด' : 'Promotions & Coupon Codes'}
      subtitle={
        language === 'th'
          ? 'สร้างโค้ดโปรโมชัน กำหนดเปอร์เซ็นต์ส่วนลด และจำกัดสิทธิ์การใช้งาน'
          : 'Configure marketing promo codes, discount percentages, and quota limits'
      }
      actionButton={
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#2B1810] hover:bg-[#D97706] text-white px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 shadow-xs"
        >
          <Plus size={16} />
          <span>{language === 'th' ? 'สร้างโค้ดส่วนลดใหม่' : 'Create New Promo'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 text-xs font-bold flex items-center rounded-xs animate-in fade-in">
            <CheckCircle2 size={16} className="mr-2 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Active Promotions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {couponsList.map((coupon) => {
            const usagePercent = Math.min(100, Math.round((coupon.usageCount / coupon.usageLimit) * 100));

            return (
              <div
                key={coupon.id}
                className={`bg-white border p-5 relative overflow-hidden transition-all shadow-xs ${
                  coupon.isActive ? 'border-[#EAE3D9] hover:border-[#2B1810]' : 'border-gray-200 opacity-60 bg-gray-50'
                }`}
              >
                {/* Header badge & status toggle */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-xs ${
                      coupon.isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {coupon.isActive
                      ? language === 'th'
                        ? 'เปิดใช้งานอยู่'
                        : 'Active'
                      : language === 'th'
                        ? 'ปิดใช้งาน'
                        : 'Inactive'}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleCouponActive(coupon.id)}
                      className="text-xs font-bold text-gray-500 hover:text-[#2B1810] underline"
                    >
                      {coupon.isActive
                        ? language === 'th'
                          ? 'ปิด'
                          : 'Deactivate'
                        : language === 'th'
                          ? 'เปิด'
                          : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id, coupon.code)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title={language === 'th' ? 'ลบโค้ด' : 'Delete'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Coupon Code Block */}
                <div className="flex items-center justify-between bg-[#FAF7F2] p-3 border border-dashed border-[#2B1810] mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                      PROMO CODE
                    </span>
                    <span className="font-mono font-black text-lg text-[#2B1810]">{coupon.code}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className="p-1.5 text-[#2B1810] hover:bg-white rounded-xs border border-transparent hover:border-gray-300 transition-colors"
                    title="Copy Code"
                  >
                    {copiedCode === coupon.code ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>

                {/* Discount Value */}
                <div className="text-sm font-bold text-[#2B1810] mb-2">
                  {coupon.discountType === 'PERCENTAGE' ? (
                    <span>
                      ลด {coupon.discountValue}% (ขั้นต่ำ ${coupon.minOrderAmount})
                    </span>
                  ) : (
                    <span>
                      ลด ${coupon.discountValue} (ขั้นต่ำ ${coupon.minOrderAmount})
                    </span>
                  )}
                </div>

                {/* Usage Progress */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] font-bold text-gray-500">
                    <span>{language === 'th' ? 'สิทธิ์ที่ถูกใช้แล้ว' : 'Redeemed Quota'}</span>
                    <span className="font-mono text-[#2B1810]">
                      {coupon.usageCount} / {coupon.usageLimit} ({usagePercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#D97706] h-full transition-all duration-300"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="flex items-center text-[11px] text-gray-400 font-medium">
                  <Clock size={12} className="mr-1" />
                  <span>
                    {language === 'th' ? 'หมดอายุ:' : 'Expires:'} {coupon.expiresAt}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Coupon Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1810]/50 backdrop-blur-xs">
          <div className="bg-white border border-[#EAE3D9] max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-black uppercase text-[#2B1810]">
                  {language === 'th' ? 'สร้างโค้ดส่วนลดใหม่' : 'Create New Coupon'}
                </h3>
                <p className="text-xs text-gray-500">สำหรับใช้งานบนระบบเช็คเอาท์และแคมเปญ</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  รหัสโค้ด (Coupon Code) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="เช่น NIDA25, SUMMER50"
                  className="w-full border border-gray-300 px-3 py-2 font-mono font-bold uppercase focus:outline-none focus:border-[#2B1810]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    ประเภทส่วนลด (Type)
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as 'PERCENTAGE' | 'FIXED',
                      })
                    }
                    className="w-full border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:border-[#2B1810]"
                  >
                    <option value="PERCENTAGE">เปอร์เซ็นต์ (%)</option>
                    <option value="FIXED">จำนวนเงินตายตัว ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    มูลค่าส่วนลด (Value) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full border border-gray-300 px-3 py-2 font-mono font-bold focus:outline-none focus:border-[#2B1810]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    ยอดสั่งซื้อขั้นต่ำ ($ Min)
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#2B1810]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    จำกัดจำนวนสิทธิ์ (Quota)
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#2B1810]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  วันหมดอายุ (Expiry Date) *
                </label>
                <input
                  type="date"
                  required
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#2B1810]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
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
                  {language === 'th' ? 'สร้างโค้ด' : 'Create Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
