import { ImageIcon, Palette, Plus, Trash2, X, Lock } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { ImageUploader } from '../../media';
import { PRESET_COLORS, getColorName } from './formConstants';
import type { FormMediaSectionProps } from './formTypes';

export function FormMediaSection({
  isTh,
  isEdit,
  initialColors,
  image,
  secondaryImage,
  selectedColors,
  customColor,
  colorImages,
  onImageChange,
  onSecondaryImageChange,
  onCustomColorChange,
  onAddCustomColor,
  onRemoveColor,
  onToggleColor,
  onColorImageChange,
  onUseMasterImageForColor,
}: FormMediaSectionProps) {
  const { t } = useLanguage();

  const isColorLocked = (hex: string) =>
    Boolean(isEdit && initialColors?.some((c) => c.toLowerCase() === hex.toLowerCase()));

  return (
    <div
      id="sec-media"
      className="w-full bg-white border border-[#EAE3D9] p-4 sm:p-6 rounded-md shadow-2xs space-y-5"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <ImageIcon size={16} className="text-[#D97706]" />
          <h2 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
            {t('product.mediaColors')}
          </h2>
        </div>
      </div>

      {/* Master Cover & Hover Photos Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-3.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-md">
          <ImageUploader
            value={image}
            onChange={onImageChange}
            label={t('product.primaryCover')}
            description={t('product.primaryCoverDesc')}
            aspectRatio="portrait"
          />
        </div>

        <div className="p-3.5 bg-[#FAF7F2] border border-[#EAE3D9] rounded-md">
          <ImageUploader
            value={secondaryImage}
            onChange={onSecondaryImageChange}
            label={t('product.secondaryHover')}
            description={t('product.secondaryHoverDesc')}
            aspectRatio="portrait"
          />
        </div>
      </div>

      {/* Color Swatches & Color-Specific Images Sub-section */}
      <div className="pt-4 border-t border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Palette size={15} className="text-[#D97706]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
              {t('product.colorSwatches')}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">
            {selectedColors.length} {t('product.colorsSelected')}
          </span>
        </div>

        {/* Color Presets Picker Bar */}
        <div className="p-3 bg-[#FAF7F2] border border-[#EAE3D9] rounded-md space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-gray-600">
              {t('product.brandPresets')}
            </span>

            {/* Custom Hex Adder */}
            <div className="flex items-center space-x-1.5">
              <input
                type="color"
                value={customColor}
                onChange={(e) => onCustomColorChange(e.target.value)}
                className="w-6 h-6 rounded-xs border border-gray-300 cursor-pointer p-0.5 bg-white"
                title={isTh ? 'จิ้มเลือกสี' : 'Pick custom color'}
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => onCustomColorChange(e.target.value)}
                placeholder="#HEX"
                className="w-20 text-[10px] p-1 border border-gray-300 rounded-xs font-mono uppercase bg-white outline-hidden"
              />
              <button
                type="button"
                onClick={onAddCustomColor}
                disabled={selectedColors.some(
                  (c) => c.toLowerCase() === customColor.toLowerCase(),
                )}
                className="text-[10px] font-bold px-2 py-1 bg-[#2B1810] text-[#F59E0B] rounded-xs hover:bg-[#3D2317] transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Plus size={11} className="inline mr-0.5" />
                {t('product.addColor')}
              </button>
            </div>
          </div>

          {/* Preset Chips */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {PRESET_COLORS.map((col) => {
              const isSelected = selectedColors.includes(col.hex);
              const locked = isColorLocked(col.hex);
              return (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => {
                    if (locked) return;
                    onToggleColor(col.hex);
                  }}
                  disabled={locked}
                  className={`flex flex-col items-center p-1.5 rounded-sm border text-center transition-all ${
                    locked
                      ? 'border-[#2B1810] bg-white ring-1 ring-[#2B1810] shadow-2xs opacity-90 cursor-not-allowed'
                      : isSelected
                        ? 'border-[#2B1810] bg-white ring-1 ring-[#2B1810] shadow-2xs cursor-pointer'
                        : 'border-gray-200 bg-white/70 hover:border-gray-300 cursor-pointer'
                  }`}
                  title={locked ? t('product.originalLockedColor') : col.name}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs mb-1"
                    style={{ backgroundColor: col.hex }}
                  />
                  <div className="flex items-center justify-center space-x-0.5 w-full">
                    <span className="text-[8px] font-bold text-gray-700 truncate">
                      {col.name.split(' ')[0]}
                    </span>
                    {locked && <Lock size={8} className="text-gray-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* All Selected Colors Pills Bar (with removal capability) */}
          <div className="pt-2 border-t border-[#EAE3D9] space-y-1.5">
            <span className="text-[10px] font-bold text-gray-600 block">
              {t('product.activeSelectedColors')}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedColors.length === 0 ? (
                <span className="text-[10px] text-gray-400 italic">
                  {t('product.noColorsSelected')}
                </span>
              ) : (
                selectedColors.map((hex) => {
                  const locked = isColorLocked(hex);
                  const colorName = getColorName(hex);
                  return (
                    <div
                      key={hex}
                      className="inline-flex items-center space-x-1.5 pl-2 pr-1.5 py-0.5 bg-white border border-[#2B1810] rounded-xs shadow-2xs text-[10px]"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-gray-400 shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="font-bold text-[#2B1810]">{colorName}</span>
                      <span className="font-mono text-gray-400 text-[9px]">{hex}</span>
                      {locked ? (
                        <span
                          title={t('product.originalLockedColor')}
                          className="text-gray-400 ml-0.5"
                        >
                          <Lock size={10} />
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRemoveColor(hex)}
                          className="p-0.5 text-gray-400 hover:text-red-600 rounded-xs transition-colors cursor-pointer"
                          title={`${t('product.deleteColor')} ${colorName}`}
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Color-specific Photos in Responsive Grid */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-gray-700 block">
            {t('product.photosPerColor')}
          </span>

          {selectedColors.length === 0 ? (
            <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-md text-center text-xs text-gray-400">
              {t('product.noColorPhotosPrompt')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedColors.map((hex) => {
                const colorName = getColorName(hex);
                const colorImg = colorImages[hex] || '';
                const locked = isColorLocked(hex);

                return (
                  <div
                    key={hex}
                    className="p-3 bg-white border border-[#EAE3D9] rounded-md shadow-2xs space-y-2 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-gray-400 shadow-2xs"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-xs font-bold text-[#2B1810]">{colorName}</span>
                        <span className="text-[10px] font-mono text-gray-400">{hex}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {!colorImg && image && (
                          <button
                            type="button"
                            onClick={() => onUseMasterImageForColor(hex)}
                            className="text-[10px] text-[#D97706] hover:underline font-bold cursor-pointer"
                          >
                            {t('product.useMaster')}
                          </button>
                        )}

                        {locked ? (
                          <span
                            className="p-1 text-gray-400"
                            title={t('product.originalLockedColor')}
                          >
                            <Lock size={12} />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onRemoveColor(hex)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                            title={`${t('product.deleteColor')} ${colorName}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <ImageUploader
                      value={colorImg}
                      onChange={(url) => onColorImageChange(hex, url)}
                      aspectRatio="portrait"
                      compact
                      description={`${t('product.specificPhoto')} ${colorName} (3:4)`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
