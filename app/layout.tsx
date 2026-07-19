import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from '@/lib/supabase/server';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Booking Clone",
  description: "Proyecto de graduación",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${geist.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {/* Header global */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-600">booking</h1>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    Hola, {user.email?.split('@')[0]}
                  </span>
                  <a href="/logout" className="text-red-600 text-sm hover:underline">
                    Cerrar sesión
                  </a>
                </div>
              ) : (
                <a href="/login" className="text-blue-600 hover:underline">
                  Iniciar sesión
                </a>
              )}
            </div>
          </div>
        </header>

        {children}
        <Toaster />
      </body>
    </html>
  );
}