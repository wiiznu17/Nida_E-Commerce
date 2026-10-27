import React from 'react';

export interface StandaloneFooterProps {
  note?: string;
}

export function StandaloneFooter({ note }: StandaloneFooterProps) {
  const currentYear = new Date().getFullYear();
  const defaultNote = `© ${currentYear} NIDA. All rights reserved. • Secured by Omise Payment Gateway (PCI-DSS Level 1)`;

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full pt-12 pb-4 text-center">
      <p className="text-[11px] text-stone-400 font-medium">
        {note ?? defaultNote}
      </p>
    </div>
  );
}
