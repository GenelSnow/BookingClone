import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Header from '@/components/Header';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Booking Clone",
  description: "Proyecto de graduación",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body 
        className={`${inter.variable} ${geist.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  );
}