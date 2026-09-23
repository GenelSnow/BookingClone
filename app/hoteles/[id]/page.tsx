'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Hotel, Check, ChevronLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

export default function HotelDetail() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

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

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('hotel_id', id)
      .order('created_at', { ascending: false });

    setHotel(hotelData);
    setReviews(reviewsData || []);
    setRooms(roomsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const submitReview = async () => {
    if (!newReview.comment.trim()) {
      toast.error('Por favor escribe un comentario');
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error('Debes iniciar sesión para dejar una reseña');
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('reviews').insert({
      hotel_id: id,
      user_id: userData.user.id,
      user_email: userData.user.email,
      rating: newReview.rating,
      comment: newReview.comment,
    });

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      toast.success('Reseña publicada correctamente');
      setNewReview({ rating: 5, comment: '' });
      fetchData();
    }
  };

  const scoreLabel = (score: number) => {
    if (score >= 9) return 'Fabuloso';
    if (score >= 8) return 'Fantástico';
    if (score >= 7) return 'Bien';
    if (score >= 6) return 'Agradable';
    return 'Aceptable';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center text-gray-600">
        Cargando alojamiento...
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Hotel no encontrado</p>
        <Button onClick={() => router.push('/')}>Volver al inicio</Button>
      </div>
    );
  }

  const images: string[] = hotel.images?.length
    ? hotel.images
    : [];
  const avgRating = Number(hotel.rating) || 0;
  const reviewCount = hotel.review_count ?? reviews.length;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[1100px] mx-auto px-3 sm:px-4 py-4">
        {/* Volver */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-[#0071c2] hover:underline mb-3"
        >
          <ChevronLeft size={16} /> Volver a los resultados
        </button>

        {/* Título + score */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-1 text-[#ffb700] mb-1">
              {Array.from({ length: Number(hotel.stars) || 0 }).map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <h1 className="text-2xl md:text-[28px] font-bold text-gray-900">
              {hotel.name}
            </h1>
            <p className="text-sm text-[#0071c2] mt-1 flex items-center gap-1">
              <MapPin size={14} />
              <span className="underline">
                {hotel.city}
                {hotel.country ? `, ${hotel.country}` : ', Colombia'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-right">
              <p className="font-bold text-gray-900">{scoreLabel(avgRating)}</p>
              <p className="text-xs text-gray-500">{reviewCount} reseñas</p>
            </div>
            <div className="bg-[#003580] text-white font-bold text-lg w-11 h-11 rounded-md rounded-bl-none flex items-center justify-center">
              {avgRating.toFixed(1)}
            </div>
            <Button
              className="bg-[#0071c2] hover:bg-[#005fa3] text-white font-semibold hidden sm:inline-flex"
              onClick={() => router.push(`/reservar/${id}`)}
            >
              Reservar ahora
            </Button>
          </div>
        </div>

        {/* Galería tipo Booking */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-1 rounded-lg overflow-hidden mb-6 h-auto md:h-[360px]">
          <div
            className="md:col-span-2 md:row-span-2 bg-gray-200 relative cursor-pointer min-h-[220px]"
            onClick={() => setActiveImage(0)}
          >
            {images[0] ? (
              <img
                src={images[activeImage] || images[0]}
                alt={hotel.name}
                className="w-full h-full object-cover min-h-[220px] md:min-h-full"
              />
            ) : (
              <div className="w-full h-full min-h-[220px] flex items-center justify-center">
                <Hotel size={48} className="text-gray-400" />
              </div>
            )}
          </div>
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="hidden md:block bg-gray-200 relative cursor-pointer overflow-hidden"
              onClick={() => images[idx] && setActiveImage(idx)}
            >
              {images[idx] ? (
                <img
                  src={images[idx]}
                  alt=""
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-full h-full bg-gray-300" />
              )}
            </div>
          ))}
        </div>

        {/* Miniaturas móvil */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto mb-6 md:hidden">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(idx)}
                className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${activeImage === idx ? 'border-[#0071c2]' : 'border-transparent'
                  }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción */}
            <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
              <h2 className="text-lg font-bold mb-3">Descripción</h2>
              <p className="text-gray-700 leading-relaxed text-[15px]">
                {hotel.description || 'Sin descripción disponible.'}
              </p>
              <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#008009]" /> WiFi gratis
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#008009]" /> Recepción 24 h
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#008009]" /> Cancelación flexible
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#008009]" /> Ideal para estancias
                </li>
              </ul>
            </section>

            {/* Habitaciones */}
            <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-bold">Disponibilidad</h2>
                <p className="text-sm text-gray-500">
                  Elige tu habitación y continúa con la reserva
                </p>
              </div>

              {rooms.length === 0 ? (
                <p className="p-5 text-gray-500 text-sm">
                  No hay habitaciones publicadas todavía.
                </p>
              ) : (
                <div className="divide-y">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80"
                    >
                      <div>
                        <h3 className="font-bold text-[#0071c2] text-[16px]">
                          {room.name || room.type}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {room.capacity} huésped{room.capacity > 1 ? 'es' : ''}
                          {room.bed_type ? ` · ${room.bed_type}` : ''}
                          {room.type ? ` · ${room.type}` : ''}
                        </p>
                        <p className="text-xs text-[#008009] mt-1 font-medium">
                          Ideal para tu estancia
                        </p>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end w-full sm:w-auto">
                        <div className="text-right">
                          <p className="text-xl font-bold">
                            {formatPrice(room.price_per_night)}
                          </p>
                          <p className="text-xs text-gray-500">por noche</p>
                        </div>
                        <Button
                          className="bg-[#0071c2] hover:bg-[#005fa3] text-white font-semibold w-full sm:w-auto"
                          onClick={() => router.push(`/reservar/${id}`)}
                        >
                          Reservar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Reseñas */}
            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">
                  Valoraciones de los clientes
                </h2>
                <div className="flex items-center gap-2">
                  <div className="bg-[#003580] text-white font-bold text-sm w-9 h-9 rounded-md rounded-bl-none flex items-center justify-center">
                    {avgRating.toFixed(1)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{scoreLabel(avgRating)}</p>
                    <p className="text-xs text-gray-500">{reviewCount} reseñas</p>
                  </div>
                </div>
              </div>

              {/* Formulario */}
              <div className="border rounded-lg p-4 mb-6 bg-[#f5f5f5]">
                <p className="font-semibold text-sm mb-3">Escribe una reseña</p>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={28}
                      className={`cursor-pointer ${star <= newReview.rating
                        ? 'fill-[#ffb700] text-[#ffb700]'
                        : 'text-gray-300'
                        }`}
                      onClick={() =>
                        setNewReview({ ...newReview, rating: star })
                      }
                    />
                  ))}
                </div>
                <textarea
                  className="w-full min-h-[90px] border border-gray-300 rounded-md p-3 text-sm bg-white"
                  placeholder="Cuéntanos tu experiencia..."
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                />
                <Button
                  className="mt-3 bg-[#0071c2] hover:bg-[#005fa3] text-white"
                  onClick={submitReview}
                >
                  Publicar reseña
                </Button>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Aún no hay reseñas para este alojamiento.
                  </p>
                )}
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-semibold text-sm">
                          {review.user_email?.split('@')[0] || 'Huésped'}
                        </p>
                        <div className="flex text-[#ffb700] mt-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar reserva */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 lg:sticky lg:top-24 shadow-sm">
              <p className="text-sm text-gray-500">Precio desde</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatPrice(hotel.price_per_night_base)}
              </p>
              <p className="text-xs text-gray-500 mb-4">por noche · incluye impuestos</p>

              <div className="border rounded-md p-3 mb-3 text-sm space-y-2 bg-[#f5f5f5]">
                <div className="flex justify-between">
                  <span className="text-gray-600">Entrada</span>
                  <span className="font-medium">Selecciona en reserva</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Salida</span>
                  <span className="font-medium">Selecciona en reserva</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Huéspedes</span>
                  <span className="font-medium">2 adultos</span>
                </div>
              </div>

              <Button
                className="w-full h-12 bg-[#0071c2] hover:bg-[#005fa3] text-white text-[16px] font-bold"
                onClick={() => router.push(`/reservar/${id}`)}
              >
                Verificar disponibilidad
              </Button>

              <p className="text-center text-xs text-gray-500 mt-3">
                No se cobra nada todavía
              </p>
              <p className="text-center text-xs text-[#008009] mt-1 font-medium">
                Cancelación gratis en muchas tarifas
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}