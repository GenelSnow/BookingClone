import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#003580] text-white mt-auto">
      {/* CTA superior */}
      <div className="border-b border-white/15">
        <div className="max-w-[1100px] mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg">¿Listo para tu próxima escapada?</p>
            <p className="text-sm text-white/80">
              Descubre alojamientos en Colombia con las mejores ofertas
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-white text-[#003580] text-sm font-bold hover:bg-gray-100"
          >
            Buscar alojamientos
          </Link>
        </div>
      </div>

      {/* Columnas */}
      <div className="max-w-[1100px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <p className="font-bold mb-3">Destinos</p>
            <ul className="space-y-2 text-white/80">
              <li>
                <Link href="/?q=Bogotá" className="hover:underline">
                  Bogotá
                </Link>
              </li>
              <li>
                <Link href="/?q=Medellín" className="hover:underline">
                  Medellín
                </Link>
              </li>
              <li>
                <Link href="/?q=Cartagena" className="hover:underline">
                  Cartagena
                </Link>
              </li>
              <li>
                <Link href="/?q=Cali" className="hover:underline">
                  Cali
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-3">Ayuda</p>
            <ul className="space-y-2 text-white/80">
              <li>
                <Link href="/mis-reservas" className="hover:underline">
                  Mis reservas
                </Link>
              </li>
              <li>
                <Link href="/perfil" className="hover:underline">
                  Mi cuenta
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:underline">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-3">Para partners</p>
            <ul className="space-y-2 text-white/80">
              <li>
                <Link href="/admin" className="hover:underline">
                  Panel de hoteles
                </Link>
              </li>
              <li>
                <span className="text-white/50">Registrar propiedad</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-bold mb-3">Sobre este proyecto</p>
            <ul className="space-y-2 text-white/80">
              <li>Proyecto de graduación</li>
              <li>Clon funcional de Booking</li>
              <li>Next.js + Supabase</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/15">
        <div className="max-w-[1100px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/70">
          <p>
            Copyright © {new Date().getFullYear()} Booking Clone — Proyecto académico.
            No afiliado a Booking.com.
          </p>
          <p className="font-semibold text-white/90">
            Booking<span className="text-[#febb02]">.com</span> clone
          </p>
        </div>
      </div>
    </footer>
  );
}