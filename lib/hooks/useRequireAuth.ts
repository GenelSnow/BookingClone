'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Options = {
  /** Roles permitidos. Si no se pasa, solo exige estar logueado */
  allowedRoles?: string[];
  /** Ruta a la que redirigir si no cumple (default: /login) */
  redirectTo?: string;
};

export function useRequireAuth(options: Options = {}) {
  const { allowedRoles, redirectTo = '/login' } = options;
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace(redirectTo);
        return;
      }

      // Si se piden roles específicos, consultamos profiles
      if (allowedRoles && allowedRoles.length > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const userRole = profile?.role || 'usuario';

        if (!allowedRoles.includes(userRole)) {
          router.replace('/'); // o una página de "no autorizado"
          return;
        }

        setRole(userRole);
      }

      setUser(user);
      setLoading(false);
    };

    check();
  }, [router, redirectTo, allowedRoles?.join(',')]);

  return { user, role, loading };
}