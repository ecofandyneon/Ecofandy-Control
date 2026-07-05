import { Link } from "react-router-dom";
import EcoCard from "../Components/NeonUI/EcoCard";
import EcoProgress from "../Components/NeonUI/EcoProgress";
import useProduccion from "../Hooks/useProduccion";
import { ETAPAS_PRODUCCION } from "../Config/etapasProduccion";
import { calcularAvance } from "../Utils/calcularAvance";

function Produccion() {
  const { proyectos, loading } = useProduccion();

  if (loading) {
    return (
      <div className="text-zinc-400 text-lg">
        Cargando Centro de Producción...
      </div>
    );
  }

  const obtenerProyectosPorEtapa = (nombreEtapa) => {
    return proyectos.filter((proyecto) => {
      const estado = (proyecto.estado || "").trim();

      switch (nombreEtapa) {
        case "Diseño":
          return (
            estado === "Idea recibida" ||
            estado === "Diseño / Render"
          );

        case "Corte CNC":
          return (
            estado === "Corte" ||
            estado === "Corte CNC"
          );

        case "Armado LED":
          return estado === "Armado LED";

        case "Pruebas":
          return estado === "Pruebas";

        case "Entrega":
          return (
            estado === "Finalizado" ||
            estado === "Empaque" ||
            estado === "Entregado" ||
            estado === "Liquidado"
          );

        default:
          return false;
      }
    });
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500 mb-2">
        🏭 Centro de Producción
      </h1>

      <p className="text-zinc-400 mb-8">
        Visualiza todos los proyectos organizados por etapa.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {ETAPAS_PRODUCCION.map((etapa) => {
          const proyectosEtapa = obtenerProyectosPorEtapa(etapa.nombre);

          return (
            <EcoCard key={etapa.id}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-white">
                  {etapa.icono} {etapa.nombre}
                </h2>

                <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                  {proyectosEtapa.length}
                </span>
              </div>

              <div className="space-y-4">
                {proyectosEtapa.length === 0 ? (
                  <div className="text-zinc-500 text-sm text-center py-8">
                    Sin proyectos
                  </div>
                ) : (
                  proyectosEtapa.map((proyecto) => (
                    <div
                      key={proyecto.id}
                      className="bg-zinc-900 rounded-xl border border-zinc-700 p-4"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-purple-400">
                          {proyecto.codigo || "Sin código"}
                        </span>
                      </div>

                      <h3 className="font-bold text-white">
                        {proyecto.cliente}
                      </h3>

                      <p className="text-zinc-400 text-sm mb-3">
                        {proyecto.proyecto}
                      </p>

                      <EcoProgress
                        value={calcularAvance(proyecto.estado)}
                      />

                      <Link
                        to={`/proyectos/${proyecto.id}`}
                        className="block mt-4"
                      >
                        <button className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl py-2 font-bold transition">
                          📂 Abrir
                        </button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </EcoCard>
          );
        })}
      </div>
    </div>
  );
}

export default Produccion;