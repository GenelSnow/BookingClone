'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Completa el correo y la contraseña');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success('Sesión iniciada');
        router.push('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: email.split('@')[0] },
          },
        });
        if (error) throw error;
        toast.success('Revisa tu correo para confirmar tu cuenta');
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error('Escribe tu correo para recuperar la contraseña');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/actualizar-password`,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Te enviamos un enlace para restablecer tu contraseña');
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f5f5f5] flex flex-col">
      <div className="flex-1 flex items-start justify-center px-4 pt-10 pb-16">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-6">
            <Link href="/" className="text-2xl font-bold text-[#003580]">
              Booking<span className="text-[#febb02]">.com</span>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {isLogin ? 'Inicia sesión o crea una cuenta' : 'Crea una cuenta'}
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              {isLogin
                ? 'Puedes iniciar sesión para acceder a tus reservas'
                : 'Regístrate para guardar reservas y reseñas'}
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Dirección de e-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                />

                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-[#0071c2] hover:underline text-right w-full"
                    disabled={loading}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}

              </div>



              <Button
                onClick={handleAuth}
                disabled={loading}
                className="w-full h-12 bg-[#0071c2] hover:bg-[#005fa3] text-white text-[16px] font-bold"
              >
                {loading
                  ? 'Procesando...'
                  : isLogin
                    ? 'Continuar con e-mail'
                    : 'Crear cuenta'}
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-500">o</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-sm text-[#0071c2] font-medium hover:underline"
            >
              {isLogin
                ? '¿No tienes cuenta? Regístrate'
                : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-6 leading-relaxed px-2">
            Al iniciar sesión o registrarte, aceptas nuestros términos de uso y
            la política de privacidad de este proyecto académico.
          </p>
        </div>
      </div>
    </div>
  );
}