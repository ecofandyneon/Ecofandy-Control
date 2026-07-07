import { Link } from "react-router-dom";
import ListaEditable from "../Components/UI/ListaEditable";

function RecetaNeonLED() {
  return (
    <div>
      <Link
        to="/biblioteca-productos"
        className="text-purple-400 hover:text-purple-300"
      >
        ← Volver a Biblioteca
      </Link>

      <h1 className="text-4xl font-bold text-purple-500 mt-6">
        💡 Receta Neón LED
      </h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Base de fabricación para letreros de neón LED sobre acrílico.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            📦 Materiales base
          </h2>

          <ul className="space-y-3 text-zinc-300">
            <li>✅ Manguera neón LED</li>
            <li>✅ Acrílico</li>
            <li>✅ Fuente de poder</li>
            <li>✅ Cable</li>
            <li>✅ Conectores</li>
          </ul>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            ➕ Extras opcionales
          </h2>

          <ul className="space-y-3 text-zinc-300">
            <li>⬜ Vinil de color</li>
            <li>⬜ Impresión en vinil</li>
            <li>⬜ Pintura</li>
            <li>⬜ Dimmer</li>
            <li>⬜ Control RGB</li>
            <li>⬜ Instalación</li>
          </ul>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            🧪 Consumibles
          </h2>

          <ul className="space-y-3 text-zinc-300">
            <li>✅ Estaño</li>
            <li>✅ Flux</li>
            <li>✅ Pegamento</li>
            <li>✅ Alcohol isopropílico</li>
          </ul>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            🔩 Ferretería
          </h2>

          <ul className="space-y-3 text-zinc-300">
            <li>⬜ Tornillos</li>
            <li>⬜ Tuercas</li>
            <li>⬜ Varilla roscada</li>
            <li>⬜ Rondanas</li>
          </ul>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            ⚙ Reglas de fabricación
          </h2>

          <div className="space-y-4 text-zinc-300">
            <p>
              <strong className="text-white">Margen del acrílico:</strong> 2 cm
              entre el borde del acrílico y la manguera LED.
            </p>

            <p>
              <strong className="text-white">Medida final:</strong> la medida
              real del letrero la da el acrílico.
            </p>

            <p>
              <strong className="text-white">Forma del acrílico:</strong>{" "}
              contorneado, redondo, rectangular o cuadrado.
            </p>

            <p>
              <strong className="text-white">Fuente de poder:</strong> se
              define al final, según el amperaje real de consumo.
            </p>

            <p>
              <strong className="text-white">Chapetones:</strong> normalmente no
              se usan en letreros de neón normales; dependen del tipo de montaje.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecetaNeonLED;