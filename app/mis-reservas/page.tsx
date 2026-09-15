'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { Calendar, MapPin, Users, XCircle } from 'lucide-react';

export default function MisReservas() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push('/login');
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        hotels(name, city),
        rooms(name, type)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('Error al cargar las reservas');
    }

    setBookings(data || []);
    setLoading(false);
  };

  const canCancel = (booking: any) => {
    if (booking.status !== 'confirmed') return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(booking.check_in);
    checkInDate.setHours(0, 0, 0, 0);

    // Solo se puede cancelar si el check-in aún no llegó
    return checkInDate > today;
  };

  const handleCancelBooking = async (bookingId: string) => {
    const confirmed = window.confirm(
      '¿Cancelar esta reserva?\nEl huésped verá el estado como Cancelada.'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      console.error(error);
      toast.error('No se pudo cancelar la reserva: ' + error.message);
      return;
    }

    toast.success('Reserva cancelada correctamente');

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      )
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-gray-100 text-gray-600',
    };

    const labels: Record<string, string> = {
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada',
    };

    return (
      <span
        className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-600'
          }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return <div className="p-12 text-center">Cargando reservas...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Mis Reservas</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">No tienes reservas aún.</p>
          <Button onClick={() => router.push('/')}>Explorar hoteles</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                {/* Info principal */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-xl">
                      {booking.hotels?.name || 'Hotel'}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>

                  <p className="text-gray-600 flex items-center gap-1 mb-1">
                    <MapPin size={16} />
                    {booking.hotels?.city}
                  </p>

                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                    <Users size={16} />
                    {booking.rooms?.name || booking.rooms?.type || 'Habitación'} •{' '}
                    {booking.guests} huésped{booking.guests > 1 ? 'es' : ''}
                  </p>

                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-3">
                    <Calendar size={16} />
                    {new Date(booking.check_in).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    →{' '}
                    {new Date(booking.check_out).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Precio + acciones */}
                <div className="flex flex-col items-end gap-3">
                  <p className="text-2xl font-bold">
                    {formatPrice(booking.total_price)}
                  </p>

                  {canCancel(booking) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingId === booking.id}
                    >
                      <XCircle size={16} className="mr-2" />
                      {cancellingId === booking.id
                        ? 'Cancelando...'
                        : 'Cancelar reserva'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}