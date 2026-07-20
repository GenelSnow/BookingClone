'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar, Users } from "lucide-react";

export default function HotelDetail() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // Hotel
    const { data: hotelData } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single();

    // Habitaciones
    const { data: roomsData } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', id);

    // Reseñas
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('hotel_id', id)
      .order('created_at', { ascending: false });

    setHotel(hotelData);
    setRooms(roomsData || []);
    setReviews(reviewsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const submitReview = async () => {
    if (!newReview.comment.trim()) {
      alert("Por favor escribe un comentario");
      return;
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      alert("Debes iniciar sesión para dejar una reseña");
      return;
    }

    const { error } = await supabase.from('reviews').insert({
      hotel_id: id,
      user_id: user.user.id,
      user_email: user.user.email,
      rating: newReview.rating,
      comment: newReview.comment,
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Reseña publicada correctamente");
      setNewReview({ rating: 5, comment: '' });
      fetchData(); // Recargar reseñas
    }
  };

  if (loading) return <div className="p-12 text-center text-xl">Cargando hotel...</div>;
  if (!hotel) return <div className="p-12 text-center">Hotel no encontrado</div>;

  const avgRating = hotel.rating || 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Imagen Principal + Info */}
      <div className="relative h-[500px] rounded-3xl overflow-hidden mb-10">
        {hotel.images && hotel.images.length > 0 ? (
          <img
            src={hotel.images[0]}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <Hotel size={48} className="text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-5xl font-bold mb-3">{hotel.name}</h1>
          <p className="text-xl flex items-center gap-2">
            <MapPin /> {hotel.city} • {hotel.country || 'Colombia'}
          </p>
        </div>

        <Badge className="absolute top-8 right-8 bg-white text-black text-lg px-4 py-2">
          {avgRating.toFixed(1)} ★ ({hotel.review_count || 0} reseñas)
        </Badge>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Información Principal */}
        <div className="lg:col-span-8">
          <div className="prose max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed">{hotel.description}</p>
          </div>

          {/* Habitaciones */}
          {rooms.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-semibold mb-6">Habitaciones disponibles</h2>
              <div className="space-y-6">
                {rooms.map(room => (
                  <Card key={room.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-semibold">{room.name}</h3>
                        <p className="text-gray-600 mt-1">{room.capacity} huéspedes • {room.bed_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">${room.price_per_night}</p>
                        <p className="text-sm text-gray-500">por noche</p>
                      </div>
                    </div>
                    <Button
                      className="mt-6 w-full"
                      onClick={() => router.push(`/reservar/${id}`)}
                    >
                      Reservar esta habitación
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Reserva Rápida */}
        <div className="lg:col-span-4">
          <Card className="sticky top-8">
            <CardContent className="p-8">
              <p className="text-4xl font-bold text-green-600">
                ${Number(hotel.price_per_night_base).toLocaleString('es-CO')}
              </p>
              <p className="text-gray-500">Precio por noche aproximado</p>

              <Button
                size="lg"
                className="w-full mt-8 py-8 text-xl"
                onClick={() => router.push(`/reservar/${id}`)}
              >
                Reservar ahora
              </Button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Cancelación gratis hasta 48 horas antes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reseñas */}
      <div className="mt-16">
        <h2 className="text-3xl font-semibold mb-8">Reseñas de huéspedes ({reviews.length})</h2>

        {/* Formulario de reseña */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h3 className="font-semibold mb-4">¿Qué te pareció este hotel?</h3>

            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={36}
                  className={`cursor-pointer ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                />
              ))}
            </div>

            <textarea
              className="w-full min-h-[120px] border rounded-2xl p-4"
              placeholder="Escribe tu experiencia..."
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            />

            <Button onClick={submitReview} className="mt-4">Publicar reseña</Button>
          </CardContent>
        </Card>

        {/* Lista de reseñas */}
        <div className="space-y-8">
          {reviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-8">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{review.user_email?.split('@')[0]}</p>
                    <div className="flex text-yellow-400 mt-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={20} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <p className="mt-6 text-gray-700">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}