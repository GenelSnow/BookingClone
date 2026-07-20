'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [newHotel, setNewHotel] = useState({
    name: '',
    city: '',
    description: '',
    stars: 3,
    price_per_night_base: 0,
  });
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    const { data } = await supabase.from('hotels').select('*').order('created_at', { ascending: false });
    setHotels(data || []);
  };

  const addHotel = async () => {
    if (!newHotel.name || !newHotel.city) {
      alert("Nombre y ciudad son obligatorios");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('hotels').insert(newHotel);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Hotel agregado correctamente");
      setNewHotel({
        name: '',
        city: '',
        description: '',
        stars: 3,
        price_per_night_base: 0,
      });
      fetchHotels();
    }
    setLoading(false);
  };

  // Protección básica (redirigir si no está logueado)
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Panel de Administrador</h1>
        <Button onClick={() => router.push('/')} variant="outline">Volver al inicio</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario para agregar hotel */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Agregar Nuevo Hotel</h2>
            <div className="space-y-5">
              <Input
                placeholder="Nombre del hotel"
                value={newHotel.name}
                onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
              />
              <Input
                placeholder="Ciudad"
                value={newHotel.city}
                onChange={(e) => setNewHotel({ ...newHotel, city: e.target.value })}
              />
              <Input
                placeholder="Descripción"
                value={newHotel.description}
                onChange={(e) => setNewHotel({ ...newHotel, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Estrellas (1-5)"
                  min="1"
                  max="5"
                  value={newHotel.stars}
                  onChange={(e) => setNewHotel({ ...newHotel, stars: parseInt(e.target.value) || 3 })}
                />
                <Input
                  type="number"
                  placeholder="Precio por noche"
                  min="0"
                  value={newHotel.price_per_night_base}
                  onChange={(e) => setNewHotel({ ...newHotel, price_per_night_base: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <Button 
                onClick={addHotel} 
                className="w-full py-6 text-lg"
                disabled={loading}
              >
                {loading ? "Agregando..." : "Agregar Hotel"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de hoteles */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Hoteles registrados ({hotels.length})</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="border rounded-xl p-5 hover:shadow-md transition-all">
                  <h3 className="font-semibold text-lg">{hotel.name}</h3>
                  <p className="text-gray-600">{hotel.city} • {hotel.stars} ★</p>
                  <p className="text-green-600 font-medium">
                    ${Number(hotel.price_per_night_base).toLocaleString('es-CO')} /noche
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}