'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users, Filter, Hotel } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [minStars, setMinStars] = useState(1);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('hotels')
      .select('*')
      .order('stars', { ascending: false });

    setHotels(data || []);
    setFilteredHotels(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let filtered = hotels.filter(hotel =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtro de precio
    filtered = filtered.filter(hotel =>
      hotel.price_per_night_base >= minPrice && hotel.price_per_night_base <= maxPrice
    );

    // Filtro de estrellas
    filtered = filtered.filter(hotel => hotel.stars >= minStars);

    setFilteredHotels(filtered);
  }, [searchTerm, minPrice, maxPrice, minStars, hotels]);

  if (loading) return <div className="p-12 text-center text-xl">Cargando hoteles...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO - Estilo Booking.com */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Encuentra tu hotel ideal
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100">
            Miles de opciones en Colombia con las mejores ofertas
          </p>

          {/* Search Bar Grande */}
          <div className="bg-white rounded-3xl p-2 shadow-2xl max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="flex items-center gap-3 px-6 py-4 border-r">
                <MapPin className="text-gray-400" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Destino</p>
                  <Input
                    placeholder="¿A dónde vas?"
                    className="border-0 p-0 text-lg focus-visible:ring-0 placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 px-6 py-4 border-r">
                <Calendar className="text-gray-400" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Check-in - Check-out</p>
                  <p className="text-gray-700">Selecciona fechas</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-6 py-4 border-r">
                <Users className="text-gray-400" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Huéspedes</p>
                  <p className="text-gray-700">2 adultos</p>
                </div>
              </div>

              <Button size="lg" className="h-full text-lg font-semibold rounded-2xl bg-blue-600 hover:bg-blue-700">
                <Search className="mr-2" /> Buscar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Filtros */}
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Filter size={18} /> Filtros
            </h3>

            <div className="space-y-6 bg-white p-6 rounded-2xl border">
              <div>
                <label className="text-sm font-medium block mb-2">Precio por noche</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    min="0"
                    step="50000"
                    value={minPrice || ''}
                    onChange={(e) => setMinPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    placeholder="Máximo"
                    min="0"
                    step="50000"
                    value={maxPrice || ''}
                    onChange={(e) => setMaxPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Estrellas mínimas</label>
                <select
                  className="w-full p-3 border rounded-xl"
                  value={minStars}
                  onChange={(e) => setMinStars(Number(e.target.value))}
                >
                  <option value={1}>1 estrella o más</option>
                  <option value={2}>2 estrellas o más</option>
                  <option value={3}>3 estrellas o más</option>
                  <option value={4}>4 estrellas o más</option>
                  <option value={5}>5 estrellas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-4xl font-semibold">Hoteles en Colombia</h2>
              <p className="text-gray-600">{filteredHotels.length} hoteles encontrados</p>
            </div>
            <select className="border rounded-xl px-4 py-2 text-sm">
              <option>Ordenar por: Recomendados</option>
              <option>Precio: Menor a Mayor</option>
              <option>Precio: Mayor a Menor</option>
              <option>Estrellas</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHotels.map((hotel) => (
              <Card
                key={hotel.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                onClick={() => router.push(`/hoteles/${hotel.id}`)}
              >
                <div className="relative h-64 bg-gray-200">
                  {hotel.images?.[0] && (
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  <Badge className="absolute top-4 right-4 bg-black/80 text-white">
                    {hotel.stars} ★
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">{hotel.name}</CardTitle>
                  <p className="text-gray-600 flex items-center gap-1 text-sm">
                    <MapPin size={16} /> {hotel.city}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-3xl font-bold">
                        ${Number(hotel.price_per_night_base).toLocaleString('es-CO')}
                      </span>
                      <span className="text-sm text-gray-500"> /noche</span>
                    </div>
                    <Button>Ver detalles</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
