import ReferenciaPanel from "../Components/RenderAI/ReferenciaPanel";

function RenderAI() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500">
        🎨 Render AI
      </h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Estudio inteligente para generar renders, vectores y cotizaciones.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ReferenciaPanel />

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            ✍ Prompt
          </h2>

          <textarea
            className="input min-h-40"
            placeholder="Describe el letrero que quieres generar..."
          />

          <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl">
            ✨ Generar Render
          </button>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            ⚙ Configuración
          </h2>

          <div className="space-y-4">
            <select className="input">
              <option>Neón LED</option>
              <option>Letras Corpóreas</option>
              <option>Caja de Luz</option>
              <option>Glorificador</option>
            </select>

            <select className="input">
              <option>Blanco cálido</option>
              <option>Blanco frío</option>
              <option>Rosa</option>
              <option>Azul Ice</option>
              <option>Rojo</option>
            </select>

            <select className="input">
              <option>Acrílico transparente</option>
              <option>Acrílico blanco</option>
              <option>Muro oscuro</option>
              <option>Mesa reflectante</option>
            </select>
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            🖼 Vista previa
          </h2>

          <div className="bg-zinc-950 rounded-xl min-h-80 flex items-center justify-center text-zinc-600">
            Aquí aparecerá el render generado
          </div>
        </div>
      </div>
    </div>
  );
}

export default RenderAI;