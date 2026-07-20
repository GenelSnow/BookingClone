'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Shield, Building2, LogOut, User, Calendar, Heart } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('usuario');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setUserRole(profile?.role || 'usuario');
      }
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setUserRole(profile?.role || 'usuario');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push('/login');
  };

  const canAccessAdmin = userRole === 'admin' || userRole === 'hotelero';

  return (
    <header className="bg-[#003580] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold tracking-tight">booking</Link>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 hover:bg-white/10 px-4 py-2 rounded-full transition-colors"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={18} />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-none">
                    {user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-white/70 capitalize">{userRole}</p>
                </div>
              </button>

              {/* Menú Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-gray-900 rounded-2xl shadow-2xl py-2 z-50 border">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold">{user.email}</p>
                    <p className="text-sm text-gray-500 capitalize">Rol: {userRole}</p>
                  </div>

                  <Link href="/perfil" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
                    <User size={20} />
                    Mi Perfil
                  </Link>

                  <Link href="/mis-reservas" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
                    <Calendar size={20} />
                    Mis Reservas
                  </Link>

                  {canAccessAdmin && (
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
                      {userRole === 'admin' ? <Shield size={20} /> : <Building2 size={20} />}
                      {userRole === 'admin' ? 'Panel Administrador' : 'Gestionar Hoteles'}
                    </Link>
                  )}

                  <div className="border-t my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-gray-100 text-left"
                  >
                    <LogOut size={20} />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button className="bg-white text-[#003580] hover:bg-gray-100">Iniciar Sesión</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}