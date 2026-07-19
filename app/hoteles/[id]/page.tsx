'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

export default function HotelDetail() {
  const { id } = useParams();
  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchData = async () => {
    // Hotel
    const { data: hotelData } = await supabase
      .from('hotels')
      .select('*, rating, review_count')
      .eq('id', id)
      .single();
    // Habitaciones
    const { data: roomsData } = await supabase.from('rooms').select('*').eq('hotel_id', id);

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

  // Insertar reseña
  const { error: insertError } = await supabase.from('reviews').insert({
    hotel_id: id,
    user_id: user.user.id,
    user_email: user.user.email,
    rating: newReview.rating,
    comment: newReview.comment,
  });

  if (insertError) {
    alert("Error al guardar: " + insertError.message);
    return;
  }

  // Recargar datos frescos del hotel
  const { data: updatedHotel } = await supabase
    .from('hotels')
    .select('rating, review_count')
    .eq('id', id)
    .single();

  if (updatedHotel) {
    setHotel(prev => ({ ...prev, ...updatedHotel }));
  }

  alert("Reseña guardada correctamente");
  setNewReview({ rating: 5, comment: '' });
  await fetchData(); // Recargar todo
};  

  if (loading) return <div className="p-12 text-center">Cargando hotel...</div>;
  if (!hotel) return <div>Hotel no encontrado</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="h-96 bg-gray-200 rounded-3xl overflow-hidden mb-8">
        {hotel.images?.[0] && (
          <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
          <p className="text-xl text-gray-600 mb-6">
            {hotel.city}, {hotel.country} •
            {hotel.rating ? hotel.rating.toFixed(1) : '0.0'} ★
            ({hotel.review_count || 0} reseñas)
          </p>
          <p className="text-3xl font-bold text-green-600">
            ${Number(hotel.price_per_night_base).toLocaleString('es-CO')} /noche
          </p>
          <p className="text-gray-700 mt-6">{hotel.description}</p>
        </div>
      </div>

      {/* Reseñas */}
      <div className="mt-12">
        <h2 className="text-3xl font-semibold mb-6">Reseñas ({reviews.length})</h2>

        <Card className="mb-10">
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Deja tu reseña</h3>

            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={28}
                  className={`cursor-pointer ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                />
              ))}
            </div>

            <Textarea
              placeholder="¿Qué te pareció tu experiencia?"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="mb-4"
            />

            <Button onClick={submitReview}>Publicar reseña</Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {review.user_email ? review.user_email.split('@')[0] : "Usuario anónimo"}
                    </p>
                    <div className="flex text-yellow-400 mt-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={18} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <p className="mt-4 text-gray-700">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}