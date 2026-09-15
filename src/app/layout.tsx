import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FlyEye ASO — Biologically Proven App Icon A/B Testing',
  description:
    'Test and optimize your iOS App Icons using the simulated 165,122-neuron central nervous system of Drosophila melanogaster. 100% client-side biological ASO.',
  openGraph: {
    title: 'FlyEye ASO — Biologically Proven App Icon A/B Testing',
    description:
      'Test your App Icons against 165,122 biological neurons from the Janelia Drosophila connectome.',
    siteName: 'FlyEye ASO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlyEye ASO — App Icon A/B Testing by Fruit Fly Brain',
    description:
      'The world’s first biological ASO suite powered by Drosophila melanogaster connectome.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
