import React from 'react';
import type { Metadata } from 'next';
import { TermsContentView } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Terms of Service — NIDA Modern Classic Apparel',
  description:
    'Review the Terms of Service, order contract conditions, payment terms, and intellectual property rights for the NIDA Official Online Store.',
  openGraph: {
    title: 'Terms of Service — NIDA Modern Classic Apparel',
    description:
      'Review the Terms of Service, order contract conditions, payment terms, and intellectual property rights for the NIDA Official Online Store.',
    siteName: 'NIDA Official Store',
    type: 'website',
  },
};

export default function TermsPage() {
  return <TermsContentView />;
}
