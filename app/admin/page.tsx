'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { Plus, Hotel, Trash2 } from "lucide-react";

export default function AdminPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [newHotel, setNewHotel] = useState({
    name: '',
    city: '',
    description: '',
    stars: 4,
    price_per_night_base: 0,
  });
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hotels')
      .select('*')
      .order('created_at', { ascending: false });
    setHotels(data || []);
    setLoading(false);
  };

  const addHotel = async () => {
    if (!newHotel.name || !newHotel.city) {
      alert("Nombre y ciudad son obligatorios");
      return;
    }

    setAdding(true);
    const { error } = await supabase.from('hotels').insert(newHotel);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Hotel agregado correctamente");
      setNewHotel({ name: '', city: '', description: '', stars: 4, price_per_night_base: 0 });
      fetchHotels();
    }
    setAdding(false);
  };

  const deleteHotel = async (id: string) => {
    if (!confirm("¿Eliminar este hotel?")) return;
    
    const { error } = await supabase.from('hotels').delete().eq('id', id);
    if (error) alert("Error al eliminar");
    else fetchHotels();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Hotel size={36} /> Panel de Administrador
          </h1>
          <p className="text-gray-600 mt-1">Gestiona hoteles y habitaciones</p>
        </div>
        <Button onClick={() => router.push('/')} variant="outline">
          ← Volver al sitio
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agregar Hotel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus size={22} /> Agregar Nuevo Hotel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
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
              placeholder="Descripción breve"
              value={newHotel.description}
              onChange={(e) => setNewHotel({ ...newHotel, description: e.target.value })}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Estrellas"
                min="1"
                max="5"
                value={newHotel.stars}
                onChange={(e) => setNewHotel({ ...newHotel, stars: parseInt(e.target.value) || 4 })}
              />
              <Input
                type="number"
                placeholder="Precio base por noche"
                value={newHotel.price_per_night_base}
                onChange={(e) => setNewHotel({ ...newHotel, price_per_night_base: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <Button onClick={addHotel} className="w-full py-6" disabled={adding}>
              {adding ? "Agregando..." : "Agregar Hotel"}
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Hoteles */}
        <Card>
          <CardHeader>
            <CardTitle>Hoteles ({hotels.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando hoteles...</p>
            ) : (
              <div className="space-y-4 max-h-[650px] overflow-y-auto">
                {hotels.map((hotel) => (
                  <div key={hotel.id} className="border rounded-xl p-5 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <h3 className="font-semibold">{hotel.name}</h3>
                      <p className="text-sm text-gray-600">{hotel.city} • {hotel.stars} ★</p>
                      <p className="text-green-600 font-medium">
                        ${Number(hotel.price_per_night_base).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteHotel(hotel.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}