'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { Calendar, MapPin, Users, XCircle } from 'lucide-react';

export default function MisReservas() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const supabase = createClient();
  const router = useRouter();

  const openCancelModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setCancelReason('');
    setCustomReason('');
    setCancelModalOpen(true);
  };

  const GUEST_REASONS = [
    'Cambio de planes',
    'Encontré una mejor opción',
    'Motivos personales / de salud',
    'Problemas con el pago',
    'El hotel no cumple lo esperado',
    'Otro',
  ];

  // Estados (si aún no los tienes separados):
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');

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
      .select(`*, hotels(name, city), rooms(name, type)`)
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
    return checkInDate > today;
  };

  const openCancelModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleCancel = async () => {
    if (!selectedBookingId) return;
    if (!cancelReason.trim()) {
      toast.error('Debes indicar un motivo de cancelación');
      return;
    }

    setCancellingId(selectedBookingId);



    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: cancelReason.trim(),
        cancelled_by: 'huesped',
      })
      .eq('id', selectedBookingId);

    const finalReason =
      cancelReason === 'Otro' ? customReason.trim() : cancelReason.trim();

    if (!finalReason) {
      toast.error(
        cancelReason === 'Otro'
          ? 'Describe el motivo de cancelación'
          : 'Selecciona un motivo de cancelación'
      );
      return;
    }


    if (error) {
      console.error(error);
      toast.error('No se pudo cancelar: ' + error.message);
    } else {
      toast.success('Reserva cancelada correctamente');
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBookingId
            ? {
              ...b,
              status: 'cancelled',
              cancellation_reason: cancelReason.trim(),
              cancelled_by: 'huesped',
            }
            : b
        )
      );
      setCancelModalOpen(false);
      setCancelReason('');
      setSelectedBookingId(null);
    }

    setCancellingId(null);
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
      <span className={`text-xs font-medium px-3 py-1 rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };



  if (loading) return <div className="p-12 text-center">Cargando reservas...</div>;

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
            <div key={booking.id} className="border rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-xl">{booking.hotels?.name || 'Hotel'}</h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  <p className="text-gray-600 flex items-center gap-1 mb-1">
                    <MapPin size={16} /> {booking.hotels?.city}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                    <Users size={16} />
                    {booking.rooms?.name || booking.rooms?.type || 'Habitación'} • {booking.guests} huésped{booking.guests > 1 ? 'es' : ''}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-3">
                    <Calendar size={16} />
                    {new Date(booking.check_in).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' → '}
                    {new Date(booking.check_out).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {booking.status === 'cancelled' && booking.cancellation_reason && (
                    <p className="text-sm text-red-600 mt-2 bg-red-50 px-3 py-2 rounded-lg">
                      Motivo ({booking.cancelled_by === 'huesped' ? 'huésped' : 'hotel'}): {booking.cancellation_reason}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <p className="text-2xl font-bold">{formatPrice(booking.total_price)}</p>
                  {canCancel(booking) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => openCancelModal(booking.id)}
                      disabled={
                        cancellingId !== null ||
                        !cancelReason ||
                        (cancelReason === 'Otro' && !customReason.trim())
                      }
                    >
                      <XCircle size={16} className="mr-2" />
                      Cancelar reserva
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal motivo de cancelación */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar reserva</DialogTitle>
          </DialogHeader>
          {/* Dentro del Dialog */}
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Selecciona el motivo de la cancelación.
            </p>

            <div className="space-y-2">
              <Label>Motivo</Label>
              <select
                className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white"
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (e.target.value !== 'Otro') setCustomReason('');
                }}
              >
                <option value="">Selecciona un motivo</option>
                {GUEST_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {cancelReason === 'Otro' && (
              <div className="space-y-2">
                <Label>Describe el motivo</Label>
                <textarea
                  className="w-full min-h-[90px] border rounded-xl p-3 text-sm"
                  placeholder="Escribe el motivo..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancellingId !== null || !cancelReason.trim()}
            >
              {cancellingId ? 'Cancelando...' : 'Confirmar cancelación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}