import type { Metadata } from 'next';
import {
  Montserrat,
  Inter,
  Playfair_Display,
  IBM_Plex_Sans_Thai,
} from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Layout } from '@/components/layout';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: '--font-thai',
  subsets: ['thai'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NIDA — Modern Heritage Apparel & Lifestyle',
  description:
    "Discover Nida's iconic prep-inspired apparel, leather bags, footwear, and home lifestyle. Founded by Phannida — intentional design, uncomprised spirit.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${montserrat.variable} ${inter.variable} ${playfair.variable} ${ibmPlexSansThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
