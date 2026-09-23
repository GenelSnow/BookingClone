'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Calendar, Users, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

export default function Home() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [minStars, setMinStars] = useState(1);
  const [sortBy, setSortBy] = useState('recommended');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('stars', { ascending: false });

      if (error) {
        console.error(error);
        setHotels([]);
      } else {
        setHotels(data || []);
        setFilteredHotels(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = hotels.filter(
      (hotel) =>
        (hotel.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (hotel.city || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered = filtered.filter(
      (hotel) =>
        Number(hotel.price_per_night_base) >= minPrice &&
        Number(hotel.price_per_night_base) <= maxPrice
    );

    filtered = filtered.filter((hotel) => Number(hotel.stars) >= minStars);

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'price_asc') {
        return Number(a.price_per_night_base) - Number(b.price_per_night_base);
      }
      if (sortBy === 'price_desc') {
        return Number(b.price_per_night_base) - Number(a.price_per_night_base);
      }
      if (sortBy === 'stars') {
        return Number(b.stars) - Number(a.stars);
      }
      return Number(b.rating || 0) - Number(a.rating || 0);
    });

    setFilteredHotels(filtered);
  }, [searchTerm, minPrice, maxPrice, minStars, sortBy, hotels]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center text-lg text-gray-600">
        Cargando alojamientos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Hero + buscador */}
      <div className="bg-[#003580] text-white pb-8 pt-6">
        <div className="max-w-[1100px] mx-auto px-4">
          <h1 className="text-3xl md:text-[32px] font-bold mb-2">
            Encuentra tu próxima estancia
          </h1>
          <p className="text-base md:text-lg text-white/90 mb-6">
            Busca ofertas en hoteles, casas y mucho más...
          </p>

          {/* Caja de búsqueda amarilla tipo Booking */}
          <div className="bg-[#ffb700] p-1 rounded-md shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_auto] gap-1 bg-[#ffb700]">
              <div className="flex items-center gap-3 bg-white rounded px-3 py-3 min-h-[56px]">
                <MapPin className="text-gray-500 shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <Input
                    placeholder="¿Adónde vas?"
                    className="border-0 p-0 h-auto text-[15px] shadow-none focus-visible:ring-0 text-gray-900 placeholder:text-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white rounded px-3 py-3 min-h-[56px] text-gray-700">
                <Calendar className="text-gray-500 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Fechas</p>
                  <p className="text-sm font-medium">Selecciona fechas</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white rounded px-3 py-3 min-h-[56px] text-gray-700">
                <Users className="text-gray-500 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Huéspedes</p>
                  <p className="text-sm font-medium">2 adultos · 1 habitación</p>
                </div>
              </div>

              <Button
                className="h-[48px] sm:h-[56px] w-full md:w-auto px-6 rounded-md bg-[#0071c2] hover:bg-[#005fa3] text-white text-[15px] sm:text-[16px] font-semibold"
                onClick={() => { }}
              >
                <Search className="mr-2" size={20} />
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido: filtros + lista */}
      <div className="max-w-[1100px] mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Botón filtros — solo móvil */}
        <div className="lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-300 bg-white"
            onClick={() => setShowFilters((v) => !v)}
          >
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </div>

        {/* Sidebar filtros */}
        <aside
          className={`w-full lg:w-[260px] shrink-0 ${showFilters ? 'block' : 'hidden'
            } lg:block`}
        >
          <div className="bg-white border border-gray-200 rounded-lg p-4 lg:sticky lg:top-24">
            <h3 className="font-bold text-[16px] mb-4 text-gray-900">Filtrar por:</h3>

            <div className="mb-5">
              <p className="text-sm font-semibold mb-2">Tu presupuesto (por noche)</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  className="h-9 text-sm"
                  value={minPrice || ''}
                  onChange={(e) =>
                    setMinPrice(e.target.value === '' ? 0 : Number(e.target.value))
                  }
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  className="h-9 text-sm"
                  value={maxPrice || ''}
                  onChange={(e) =>
                    setMaxPrice(e.target.value === '' ? 2000000 : Number(e.target.value))
                  }
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Estrellas</p>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                {[5, 4, 3, 2, 1].map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="stars"
                      checked={minStars === s}
                      onChange={() => setMinStars(s)}
                      className="accent-[#0071c2]"
                    />
                    <span className="flex items-center gap-0.5 text-[#ffb700]">
                      {Array.from({ length: s }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </span>
                    <span className="text-gray-600">o más</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Resultados */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-xl font-bold text-gray-900">
              Colombia: {filteredHotels.length} propiedades
            </h2>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-full sm:w-auto"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recommended">Nuestra recomendación</option>
              <option value="price_asc">Precio (más bajo primero)</option>
              <option value="price_desc">Precio (más alto primero)</option>
              <option value="stars">Estrellas</option>
            </select>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {filteredHotels.map((hotel) => (
              <article
                key={hotel.id}
                onClick={() => router.push(`/hoteles/${hotel.id}`)}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row"
              >
                <div className="w-full sm:w-[220px] md:w-[240px] h-44 sm:h-auto sm:min-h-[160px] shrink-0 bg-gray-200">
                  {hotel.images?.[0] ? (
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover min-h-[176px] sm:min-h-[160px]"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[176px] flex items-center justify-center text-gray-400 text-sm">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="flex-1 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 min-w-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-[#0071c2] line-clamp-2">
                      {hotel.name}
                    </h3>
                    <p className="text-sm text-[#0071c2] underline mt-0.5">
                      {hotel.city}
                      {hotel.country ? `, ${hotel.country}` : ''}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[#ffb700]">
                      {Array.from({ length: Number(hotel.stars) || 0 }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    {hotel.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2 hidden sm:block">
                        {hotel.description}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 sm:min-w-[130px]">
                    <div className="flex items-center gap-2">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900">
                          {(Number(hotel.rating) || 0) >= 9
                            ? 'Fabuloso'
                            : (Number(hotel.rating) || 0) >= 8
                              ? 'Muy bien'
                              : (Number(hotel.rating) || 0) >= 7
                                ? 'Bien'
                                : 'Aceptable'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {hotel.review_count || 0} reseñas
                        </p>
                      </div>
                      <div className="bg-[#003580] text-white font-bold text-sm w-9 h-9 rounded-md rounded-bl-none flex items-center justify-center">
                        {(Number(hotel.rating) || 0).toFixed(1)}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">1 noche</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        {formatPrice(hotel.price_per_night_base)}
                      </p>
                      <Button
                        size="sm"
                        className="mt-2 bg-[#0071c2] hover:bg-[#005fa3] text-white font-semibold w-full sm:w-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/hoteles/${hotel.id}`);
                        }}
                      >
                        Ver disponibilidad
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {filteredHotels.length === 0 && (
              <div className="bg-white border rounded-lg p-8 sm:p-10 text-center text-gray-500">
                No se encontraron propiedades con esos filtros.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}