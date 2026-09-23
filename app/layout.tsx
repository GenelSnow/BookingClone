import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'Booking.com Clone | Hoteles y alojamientos',
  description: 'Proyecto de graduación — clon funcional de Booking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${geist.variable} antialiased bg-[#f5f5f5] min-h-screen flex flex-col`}
        suppressHydrationWarning={true}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}