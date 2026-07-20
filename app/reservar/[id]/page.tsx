'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function ReservaPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(addDays(new Date(), 3));
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

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
    setRooms(roomsData || []);
    if (roomsData?.length > 0) setSelectedRoom(roomsData[0]);
    setLoading(false);
  };

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = selectedRoom && nights > 0 
    ? selectedRoom.price_per_night * nights 
    : 0;

  const handleReserve = async () => {
    if (!checkIn || !checkOut || !selectedRoom || nights <= 0) {
      alert("Por favor selecciona fechas válidas y una habitación");
      return;
    }

    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Debes iniciar sesión para reservar");
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      hotel_id: id,
      room_id: selectedRoom.id,
      check_in: checkIn.toISOString().split('T')[0],
      check_out: checkOut.toISOString().split('T')[0],
      total_price: totalPrice,
      guests,
      status: 'confirmed'
    });

    if (error) {
      console.error(error);
      alert("Error al crear la reserva: " + error.message);
    } else {
      alert("¡Reserva confirmada exitosamente! 🎉");
      router.push('/mis-reservas');
    }

    setSubmitting(false);
  };

  if (loading) return <div className="p-12 text-center text-xl">Cargando...</div>;
  if (!hotel) return <div className="p-12 text-center">Hotel no encontrado</div>;

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
            </CardHeader>
            <CardContent>
              <DayPicker
                mode="range"
                selected={{ from: checkIn, to: checkOut }}
                onSelect={(range) => {
                  if (range?.from) setCheckIn(range.from);
                  if (range?.to) setCheckOut(range.to);
                }}
                disabled={{ before: new Date() }}   // ← Bloquea fechas pasadas
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
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedRoom?.id === room.id ? 'border-blue-600 bg-blue-50' : 'hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{room.name}</p>
                          <p className="text-sm text-gray-600">{room.capacity} huéspedes • {room.bed_type}</p>
                        </div>
                        <p className="font-bold">${room.price_per_night}<span className="text-sm font-normal">/noche</span></p>
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
                      <span>{nights} noches × ${selectedRoom?.price_per_night}</span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t pt-4">
                      <span>Total</span>
                      <span className="text-green-600">${totalPrice.toLocaleString('es-CO')}</span>
                    </div>
                  </>
                )}
              </div>

              <Button 
                onClick={handleReserve} 
                className="w-full py-7 text-lg font-semibold"
                disabled={submitting || nights <= 0 || !selectedRoom}
              >
                {submitting ? "Procesando..." : `Confirmar Reserva - $${totalPrice.toLocaleString('es-CO')}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}