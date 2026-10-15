import React from 'react';
import { Search, X } from 'lucide-react';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholderText: string;
}

export function MobileSearchOverlay({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onSubmit,
  placeholderText,
}: MobileSearchOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 w-full bg-white border-b-2 border-[#2B1810] shadow-2xl z-40 py-8 px-4 animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={onSubmit}>
          <div className="flex items-center border-b-2 border-[#2B1810] pb-3">
            <Search size={24} className="text-[#2B1810] mr-3" />
            <input
              type="text"
              placeholder={placeholderText}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="w-full text-lg font-medium text-[#2B1810] placeholder-gray-400 outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-[#2B1810] p-1 ml-2 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
