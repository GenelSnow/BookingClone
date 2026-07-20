'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Admin() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [newHotel, setNewHotel] = useState({
    name: '',
    city: '',
    description: '',
    stars: 3,
    price_per_night_base: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    const { data } = await supabase.from('hotels').select('*');
    setHotels(data || []);
  };

  const addHotel = async () => {
    if (!newHotel.name || !newHotel.city) {
      alert("Nombre y ciudad son obligatorios");
      return;
    }

    const { error } = await supabase.from('hotels').insert(newHotel);
    if (error) alert("Error: " + error.message);
    else {
      alert("Hotel agregado correctamente");
      setNewHotel({ name: '', city: '', description: '', stars: 3, price_per_night_base: 0 });
      fetchHotels();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Panel de Administrador</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Agregar Nuevo Hotel</h2>
            <div className="space-y-4">
              <Input placeholder="Nombre del hotel" value={newHotel.name} onChange={(e) => setNewHotel({...newHotel, name: e.target.value})} />
              <Input placeholder="Ciudad" value={newHotel.city} onChange={(e) => setNewHotel({...newHotel, city: e.target.value})} />
              <Input placeholder="Descripción" value={newHotel.description} onChange={(e) => setNewHotel({...newHotel, description: e.target.value})} />
              <Input type="number" placeholder="Estrellas (1-5)" min="1" max="5" value={newHotel.stars} onChange={(e) => setNewHotel({...newHotel, stars: parseInt(e.target.value)})} />
              <Input type="number" placeholder="Precio por noche" min="0" value={newHotel.price_per_night_base} onChange={(e) => setNewHotel({...newHotel, price_per_night_base: parseFloat(e.target.value)})} />
              <Button onClick={addHotel} className="w-full">Agregar Hotel</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Hoteles ({hotels.length})</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {hotels.map(hotel => (
                <div key={hotel.id} className="border p-4 rounded-xl">
                  <h3 className="font-medium">{hotel.name}</h3>
                  <p className="text-sm text-gray-600">{hotel.city} • {hotel.stars} ★</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}