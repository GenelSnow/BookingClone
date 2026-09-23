import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error('RESEND_API_KEY no está configurada');
      return NextResponse.json(
        { error: 'Servicio de email no configurado' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const body = await req.json();
    const {
      to,
      hotelName,
      city,
      checkIn,
      checkOut,
      totalPrice,
      guests,
      roomName,
    } = body;

    if (!to || !hotelName) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Booking Clone <onboarding@resend.dev>',
      to: [to],
      subject: `Reserva confirmada — ${hotelName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px;">
          <h2 style="color:#003580;">¡Reserva confirmada!</h2>
          <p>Hotel: <b>${hotelName}</b></p>
          <p>Ciudad: ${city || '-'}</p>
          <p>Habitación: ${roomName || '-'}</p>
          <p>Entrada: ${checkIn}</p>
          <p>Salida: ${checkOut}</p>
          <p>Huéspedes: ${guests}</p>
          <p>Total: ${totalPrice}</p>
        </div>
      `,
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || 'Error' },
      { status: 500 }
    );
  }
}