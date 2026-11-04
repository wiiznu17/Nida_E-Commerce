import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import {
  Montserrat,
  Inter,
  Playfair_Display,
  IBM_Plex_Sans_Thai,
} from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Layout } from '@/components/layout';
import type { Language } from '@/context/LanguageContext';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: '--font-thai',
  subsets: ['thai'],
  weight: ['400', '500', '600', '700'],
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const rawLang = cookieStore.get('nida_lang')?.value;
  const initialLanguage: Language = rawLang === 'en' ? 'en' : 'th';

  return (
    <html
      lang={initialLanguage}
      className={`${montserrat.variable} ${inter.variable} ${playfair.variable} ${ibmPlexSansThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers initialLanguage={initialLanguage}>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
