export default function TestEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico de Variables de Entorno</h1>
      
      <div className="space-y-4">
        <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ No encontrada"}</p>
        <p><strong>KEY (primeros 20 caracteres):</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0,20) || "❌ No encontrada"}...</p>
      </div>
    </div>
  );
}