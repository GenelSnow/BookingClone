'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';   // ← Agrega esta línea
import { Plus, Trash2, Upload, Edit, User } from "lucide-react";


export default function AdminPage() {
    const [hotels, setHotels] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [newHotel, setNewHotel] = useState({
        name: '',
        city: '',
        description: '',
        stars: 4,
        price_per_night_base: 0,
    });

    const [newRoom, setNewRoom] = useState({
        name: '',
        type: 'Estándar',
        price_per_night: 0,
        capacity: 2,
        bed_type: 'Queen',
    });
    const [roomsToAdd, setRoomsToAdd] = useState<any[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [adding, setAdding] = useState(false);




    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        getCurrentUser();
        fetchHotels();
    }, []);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };

    const fetchHotels = async () => {
        const { data, error } = await supabase
            .from('hotels')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching hotels:", error);
        } else {
            console.log("Hoteles cargados:", data?.length, data);
        }

        setHotels(data || []);
    };

    const uploadImage = async (hotelId: string) => {
        if (!imageFile) return [];

        setUploading(true);

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${hotelId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('hotel-images')
            .upload(fileName, imageFile, {
                cacheControl: '3600',
                upsert: false
            });

        setUploading(false);

        if (error) {
            console.error("Error al subir imagen:", error);
            alert("Error al subir la imagen: " + error.message);
            return [];
        }

        const { data: { publicUrl } } = supabase.storage
            .from('hotel-images')
            .getPublicUrl(fileName);

        return [publicUrl];
    };

    // Función para agregar hotel (actualizada)
    const addHotelWithRooms = async () => {
        if (!newHotel.name || !newHotel.city || roomsToAdd.length === 0 || !currentUser) {
            alert("Faltan datos o debes estar logueado");
            return;
        }

        setAdding(true);

        // 1. Crear Hotel
        const { data: hotelData, error: hotelError } = await supabase
            .from('hotels')
            .insert({
                ...newHotel,
                created_by: currentUser.id
            })
            .select()
            .single();

        if (hotelError) {
            alert("Error creando hotel: " + hotelError.message);
            setAdding(false);
            return;
        }

        const hotelId = hotelData.id;

        // 2. Subir imagen (si hay)
        let images: string[] = [];
        if (imageFile) {
            images = await uploadImage(hotelId);
        }

        // Actualizar hotel con imágenes
        if (images.length > 0) {
            await supabase
                .from('hotels')
                .update({ images })
                .eq('id', hotelId);
        }

        // 3. Crear habitaciones
        const roomsWithHotelId = roomsToAdd.map(room => ({
            ...room,
            hotel_id: hotelId
        }));

        const { error: roomsError } = await supabase
            .from('rooms')
            .insert(roomsWithHotelId);

        if (roomsError) {
            alert("Hotel creado pero error en habitaciones: " + roomsError.message);
        } else {
            alert("Hotel y habitaciones creados correctamente!");
            // Limpiar formulario
            setNewHotel({ name: '', city: '', description: '', stars: 4, price_per_night_base: 0 });
            setRoomsToAdd([]);
            setImageFile(null);
            fetchHotels();
        }

        setAdding(false);
    };

    const addRoomToList = () => {
        if (!newRoom.name || newRoom.price_per_night <= 0) {
            alert("Nombre y precio de habitación son obligatorios");
            return;
        }
        setRoomsToAdd([...roomsToAdd, { ...newRoom }]);
        setNewRoom({ name: '', price_per_night: 0, capacity: 2, bed_type: 'Queen' });
    };

    const deleteHotel = async (hotelId: string) => {
        if (!currentUser) {
            alert("Debes estar logueado");
            return;
        }

        const hotel = hotels.find(h => h.id === hotelId);
        if (hotel?.created_by && hotel.created_by !== currentUser.id) {
            alert("No tienes permiso para eliminar este hotel");
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar el hotel "${hotel?.name}"?`)) return;

        const { error } = await supabase
            .from('hotels')
            .delete()
            .eq('id', hotelId);

        if (error) {
            console.error(error);
            alert("Error al eliminar: " + error.message);
        } else {
            alert("Hotel eliminado correctamente");
            fetchHotels(); // recargar lista
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-4xl font-bold mb-10">Panel de Administrador</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Formulario Crear Hotel + Habitaciones */}
                <Card>
                    <CardHeader>
                        <CardTitle>Crear Nuevo Hotel + Habitaciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Datos del Hotel */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Datos del Hotel</h3>

                            <div className="space-y-2">
                                <Input placeholder="Nombre del hotel" value={newHotel.name} onChange={e => setNewHotel({ ...newHotel, name: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Input placeholder="Ciudad" value={newHotel.city} onChange={e => setNewHotel({ ...newHotel, city: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Input placeholder="Descripción breve del hotel" value={newHotel.description} onChange={e => setNewHotel({ ...newHotel, description: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Estrellas (1-5)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={newHotel.stars ?? ''}
                                        onChange={e => setNewHotel({
                                            ...newHotel,
                                            stars: e.target.value === '' ? 4 : parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Precio base por noche (COP)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="50000"
                                        placeholder="$90000"
                                        value={newHotel.price_per_night_base ?? ''}
                                        onChange={e => setNewHotel({
                                            ...newHotel,
                                            price_per_night_base: e.target.value === '' ? 0 : parseFloat(e.target.value)
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Imagen principal del hotel</Label>
                                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                            </div>
                        </div>

                        {/* Habitaciones */}
                        <div className="border-t pt-6">
                            <h3 className="font-semibold text-lg mb-4">Agregar Habitaciones (mínimo 1)</h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div className="md:col-span-2">
                                        <Label>Nombre de la Habitación</Label>
                                        <Input
                                            placeholder="Ej: Habitación pequeña"
                                            value={newRoom.name}
                                            onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Tipo de Habitación</Label>
                                        <Input
                                            placeholder="Ej: Deluxe, Estándar, Suite"
                                            value={newRoom.type}
                                            onChange={e => setNewRoom({ ...newRoom, type: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Precio por noche</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="50000"
                                            placeholder="$90000"
                                            value={newRoom.price_per_night ?? ''}
                                            onChange={e => setNewRoom({
                                                ...newRoom,
                                                price_per_night: e.target.value === '' ? 0 : parseFloat(e.target.value)
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Capacidad</Label>
                                        <Input
                                            type="number"
                                            placeholder="2"
                                            value={newRoom.capacity ?? 2}
                                            onChange={e => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) ?? 2 })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Tipo de cama</Label>
                                    <Input
                                        placeholder="Queen / King / 2 Twin"
                                        value={newRoom.bed_type}
                                        onChange={e => setNewRoom({ ...newRoom, bed_type: e.target.value })}
                                    />
                                </div>

                                <Button onClick={addRoomToList} variant="secondary" className="w-full">
                                    + Agregar Habitación a la lista
                                </Button>
                            </div>

                            {/* Lista de habitaciones a agregar */}
                            {roomsToAdd.length > 0 && (
                                <div className="mt-8">
                                    <p className="font-medium mb-4">Habitaciones a agregar ({roomsToAdd.length})</p>
                                    <div className="space-y-3">
                                        {roomsToAdd.map((room, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
                                                <div>
                                                    <p className="font-medium">{room.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        ${room.price_per_night} • {room.capacity} pers. • {room.bed_type}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            // Editar (cargar en el formulario)
                                                            setNewRoom(room);
                                                            const newList = roomsToAdd.filter((_, i) => i !== index);
                                                            setRoomsToAdd(newList);
                                                        }}
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => deleteHotel(hotel.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button onClick={addHotelWithRooms} className="w-full py-6 text-lg" disabled={adding || roomsToAdd.length === 0}>
                            {adding ? "Creando Hotel..." : "Crear Hotel + Habitaciones"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Lista de Hoteles */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hoteles existentes ({hotels.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {hotels.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No hay hoteles todavía. Crea uno arriba.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {hotels.map((hotel: any) => (
                                    <div key={hotel.id} className="border rounded-2xl p-6 hover:shadow-md transition-all bg-white">
                                        <div className="flex gap-6">
                                            {hotel.images && hotel.images.length > 0 ? (
                                                <img
                                                    src={hotel.images[0]}
                                                    alt={hotel.name}
                                                    className="w-32 h-24 object-cover rounded-xl flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-32 h-24 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    Sin imagen
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-semibold truncate">{hotel.name}</h3>
                                                <p className="text-gray-600">{hotel.city} • {hotel.stars} ★</p>
                                                <p className="text-green-600 font-medium">
                                                    ${Number(hotel.price_per_night_base || 0).toLocaleString('es-CO')}
                                                </p>
                                                {hotel.created_by && (
                                                    <p className="text-xs text-gray-500 mt-2">Creado por: {hotel.created_by}</p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {/* Botones de acción solo si es el creador */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        alert("Funcionalidad de editar en desarrollo.\n\nHotel ID: " + hotel.id);
                                                        // Aquí después abriremos un modal o iremos a una página de edición
                                                    }}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm("¿Eliminar este hotel?")) {
                                                            // temporal - solo console
                                                            console.log("Eliminar hotel:", hotel.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                </Button>
                                            </div>
                                        </div>
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