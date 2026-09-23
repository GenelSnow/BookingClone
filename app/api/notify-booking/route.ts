import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
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
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #003580;">¡Reserva confirmada!</h2>
          <p>Hola, tu reserva se registró correctamente.</p>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Hotel</b></td>
                <td style="padding:8px;border-bottom:1px solid #eee;">${hotelName}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Ciudad</b></td>
                <td style="padding:8px;border-bottom:1px solid #eee;">${city || '-'}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Habitación</b></td>
                <td style="padding:8px;border-bottom:1px solid #eee;">${roomName || '-'}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Entrada</b></td>
                <td style="padding:8px;border-bottom:1px solid #eee;">${checkIn}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Salida</b></td>
                <td style="padding:8px;border-bottom:1px solid #eee;">${checkOut}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Huéspedes</b></td>
                <td style="padding:8px;border-bottom:1px solid #eee;">${guests}</td></tr>
            <tr><td style="padding:8px;"><b>Total</b></td>
                <td style="padding:8px;">${totalPrice}</td></tr>
          </table>
          <p style="color:#666;font-size:13px;">Este es un correo automático de tu proyecto Booking Clone.</p>
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}