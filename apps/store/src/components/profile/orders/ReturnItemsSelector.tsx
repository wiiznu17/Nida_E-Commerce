'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiOrderItem } from '@repo/types';

export interface ReturnItemSelection {
  selected: boolean;
  quantity: number;
}

interface ReturnItemsSelectorProps {
  items: ApiOrderItem[];
  selectedItems: Record<string, ReturnItemSelection>;
  onChange: (
    updater: (
      prev: Record<string, ReturnItemSelection>,
    ) => Record<string, ReturnItemSelection>,
  ) => void;
}

export function ReturnItemsSelector({
  items,
  selectedItems,
  onChange,
}: ReturnItemsSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2 font-sans">
      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
        {t('orderDetail.returnModal.selectItemsLabel')}
      </label>
      <div className="divide-y divide-gray-100 border border-gray-200 rounded-xs bg-stone-50/40 p-2 space-y-1">
        {items.map((item) => {
          const state = selectedItems[item.id] ?? {
            selected: false,
            quantity: 1,
          };
          return (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 px-1 text-xs"
            >
              <label className="flex items-center space-x-2.5 cursor-pointer min-w-0 pr-2">
                <input
                  type="checkbox"
                  checked={state.selected}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      [item.id]: {
                        ...state,
                        selected: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 text-brand-dark-brown border-gray-300 rounded-xs cursor-pointer"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-stone-800 truncate">
                    {item.productName}
                  </p>
                  <p className="text-[11px] text-stone-500">{item.variantInfo}</p>
                </div>
              </label>

              {state.selected && (
                <div className="flex items-center space-x-1 shrink-0">
                  <span className="text-[11px] text-stone-500 font-mono">
                    {t('orderDetail.returnModal.qtyLabel')}:
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={item.quantity}
                    value={state.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onChange((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...state,
                          quantity: isNaN(val)
                            ? 1
                            : Math.min(item.quantity, Math.max(1, val)),
                        },
                      }));
                    }}
                    className="w-14 px-2 py-1 border border-gray-300 rounded-xs text-xs text-center font-mono font-bold"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
