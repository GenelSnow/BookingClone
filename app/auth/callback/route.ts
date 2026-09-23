'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Confirmando tu cuenta...');

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();

      const { error } = await supabase.auth.getSession();

      if (error) {
        setMessage('El enlace no es válido o ya expiró. Si ya confirmaste, inicia sesión.');
        setTimeout(() => router.replace('/login'), 2500);
        return;
      }

      setMessage('Correo confirmado. Redirigiendo...');
      setTimeout(() => router.replace('/login'), 1200);
    };

    run();
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6 text-center">
      <p className="text-gray-700">{message}</p>
    </div>
  );
}