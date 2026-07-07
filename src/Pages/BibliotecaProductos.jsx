import { Link } from "react-router-dom";

function BibliotecaProductos() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500">
        🏭 Ingeniería de Productos
      </h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Recetas de fabricación, materiales base, extras y reglas de cada tipo de letrero.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-purple-400 mb-3">
            💡 Neón LED
          </h2>

          <p className="text-zinc-400 mb-6">
            Receta base para letreros de neón LED sobre acrílico.
          </p>

          <Link
            to="/biblioteca-productos/neon-led"
            className="block text-center w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl"
          >
            Abrir receta
          </Link>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 opacity-60">
          <h2 className="text-2xl font-bold text-purple-400 mb-3">
            🔲 Letras Corpóreas
          </h2>

          <p className="text-zinc-400 mb-6">Próximamente.</p>

          <button className="w-full bg-zinc-800 text-zinc-500 font-bold py-3 rounded-xl">
            Próximamente
          </button>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 opacity-60">
          <h2 className="text-2xl font-bold text-purple-400 mb-3">
            🪧 Caja de Luz
          </h2>

          <p className="text-zinc-400 mb-6">Próximamente.</p>

          <button className="w-full bg-zinc-800 text-zinc-500 font-bold py-3 rounded-xl">
            Próximamente
          </button>
        </div>
      </div>
    </div>
  );
}

export default BibliotecaProductos;