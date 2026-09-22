'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Building2,
  LogOut,
  User,
  Calendar,
  HelpCircle,
  Bell,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Booking.com Clone | Hoteles y alojamientos',
  description: 'Proyecto de graduación — clon funcional de Booking',
};

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

    const { data: listener } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setUserRole(profile?.role || 'usuario');
      } else {
        setUserRole('usuario');
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
    <header className="bg-[#003580] text-white sticky top-0 z-50">
      {/* Fila superior */}
      <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-[24px] font-bold tracking-tight lowercase">
          Booking<span className="text-[#febb02]">.com</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/10"
            title="Ayuda"
          >
            <HelpCircle size={20} />
          </button>
          <button
            type="button"
            className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/10"
            title="Notificaciones"
          >
            <Bell size={20} />
          </button>

          {canAccessAdmin && (
            <Link
              href="/admin"
              className="hidden md:inline-flex text-sm font-medium px-3 py-2 rounded-md border border-white/40 hover:bg-white/10"
            >
              {userRole === 'admin' ? 'Admin' : 'Mis hoteles'}
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:bg-white/10 px-2 py-1.5 rounded-md"
              >
                <div className="w-8 h-8 rounded-full bg-[#0071c2] flex items-center justify-center text-sm font-semibold">
                  {(user.email?.[0] || 'U').toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                  {user.email?.split('@')[0]}
                </span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white text-gray-900 rounded-lg shadow-xl py-2 z-50 border">
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold text-sm truncate">{user.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                    </div>
                    <Link
                      href="/perfil"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User size={18} /> Mi perfil
                    </Link>
                    <Link
                      href="/mis-reservas"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Calendar size={18} /> Mis reservas
                    </Link>
                    {canAccessAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        {userRole === 'admin' ? <Shield size={18} /> : <Building2 size={18} />}
                        {userRole === 'admin' ? 'Panel admin' : 'Gestionar hoteles'}
                      </Link>
                    )}
                    <div className="border-t my-1" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left text-red-600 hover:bg-gray-50"
                    >
                      <LogOut size={18} /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white/10 hover:text-white text-sm h-9"
                >
                  Regístrate
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-white text-[#003580] hover:bg-gray-100 text-sm h-9 font-semibold">
                  Inicia sesión
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Nav secundaria tipo Booking */}
      <div className="border-t border-white/10">
        <div className="max-w-[1100px] mx-auto px-4 flex gap-1 overflow-x-auto">
          <Link
            href="/"
            className="px-4 py-3 text-sm font-medium border-b-2 border-white whitespace-nowrap"
          >
            Alojamiento
          </Link>
          <span className="px-4 py-3 text-sm text-white/60 whitespace-nowrap cursor-default">
            Vuelos
          </span>
          <span className="px-4 py-3 text-sm text-white/60 whitespace-nowrap cursor-default">
            Vuelo + Hotel
          </span>
          <span className="px-4 py-3 text-sm text-white/60 whitespace-nowrap cursor-default">
            Alquiler de coches
          </span>
        </div>
      </div>
    </header>
  );
}