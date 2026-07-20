'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Perfil() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          hotels(name, city)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setBookings(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Información del usuario */}
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">Datos personales</h2>
            <p><strong>Correo:</strong> {user?.email}</p>
            <Button onClick={handleLogout} variant="destructive" className="w-full mt-6">
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>

        {/* Mis Reservas */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-6">Mis Reservas ({bookings.length})</h2>

            {bookings.length === 0 ? (
              <p className="text-gray-500">Aún no tienes reservas.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{booking.hotels.name}</h3>
                      <p className="text-sm text-gray-600">{booking.hotels.city}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.check_in).toLocaleDateString('es-ES')} - {new Date(booking.check_out).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${Number(booking.total_price).toLocaleString('es-CO')}</p>
                      <p className="text-sm text-green-600 capitalize">{booking.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}