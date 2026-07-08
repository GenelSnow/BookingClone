'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export default function HotelDetail() {
  const { id } = useParams();
  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchHotelData();
  }, [id]);

  async function fetchHotelData() {
    // Hotel + habitaciones
    const { data: hotelData } = await supabase.from('hotels').select('*').eq('id', id).single();
    const { data: roomsData } = await supabase.from('rooms').select('*').eq('hotel_id', id);
    
    // Reseñas
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('hotel_id', id)
      .order('created_at', { ascending: false });

    setHotel(hotelData);
    setRooms(roomsData || []);
    setReviews(reviewsData || []);
    setLoading(false);
  }

  async function submitReview() {
    if (!newReview.comment.trim()) return;

    const { error } = await supabase.from('reviews').insert({
      hotel_id: id,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      rating: newReview.rating,
      comment: newReview.comment,
    });

    if (!error) {
      setNewReview({ rating: 5, comment: '' });
      fetchHotelData(); // Recargar reseñas
    }
  }

  if (loading) return <div className="p-12 text-center">Cargando...</div>;
  if (!hotel) return <div>Hotel no encontrado</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Imagen principal */}
      <div className="h-96 bg-gray-200 rounded-3xl overflow-hidden mb-8">
        {hotel.images?.[0] && (
          <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información principal */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
          <p className="text-xl text-gray-600 mb-6">{hotel.city}, {hotel.country}</p>

          <div className="flex gap-4 mb-8">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {hotel.stars} ★ Estrellas
            </Badge>
          </div>

          <p className="text-gray-700 leading-relaxed text-lg">{hotel.description}</p>
        </div>

        {/* Precio y reserva */}
        <div>
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Desde</p>
              <p className="text-4xl font-bold mb-6">
                ${Number(hotel.price_per_night_base).toLocaleString('es-CO')}
                <span className="text-base font-normal"> /noche</span>
              </p>

              <Button size="lg" className="w-full text-lg py-7">
                Reservar ahora
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Habitaciones disponibles */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Habitaciones disponibles</h2>
        <div className="grid gap-6">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-xl">{room.type}</h3>
                  <p className="text-gray-600">Hasta {room.capacity} personas</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${Number(room.price_per_night).toLocaleString('es-CO')}</p>
                  <Button className="mt-3">Seleccionar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Sección de Reseñas */}
      <div className="mt-12">
        <h2 className="text-3xl font-semibold mb-6">Reseñas de huéspedes</h2>

        {/* Formulario para dejar reseña */}
        <Card className="mb-10">
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Deja tu reseña</h3>
            
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map(star => (
                <Star 
                  key={star}
                  className={`cursor-pointer ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setNewReview({...newReview, rating: star})}
                />
              ))}
            </div>

            <Textarea 
              placeholder="¿Qué te pareció tu experiencia?"
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              className="mb-4"
            />

            <Button onClick={submitReview}>Publicar reseña</Button>
          </CardContent>
        </Card>

        {/* Lista de reseñas */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{review.profiles?.full_name || "Usuario"}</p>
                    <div className="flex text-yellow-400">
                      {Array.from({ length: review.rating }).map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <p className="mt-3 text-gray-700">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}