import React from 'react';
import { Loader2 } from 'lucide-react';

export const AdminPageLoader: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 size={32} className="animate-spin text-brand-brown" />
      <span className="text-[11px] font-black uppercase tracking-widest text-stone-500">
        Loading...
      </span>
    </div>
  );
};

