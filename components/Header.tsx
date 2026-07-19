'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-blue-600">booking</Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Hola, {user.email?.split('@')[0]}
              </span>
              <button 
                onClick={handleLogout}
                className="text-red-600 text-sm hover:underline"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-blue-600 hover:underline">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}