'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { User, LogOut, Menu, Hotel } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
    router.refresh(); // Forza refresh de server components
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
          <Hotel size={32} />
          <span>BookingClone</span>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">Hoteles</Link>
          <Link href="/mis-reservas" className="hover:text-blue-600 transition-colors">Mis Reservas</Link>
        </nav>

        {/* Usuario */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/perfil">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User size={18} />
                  <span className="hidden md:inline">{user.email?.split('@')[0]}</span>
                </Button>
              </Link>
              
              {user.email?.includes('admin') && ( // o usa un rol en profiles
                <Link href="/admin">
                  <Button variant="outline" size="sm">Admin</Button>
                </Link>
              )}

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut size={18} />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button>Iniciar sesión</Button>
            </Link>
          )}

          {/* Menú móvil */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={20} />
          </Button>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white px-6 py-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="py-2">Hoteles</Link>
            <Link href="/mis-reservas" className="py-2">Mis Reservas</Link>
          </div>
        </div>
      )}
    </header>
  );
}