import React from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { BannerPlacement } from '@repo/types';
import type { ApiCmsBanner } from '@repo/types';

interface BannerListTableProps {
  banners: ApiCmsBanner[];
  onEdit: (banner: ApiCmsBanner) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onSelectPreviewBanner?: (banner: ApiCmsBanner) => void;
}

export const BannerListTable: React.FC<BannerListTableProps> = ({
  banners,
  onEdit,
  onDelete,
  onAddNew,
  onSelectPreviewBanner,
}) => {
  return (
    <div className="bg-white rounded-xs border border-stone-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Header Action Bar */}
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
            Banners & Sliders ({banners.length})
          </h3>
          <p className="text-[11px] text-stone-500">
            Manage carousel slides, promo ribbons, and campaigns
          </p>
        </div>
        <button
          type="button"
          onClick={onAddNew}
          className="px-3.5 py-1.5 bg-[#2B1810] text-white font-black text-xs uppercase tracking-wider rounded-xs hover:bg-[#3D2317] transition-colors flex items-center shadow-xs"
        >
          <Plus size={14} className="mr-1" />
          Add Slide
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="p-10 text-center text-stone-500">
          <p className="text-xs font-bold uppercase tracking-wider mb-2">
            No Banners Configured
          </p>
          <p className="text-[11px] text-stone-400 mb-4">
            Create your first hero banner slide to customize the storefront homepage.
          </p>
          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2 border border-stone-300 text-stone-700 font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-stone-50"
          >
            Create Banner
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-black uppercase tracking-wider text-stone-500">
                <th className="py-2.5 px-3 w-16 text-center">Thumb</th>
                <th className="py-2.5 px-3">Title / Copy</th>
                <th className="py-2.5 px-3 w-32 text-center">Placement</th>
                <th className="py-2.5 px-3 w-20 text-center">Order</th>
                <th className="py-2.5 px-3 w-24 text-center">Status</th>
                <th className="py-2.5 px-3 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {banners.map((item) => {
                const isHero = item.placement === BannerPlacement.HERO_HOME;
                const isSpotlight = item.placement === BannerPlacement.SEASONAL_SPOTLIGHT;
                const isRibbon = item.placement === BannerPlacement.PROMO_RIBBON;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-stone-50/70 transition-colors cursor-pointer"
                    onClick={() => onSelectPreviewBanner?.(item)}
                  >
                    {/* Thumbnail */}
                    <td className="py-2.5 px-3 w-16 text-center">
                      <div className="w-12 h-8 rounded-xs overflow-hidden bg-stone-200 border border-stone-200 mx-auto">
                        <img
                          src={item.imageDesktopUrl}
                          alt={item.titleEn || item.title || 'Banner'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#2B1810] line-clamp-1">
                        {item.titleEn || item.titleTh || item.title || 'Untitled Banner'}
                      </div>
                      <div className="text-[10px] text-stone-500 line-clamp-1">
                        {item.titleTh && item.titleEn ? item.titleTh : item.subtitle || item.subtitleEn || '-'}
                      </div>
                    </td>

                    {/* Placement */}
                    <td className="py-2.5 px-3 w-32 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-xs ${
                          isHero
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : isSpotlight
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                              : isRibbon
                                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {isHero ? 'Hero Home' : isSpotlight ? 'Spotlight Bento' : isRibbon ? 'Promo Ribbon' : 'Collection'}
                      </span>
                    </td>

                    {/* Sort Order */}
                    <td className="py-2.5 px-3 w-20 text-center font-mono font-bold text-stone-600">
                      #{item.sortOrder}
                    </td>

                    {/* Active Status */}
                    <td className="py-2.5 px-3 w-24 text-center">
                      {item.isActive ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold text-stone-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-300 mr-1.5" />
                          Disabled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-2.5 px-3 w-24 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-stone-600 hover:text-[#2B1810] hover:bg-stone-100 rounded-xs transition-colors"
                          title="Edit Banner"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this banner slide?')) {
                              onDelete(item.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors"
                          title="Delete Banner"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
