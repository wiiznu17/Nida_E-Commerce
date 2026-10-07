import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ImageIcon,
  DollarSign,
  Palette,
  Layers,
  FileText,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Product } from '../data/products';

export interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: Omit<Product, 'id'>) => void;
  isEdit?: boolean;
  isSubmitting?: boolean;
}

const PRESET_COLORS = [
  { name: 'Nida Espresso', hex: '#2B1810' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Imperial Gold', hex: '#F59E0B' },
  { name: 'Oatmeal Beige', hex: '#D4C3B3' },
  { name: 'Noir Black', hex: '#111827' },
  { name: 'Midnight Navy', hex: '#1E293B' },
  { name: 'Burgundy Wine', hex: '#831843' },
  { name: 'Forest Olive', hex: '#365314' },
];

const DEPARTMENTS = [
  { id: 'women', labelEn: 'Women', labelTh: 'เสื้อผ้าสตรี (Women)' },
  { id: 'men', labelEn: 'Men', labelTh: 'เสื้อผ้าบุรุษ (Men)' },
  { id: 'kids', labelEn: 'Kids', labelTh: 'เด็ก (Kids)' },
  { id: 'bags', labelEn: 'Bags', labelTh: 'กระเป๋าและเครื่องหนัง (Bags)' },
  { id: 'shoes', labelEn: 'Shoes', labelTh: 'รองเท้า (Shoes)' },
  { id: 'home', labelEn: 'Home', labelTh: 'ของแต่งบ้าน (Home & Living)' },
];

const CATEGORIES = [
  { id: 'apparel', labelEn: 'Apparel', labelTh: 'เครื่องแต่งกาย (Apparel)' },
  { id: 'bags', labelEn: 'Bags', labelTh: 'กระเป๋า (Bags)' },
  { id: 'shoes', labelEn: 'Shoes', labelTh: 'รองเท้า (Shoes)' },
  { id: 'home', labelEn: 'Home & Living', labelTh: 'ของใช้ในบ้าน (Home)' },
  { id: 'accessories', labelEn: 'Accessories', labelTh: 'เครื่องประดับ (Accessories)' },
];

const TAG_PRESETS = [
  { en: 'NEW ARRIVAL', th: 'สินค้าใหม่' },
  { en: 'BESTSELLER', th: 'สินค้าขายดี' },
  { en: 'SALE', th: 'ลดราคาพิเศษ' },
  { en: 'EXCLUSIVE', th: 'คอลเลกชันพิเศษ' },
  { en: 'LIMITED EDITION', th: 'จำนวนจำกัด' },
];

export function ProductForm({
  initialData,
  onSubmit,
  isEdit = false,
  isSubmitting = false,
}: ProductFormProps) {
  const { language } = useLanguage();
  const isTh = language === 'th';

  const [name, setName] = useState(initialData?.name || '');
  const [nameTh, setNameTh] = useState(initialData?.nameTh || '');
  const [price, setPrice] = useState<number | string>(initialData?.price ?? 120);
  const [originalPrice, setOriginalPrice] = useState<number | string>(
    initialData?.originalPrice ?? '',
  );
  const [department, setDepartment] = useState(initialData?.department || 'women');
  const [category, setCategory] = useState(initialData?.category || 'apparel');
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || 'Sweaters & Knits');
  const [subCategoryTh, setSubCategoryTh] = useState(
    initialData?.subCategoryTh || 'สเวตเตอร์และเสื้อไหมพรม',
  );
  const [tag, setTag] = useState(initialData?.tag || 'NEW ARRIVAL');
  const [tagTh, setTagTh] = useState(initialData?.tagTh || 'สินค้าใหม่');

  const [description, setDescription] = useState(
    initialData?.description ||
      'Crafted from sustainable materials with tailored cuts and refined hand-finishing for everyday elegance.',
  );
  const [descriptionTh, setDescriptionTh] = useState(
    initialData?.descriptionTh ||
      'ผลิตจากเส้นใยคุณภาพพรีเมียม ตัดเย็บอย่างประณีตด้วยมือเพื่อความสง่างามเหนือกาลเวลา สวมใส่สบายทุกโอกาส',
  );

  const [materialsCare, setMaterialsCare] = useState(
    initialData?.materialsCare || '100% Fine Combed Cotton. Dry clean or gentle hand wash cold.',
  );
  const [materialsCareTh, setMaterialsCareTh] = useState(
    initialData?.materialsCareTh ||
      'ผ้าฝ้ายหวีเนื้อละเอียด 100%. แนะนำให้ซักแห้งหรือซักมือด้วยน้ำเย็น ห้ามอบผ้าด้วยความร้อนสูง',
  );

  const [image, setImage] = useState(
    initialData?.image ||
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  );
  const [secondaryImage, setSecondaryImage] = useState(
    initialData?.secondaryImage ||
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  );

  const [selectedColors, setSelectedColors] = useState<string[]>(
    initialData?.colors && initialData.colors.length > 0
      ? initialData.colors
      : ['#2B1810', '#FFFFFF', '#F59E0B'],
  );
  const [customColor, setCustomColor] = useState('#D4C3B3');

  const [error, setError] = useState<string | null>(null);

  // Discount % calculation
  const numericPrice = Number(price) || 0;
  const numericOriginal = Number(originalPrice) || 0;
  const discountPercent =
    numericOriginal > numericPrice && numericPrice > 0
      ? Math.round(((numericOriginal - numericPrice) / numericOriginal) * 100)
      : null;

  const toggleColor = (hex: string) => {
    if (selectedColors.includes(hex)) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter((c) => c !== hex));
      }
    } else {
      setSelectedColors([...selectedColors, hex]);
    }
  };

  const addCustomColor = () => {
    if (customColor && !selectedColors.includes(customColor)) {
      setSelectedColors([...selectedColors, customColor]);
    }
  };

  const handleSelectTagPreset = (preset: { en: string; th: string }) => {
    setTag(preset.en);
    setTagTh(preset.th);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(isTh ? 'กรุณากรอกชื่อสินค้าภาษาอังกฤษ' : 'English Product Name is required');
      return;
    }

    if (!numericPrice || numericPrice <= 0) {
      setError(isTh ? 'ราคาขายต้องมากกว่า 0' : 'Price must be greater than 0');
      return;
    }

    if (!image.trim()) {
      setError(isTh ? 'กรุณาระบุ URL รูปภาพหลัก' : 'Primary image URL is required');
      return;
    }

    onSubmit({
      name: name.trim(),
      nameTh: nameTh.trim() || undefined,
      price: numericPrice,
      originalPrice: numericOriginal > 0 ? numericOriginal : undefined,
      image: image.trim(),
      secondaryImage: secondaryImage.trim() || undefined,
      category,
      department,
      subCategory: subCategory.trim() || undefined,
      subCategoryTh: subCategoryTh.trim() || undefined,
      tag: tag.trim() || undefined,
      tagTh: tagTh.trim() || undefined,
      description: description.trim() || undefined,
      descriptionTh: descriptionTh.trim() || undefined,
      materialsCare: materialsCare.trim() || undefined,
      materialsCareTh: materialsCareTh.trim() || undefined,
      colors: selectedColors,
      rating: initialData?.rating ?? 5.0,
      reviewsCount: initialData?.reviewsCount ?? 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
        <Link
          to="/admin/products"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-[#2B1810] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>{isTh ? 'กลับไปยังรายการสินค้า' : 'Back to Products'}</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/products"
            className="px-3.5 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
          >
            {isTh ? 'ยกเลิก' : 'Cancel'}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#1E110A] bg-[#F59E0B] hover:bg-[#D97706] rounded-md shadow-xs transition-colors inline-flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Check size={14} />
            <span>
              {isSubmitting
                ? isTh
                  ? 'กำลังบันทึก...'
                  : 'Saving...'
                : isEdit
                  ? isTh
                    ? 'บันทึกการแก้ไข'
                    : 'Save Changes'
                  : isTh
                    ? 'บันทึกและเผยแพร่'
                    : 'Publish Product'}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 text-xs font-bold rounded-md flex items-center space-x-2 animate-in fade-in">
          <AlertCircle size={15} className="text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Form Details (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Basic Info */}
          <div className="bg-white border border-[#EAE3D9] p-4 sm:p-5 rounded-md shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
              <FileText size={16} className="text-[#D97706]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {isTh ? '1. ข้อมูลพื้นฐานสินค้า (Bilingual)' : '1. Product General Info'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  {isTh ? 'ชื่อสินค้า (ภาษาอังกฤษ - บังคับ)' : 'Product Name (EN) *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Iconic Cable-Knit Crewneck Sweater"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  {isTh ? 'ชื่อสินค้า (ภาษาไทย - สำหรับหน้าร้าน)' : 'Product Name (TH)'}
                </label>
                <input
                  type="text"
                  value={nameTh}
                  onChange={(e) => setNameTh(e.target.value)}
                  placeholder="เช่น สเวตเตอร์ไหมพรมถักลายเคเบิล ซิกเนเจอร์"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] outline-hidden"
                />
              </div>
            </div>

            {/* Department & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  {isTh ? 'แผนกสินค้า (Department)' : 'Department'}
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] bg-white outline-hidden"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {isTh ? dept.labelTh : dept.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  {isTh ? 'หมวดหมู่สินค้า (Category)' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] bg-white outline-hidden"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {isTh ? cat.labelTh : cat.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub Category EN & TH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  {isTh ? 'หมวดหมู่ย่อย (EN)' : 'Sub Category (EN)'}
                </label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="e.g. Sweaters & Knits"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  {isTh ? 'หมวดหมู่ย่อย (TH)' : 'Sub Category (TH)'}
                </label>
                <input
                  type="text"
                  value={subCategoryTh}
                  onChange={(e) => setSubCategoryTh(e.target.value)}
                  placeholder="เช่น สเวตเตอร์และเสื้อไหมพรม"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] outline-hidden"
                />
              </div>
            </div>

            {/* Tags & Presets */}
            <div className="space-y-2 pt-1 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-700">
                  {isTh ? 'ป้ายกำกับสินค้า (Product Badge / Tag)' : 'Product Tag'}
                </label>
                <span className="text-[10px] text-gray-400">
                  {isTh ? 'คลิกแท็กสำเร็จรูปเพื่อเลือก' : 'Click preset to apply'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {TAG_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectTagPreset(p)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                      tag === p.en
                        ? 'bg-[#2B1810] text-white border-[#2B1810]'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {isTh ? p.th : p.en}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Tag EN (e.g. NEW ARRIVAL)"
                  className="w-full text-xs p-2 border border-gray-300 rounded-md uppercase"
                />
                <input
                  type="text"
                  value={tagTh}
                  onChange={(e) => setTagTh(e.target.value)}
                  placeholder="Tag TH (เช่น สินค้าใหม่)"
                  className="w-full text-xs p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* 2. Pricing Section */}
          <div className="bg-white border border-[#EAE3D9] p-4 sm:p-5 rounded-md shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center space-x-2">
                <DollarSign size={16} className="text-[#D97706]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                  {isTh ? '2. กำหนดราคาและส่วนลด (Pricing)' : '2. Pricing & Compare'}
                </h2>
              </div>
              {discountPercent !== null && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {isTh ? `ลดราคา ${discountPercent}%` : `Save ${discountPercent}%`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  {isTh ? 'ราคาขายจริง (USD) *' : 'Regular Price ($) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="129.00"
                    className="w-full text-xs p-2.5 pl-7 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  {isTh ? 'ราคาเต็มก่อนลด (Compare-at Price) - ไม่บังคับ' : 'Original Price ($) - Optional'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="179.00"
                    className="w-full text-xs p-2.5 pl-7 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Description & Craftsmanship */}
          <div className="bg-white border border-[#EAE3D9] p-4 sm:p-5 rounded-md shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
              <Layers size={16} className="text-[#D97706]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {isTh ? '3. คำบรรยายสินค้าและเนื้อผ้า (Story & Care)' : '3. Descriptions & Materials Care'}
              </h2>
            </div>

            {/* Product Descriptions */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  {isTh ? 'คำอธิบายสินค้า (ภาษาอังกฤษ)' : 'Description (EN)'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the garment silhouette, tailoring, and fit..."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  {isTh ? 'คำอธิบายสินค้า (ภาษาไทย)' : 'Description (TH)'}
                </label>
                <textarea
                  rows={3}
                  value={descriptionTh}
                  onChange={(e) => setDescriptionTh(e.target.value)}
                  placeholder="อธิบายจุดเด่นของชุด รูปทรง และความรู้สึกยามสวมใส่..."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] outline-hidden"
                />
              </div>
            </div>

            {/* Materials & Care */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-gray-100">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  {isTh ? 'วัสดุ & การดูแลรักษา (EN)' : 'Materials & Care (EN)'}
                </label>
                <textarea
                  rows={2}
                  value={materialsCare}
                  onChange={(e) => setMaterialsCare(e.target.value)}
                  placeholder="100% Cashmere. Dry clean only."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  {isTh ? 'วัสดุ & การดูแลรักษา (TH)' : 'Materials & Care (TH)'}
                </label>
                <textarea
                  rows={2}
                  value={materialsCareTh}
                  onChange={(e) => setMaterialsCareTh(e.target.value)}
                  placeholder="ผ้าแคชเมียร์ 100%. แนะนำซักแห้งเท่านั้น"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media, Colors, & Action Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 4. Media & Live Preview */}
          <div className="bg-white border border-[#EAE3D9] p-4 rounded-md shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
              <ImageIcon size={16} className="text-[#D97706]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {isTh ? 'รูปภาพสินค้า (Media)' : 'Product Media'}
              </h2>
            </div>

            {/* Live Preview Stage */}
            <div className="aspect-[3/4] bg-[#FAF7F2] border border-gray-200 rounded-md overflow-hidden relative flex items-center justify-center">
              {image ? (
                <img
                  src={image}
                  alt="Product Preview"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400 text-xs">
                  <ImageIcon size={32} className="mb-1" />
                  <span>{isTh ? 'ไม่มีรูปภาพ' : 'No Image Preview'}</span>
                </div>
              )}
              {tag && (
                <div className="absolute top-2 left-2 bg-[#2B1810] text-white text-[9px] font-black uppercase px-2 py-0.5 tracking-wider rounded-xs">
                  {tag}
                </div>
              )}
            </div>

            {/* Image URL Inputs */}
            <div className="space-y-2 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700">
                  {isTh ? 'URL รูปภาพหลัก *' : 'Primary Image URL *'}
                </label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-[11px] p-2 border border-gray-300 rounded-md outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700">
                  {isTh ? 'URL รูปภาพรอง (ตอน Hover)' : 'Secondary Image URL'}
                </label>
                <input
                  type="url"
                  value={secondaryImage}
                  onChange={(e) => setSecondaryImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-[11px] p-2 border border-gray-300 rounded-md outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          {/* 5. Colors Palette */}
          <div className="bg-white border border-[#EAE3D9] p-4 rounded-md shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
              <Palette size={16} className="text-[#D97706]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                {isTh ? 'ตัวเลือกสี (Color Swatches)' : 'Color Swatches'}
              </h2>
            </div>

            {/* Preset Color Pills */}
            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 font-bold">
                {isTh ? 'จานสีแนะนำของแบรนด์ Nida:' : 'Brand Color Presets:'}
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_COLORS.map((col) => {
                  const isSelected = selectedColors.includes(col.hex);
                  return (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => toggleColor(col.hex)}
                      className={`flex flex-col items-center p-1.5 rounded-md border text-center transition-all ${
                        isSelected
                          ? 'border-[#2B1810] bg-[#FAF7F2] ring-1 ring-[#2B1810]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-gray-300 shadow-2xs mb-1"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="text-[9px] font-bold text-gray-700 truncate w-full">
                        {col.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Input */}
            <div className="pt-2 border-t border-gray-100 flex items-center space-x-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="flex-1 text-xs p-1.5 border border-gray-300 rounded-md font-mono uppercase"
              />
              <button
                type="button"
                onClick={addCustomColor}
                className="p-2 bg-[#2B1810] text-white rounded-md hover:bg-[#D97706] transition-colors"
                title="Add Color"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Active Colors Preview */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-gray-500 block mb-1">
                {isTh ? 'สีที่เลือกไว้:' : 'Selected Colors:'} ({selectedColors.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedColors.map((hex) => (
                  <span
                    key={hex}
                    className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-full border border-gray-300 bg-gray-50"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-gray-400"
                      style={{ backgroundColor: hex }}
                    />
                    <span>{hex}</span>
                    {selectedColors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => toggleColor(hex)}
                        className="text-gray-400 hover:text-red-600 ml-0.5"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Sticky Submit Card */}
          <div className="bg-[#FAF7F2] border border-[#EAE3D9] p-4 rounded-md space-y-2.5 sticky top-20 shadow-xs">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 text-xs font-black uppercase tracking-wider text-[#1E110A] bg-[#F59E0B] hover:bg-[#D97706] rounded-md shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Check size={16} />
              <span>
                {isSubmitting
                  ? isTh
                    ? 'กำลังบันทึกข้อมูล...'
                    : 'Saving...'
                  : isEdit
                    ? isTh
                      ? 'บันทึกการแก้ไขสินค้า'
                      : 'Update Product'
                    : isTh
                      ? 'สร้างสินค้าใหม่'
                      : 'Create Product'}
              </span>
            </button>

            <Link
              to="/admin/products"
              className="w-full py-2 px-4 text-xs font-bold text-center text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors block"
            >
              {isTh ? 'ยกเลิกและย้อนกลับ' : 'Cancel and Return'}
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
