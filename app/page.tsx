'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Cargar hoteles
  useEffect(() => {
    async function fetchHotels() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('stars', { ascending: false });

      if (error) console.error(error);
      else {
        setHotels(data || []);
        setFilteredHotels(data || []);
      }
      setLoading(false);
    }

    fetchHotels();
  }, []);

  // Filtrar en tiempo real
  useEffect(() => {
    const filtered = hotels.filter(hotel =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHotels(filtered);
  }, [searchTerm, hotels]);

  if (loading) return <div className="p-12 text-center text-xl">Cargando hoteles...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">booking</h1>
          <div className="text-sm text-gray-600">Proyecto de Graduación</div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white py-8 shadow-sm">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-4 items-center bg-white border rounded-2xl p-2 shadow">
            <div className="flex-1 flex items-center gap-3 px-4">
              <MapPin className="text-gray-400" />
              <Input
                placeholder="¿A dónde vas?"
                className="border-0 focus-visible:ring-0 text-lg py-6"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="lg" className="px-10 py-6 text-lg rounded-xl">
              <Search className="mr-2" /> Buscar
            </Button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-4xl font-semibold mb-2">Hoteles en Colombia</h2>
        <p className="text-gray-600 mb-8">
          {filteredHotels.length} hoteles encontrados
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <Card key={hotel.id} className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
              <div className="relative h-56 bg-gray-200">
                {hotel.images?.[0] && (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <Badge className="absolute top-4 right-4 bg-black/70 hover:bg-black">
                  {hotel.stars} ★
                </Badge>
              </div>

              <CardHeader>
                <CardTitle>{hotel.name}</CardTitle>
                <p className="text-gray-600 flex items-center gap-1">
                  <MapPin size={16} /> {hotel.city}
                </p>
              </CardHeader>

              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-3xl font-bold">
                      ${Number(hotel.price_per_night_base).toLocaleString('es-CO')}
                    </span>
                    <span className="text-sm text-gray-500"> /noche</span>
                  </div>
                  <Button
                  onClick={() => router.push(`/hoteles/${hotel.id}`)}>Ver hotel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}