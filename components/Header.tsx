'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { User, LogOut, Hotel } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
          <Hotel size={32} />
          <span>BookingClone</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-blue-600">Hoteles</Link>
          <Link href="/mis-reservas" className="hover:text-blue-600">Mis Reservas</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/perfil">
                <Button variant="ghost" size="sm">
                  <User size={18} className="mr-2" />
                  {user.email?.split('@')[0]}
                </Button>
              </Link>

              {/* Botón Admin Temporal - Visible para pruebas */}
              <Link href="/admin">
                <Button variant="default" size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Panel Admin
                </Button>
              </Link>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={18} />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button>Iniciar sesión</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}