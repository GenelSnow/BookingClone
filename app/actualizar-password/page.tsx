'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ActualizarPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async () => {
    if (password.length < 6) {
      toast.error('Mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Contraseña actualizada');
    router.push('/login');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-bold">Nueva contraseña</h1>
        <div className="space-y-2">
          <Label>Contraseña nueva</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <Button
          className="w-full bg-[#0071c2] hover:bg-[#005fa3]"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar contraseña'}
        </Button>
      </div>
    </div>
  );
}