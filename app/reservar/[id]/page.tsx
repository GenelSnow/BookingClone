'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Reserva() {
  const { id } = useParams(); // hotel id
  const router = useRouter();
  const [hotel, setHotel] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchHotelAndRoom();
  }, [id]);

  const fetchHotelAndRoom = async () => {
    const { data: hotelData } = await supabase.from('hotels').select('*').eq('id', id).single();
    const { data: roomData } = await supabase.from('rooms').select('*').eq('hotel_id', id).limit(1).single();

    setHotel(hotelData);
    setRoom(roomData);
    setLoading(false);
  };

  const calculateTotal = () => {
    if (!room || !checkIn || !checkOut) return 0;
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
    return days * room.price_per_night * guests;
  };

  const handleReserve = async () => {
    if (!checkIn || !checkOut) {
      alert("Selecciona fechas");
      return;
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      alert("Debes iniciar sesión");
      return;
    }

    const total = calculateTotal();

    const { error } = await supabase.from('bookings').insert({
      user_id: user.user.id,
      hotel_id: id,
      room_id: room.id,
      check_in: checkIn,
      check_out: checkOut,
      guests,
      total_price: total,
    });

    if (error) {
      alert("Error al reservar: " + error.message);
    } else {
      alert("¡Reserva realizada con éxito!");
      router.push('/mis-reservas');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Reservar en {hotel.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Fecha de llegada</Label>
              <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div>
              <Label>Fecha de salida</Label>
              <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <div>
              <Label>Número de huéspedes</Label>
              <Input type="number" min="1" value={guests} onChange={(e) => setGuests(parseInt(e.target.value))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Resumen de reserva</h3>
            <p>Habitación: {room.type}</p>
            <p>Precio por noche: ${room.price_per_night}</p>
            <p>Total: ${calculateTotal()}</p>

            <Button onClick={handleReserve} className="w-full mt-6">Confirmar Reserva</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}