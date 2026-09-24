'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { addDays, differenceInDays, eachDayOfInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function ReservaPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date());
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 3));
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [occupiedDates, setOccupiedDates] = useState<Date[]>([]); // días bloqueados

  

  useEffect(() => {
    fetchData();
  }, [id]);

  // Cada vez que cambia la habitación, cargamos sus fechas ocupadas
  useEffect(() => {
    if (selectedRoom?.id) {
      fetchOccupiedDates(selectedRoom.id);
    } else {
      setOccupiedDates([]);
    }
  }, [selectedRoom?.id]);

  const fetchData = async () => {
    const { data: hotelData } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single();

    const { data: roomsData } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', id);

    setHotel(hotelData);

    const safeRooms = roomsData || [];
    setRooms(safeRooms);

    if (safeRooms.length > 0) {
      setSelectedRoom(safeRooms[0]);
    }

    setLoading(false);
  };

  // Trae todas las reservas confirmadas de la habitación y genera los días ocupados
  const fetchOccupiedDates = async (roomId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('check_in, check_out')
      .eq('room_id', roomId)
      .eq('status', 'confirmed');

    if (error) {
      console.error('Error cargando fechas ocupadas:', error);
      setOccupiedDates([]);
      return;
    }

    const dates: Date[] = [];

    (data || []).forEach((booking) => {
      const start = parseISO(booking.check_in);
      // El día de check-out normalmente queda libre, por eso restamos 1 día
      const end = addDays(parseISO(booking.check_out), -1);

      if (end >= start) {
        const days = eachDayOfInterval({ start, end });
        dates.push(...days);
      }
    });

    setOccupiedDates(dates);
  };

  const nights =
    checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  const totalPrice =
    selectedRoom && nights > 0
      ? selectedRoom.price_per_night * nights
      : 0;

  // Validación de solapamiento
  const checkOverlap = async (roomId: string, start: Date, end: Date) => {
    const checkInStr = start.toISOString().split('T')[0];
    const checkOutStr = end.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', roomId)
      .eq('status', 'confirmed')
      .lt('check_in', checkOutStr)
      .gt('check_out', checkInStr);

    if (error) {
      console.error(error);
      return true;
    }

    return (data?.length || 0) > 0;
  };

  const handleReserve = async () => {
  if (!checkIn || !checkOut || !selectedRoom || nights <= 0) {
    toast.error('Por favor selecciona fechas válidas y una habitación');
    return;
  }

  if (checkOut <= checkIn) {
    toast.error('La fecha de salida debe ser posterior a la de entrada');
    return;
  }

  setSubmitting(true);

  try {
    // 1. Usuario (guarda en una variable clara)
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const currentUser = authData?.user;

    if (authError || !currentUser) {
      toast.error('Debes iniciar sesión para reservar');
      router.push('/login');
      return;
    }

    // 2. Solapamiento
    const hasOverlap = await checkOverlap(selectedRoom.id, checkIn, checkOut);
    if (hasOverlap) {
      toast.error('Esta habitación ya está reservada en esas fechas.');
      return;
    }

    // 3. Crear reserva
    const { error } = await supabase.from('bookings').insert({
      user_id: currentUser.id,
      hotel_id: id,
      room_id: selectedRoom.id,
      check_in: checkIn.toISOString().split('T')[0],
      check_out: checkOut.toISOString().split('T')[0],
      total_price: totalPrice,
      guests,
      status: 'confirmed',
    });

    if (error) {
      toast.error('Error al crear la reserva: ' + error.message);
      return;
    }

    // 4. Email (usa currentUser, no "user")
    try {
      await fetch('/api/notify-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: currentUser.email,
          hotelName: hotel?.name,
          city: hotel?.city,
          roomName: selectedRoom?.name || selectedRoom?.type,
          checkIn: checkIn.toISOString().split('T')[0],
          checkOut: checkOut.toISOString().split('T')[0],
          guests,
          totalPrice: formatPrice(totalPrice),
        }),
      });
    } catch (emailErr) {
      console.error('No se pudo enviar el email', emailErr);
      // No bloqueamos la reserva si falla el correo
    }

    toast.success('¡Reserva confirmada exitosamente!');
    router.push('/mis-reservas');
  } catch (err) {
    console.error(err);
    toast.error('Ocurrió un error inesperado');
  } finally {
    setSubmitting(false);
  }
};

  // Días deshabilitados: fechas pasadas + días ocupados
  const disabledDays = [
    { before: new Date() },
    ...occupiedDates,
  ];

  if (loading) {
    return <div className="p-12 text-center text-xl">Cargando...</div>;
  }

  if (!hotel) {
    return <div className="p-12 text-center">Hotel no encontrado</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-8">{hotel.name} - Reserva</h1>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Calendario */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon /> Selecciona tus fechas
              </CardTitle>
              {occupiedDates.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Los días en gris ya están reservados para esta habitación
                </p>
              )}
            </CardHeader>
            <CardContent>
              <DayPicker
                mode="range"
                selected={{ from: checkIn, to: checkOut }}
                onSelect={(range: DateRange | undefined) => {
                  setCheckIn(range?.from);
                  setCheckOut(range?.to);
                }}
                disabled={disabledDays}
                numberOfMonths={2}
                locale={es}
                className="mx-auto"
              />
            </CardContent>
          </Card>
        </div>

        {/* Panel de Reserva */}
        <div className="lg:col-span-5">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Resumen de tu reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Habitaciones */}
              <div>
                <h3 className="font-medium mb-3">Habitación</h3>
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedRoom?.id === room.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'hover:border-gray-300'
                        }`}
                      onClick={() => {
                        setSelectedRoom(room);
                        // Limpiamos fechas al cambiar de habitación para evitar inconsistencias
                        setCheckIn(new Date());
                        setCheckOut(addDays(new Date(), 3));
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{room.name}</p>
                          <p className="text-sm text-gray-600">
                            {room.capacity} huéspedes • {room.bed_type}
                          </p>
                        </div>
                        <p className="font-bold">
                          {formatPrice(room.price_per_night)}
                          <span className="text-sm font-normal">/noche</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen de Precios */}
              <div className="border-t pt-6 space-y-3">
                {nights > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>
                        {nights} noches × {formatPrice(selectedRoom?.price_per_night)}
                      </span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t pt-4">
                      <span>Total</span>
                      <span className="text-green-600">{formatPrice(totalPrice)}</span>
                    </div>
                  </>
                )}
              </div>

              <Button
                onClick={handleReserve}
                className="w-full py-7 text-lg font-semibold"
                disabled={submitting || nights <= 0 || !selectedRoom}
              >
                {submitting
                  ? 'Verificando disponibilidad...'
                  : `Confirmar Reserva - ${formatPrice(totalPrice)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}