'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function MisReservas() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        hotels(name, city),
        rooms(type)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setBookings(data || []);
    setLoading(false);
  };

  if (loading) return <div className="p-12 text-center">Cargando reservas...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Mis Reservas</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No tienes reservas aún.</p>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="border rounded-2xl p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-xl">{booking.hotels.name}</h3>
                  <p className="text-gray-600">{booking.hotels.city}</p>
                  <p className="text-sm text-gray-500">
                    {booking.rooms.type} • {booking.guests} huéspedes
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    ${Number(booking.total_price).toLocaleString('es-CO')}
                  </p>
                  <p className="text-sm text-green-600 capitalize">{booking.status}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                {new Date(booking.check_in).toLocaleDateString('es-ES')} → {new Date(booking.check_out).toLocaleDateString('es-ES')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}