'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { User, LogOut, Shield, Building2 } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('usuario');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Usuario actual:", user?.email, user?.id);
      setUser(user);

      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, is_admin')
          .eq('id', user.id)
          .single();

        console.log("Perfil encontrado:", profile);
        console.log("Error al cargar perfil:", error);

        if (profile) {
          setUserRole(profile.role || (profile.is_admin ? 'admin' : 'usuario'));
        } else {
          setUserRole('usuario');
        }
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
      } else {
        setUserRole('usuario');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const canAccessAdmin = userRole === 'admin' || userRole === 'hotelero';

  const getRoleLabel = () => {
    if (userRole === 'admin') return 'Panel Admin';
    if (userRole === 'hotelero') return 'Mi Negocio';
    return '';
  };

  return (
    <header className="bg-[#003580] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold">booking</Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm hidden md:block">
                {user.email?.split('@')[0]}
              </span>

              {canAccessAdmin && (
                <Link href="/admin">
                  <Button variant="secondary" size="sm" className="bg-white text-[#003580] flex items-center gap-2">
                    {userRole === 'admin' ? <Shield size={16} /> : <Building2 size={16} />}
                    {getRoleLabel()}
                  </Button>
                </Link>
              )}

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={18} />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}