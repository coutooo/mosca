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
  title: 'Drosophila Grand Prix — The Self-Driving Fruit Fly',
  description:
    'Watch an adult Drosophila melanogaster central nervous system pilot a Grand Prix circuit 100% autonomously using optical flow and synaptic plasticity. 165,122 biological neurons.',
  openGraph: {
    title: 'Drosophila Grand Prix — The Self-Driving Fruit Fly',
    description:
      'Autonomous racing powered by the 165,122-neuron Janelia Drosophila connectome. Scheduled official race heats.',
    siteName: 'Drosophila Grand Prix',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drosophila Grand Prix — Autonomous Connectome Racing',
    description:
      'A biological fruit fly brain racing an F1-style circuit with zero human inputs.',
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
