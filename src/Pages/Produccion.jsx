import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { db } from "../Services/firebase";
import EcoCard from "../Components/NeonUI/EcoCard";
import EcoProgress from "../Components/NeonUI/EcoProgress";
import useProduccion from "../Hooks/useProduccion";

const ETAPAS = [
  { id: "aprobado", nombre: "Aprobado", icono: "✅" },
  { id: "corte", nombre: "Corte", icono: "✂️" },
  { id: "armado", nombre: "Armado LED", icono: "💡" },
  { id: "pruebas", nombre: "Pruebas", icono: "🧪" },
  { id: "finalizado", nombre: "Finalizado", icono: "✨" },
  { id: "empaque", nombre: "Empaque", icono: "📦" },
  { id: "entregado", nombre: "Entregado", icono: "🚚" },
];

const AVANCES = {
  aprobado: 15,
  corte: 30,
  "corte cnc": 30,
  "armado led": 50,
  pruebas: 70,
  finalizado: 85,
  empaque: 95,
  entregado: 100,
};

const SIGUIENTE_ETAPA = {
  aprobado: "Corte",
  corte: "Armado LED",
  "corte cnc": "Armado LED",
  "armado led": "Pruebas",
  pruebas: "Finalizado",
  finalizado: "Empaque",
  empaque: "Entregado",
};

function normalizarEstado(estado = "") {
  return String(estado).trim().toLowerCase();
}

function calcularAvanceProduccion(estado) {
  return AVANCES[normalizarEstado(estado)] ?? 0;
}

function perteneceAEtapa(proyecto, etapa) {
  const estado = normalizarEstado(proyecto.estado);

  switch (etapa.id) {
    case "aprobado":
      return estado === "aprobado";

    case "corte":
      return estado === "corte" || estado === "corte cnc";

    case "armado":
      return estado === "armado led";

    case "pruebas":
      return estado === "pruebas";

    case "finalizado":
      return estado === "finalizado";

    case "empaque":
      return estado === "empaque";

    case "entregado":
      return estado === "entregado";

    default:
      return false;
  }
}

function obtenerResumenPago(proyecto) {
  const cotizacion = proyecto.cotizacionRelacionada;

  const total = Number(
    cotizacion?.precioFinal ||
      cotizacion?.precioVenta ||
      proyecto.precioFinal ||
      proyecto.precioVenta ||
      0
  );

  const pagos = Array.isArray(cotizacion?.pagos)
    ? cotizacion.pagos
    : [];

  const pagado = pagos.reduce(
    (suma, pago) => suma + Number(pago.monto || 0),
    0
  );

  const saldo = Math.max(total - pagado, 0);

  if (total > 0 && saldo <= 0) {
    return {
      texto: "LIQUIDADO",
      clase:
        "bg-green-950/60 border-green-500 text-green-300",
      pagado,
      saldo,
    };
  }

  if (pagado > 0) {
    return {
      texto: "PAGO PARCIAL",
      clase:
        "bg-yellow-950/60 border-yellow-500 text-yellow-300",
      pagado,
      saldo,
    };
  }

  return {
    texto: "SIN PAGO",
    clase: "bg-red-950/60 border-red-500 text-red-300",
    pagado,
    saldo,
  };
}

function Produccion() {
  const { proyectos, loading } = useProduccion();

  const [proyectosConCotizacion, setProyectosConCotizacion] =
    useState([]);

  const [cargandoCotizaciones, setCargandoCotizaciones] =
    useState(true);

  useEffect(() => {
    const cargarCotizaciones = async () => {
      if (loading) return;

      try {
        setCargandoCotizaciones(true);

        const proyectosHidratados = await Promise.all(
          proyectos.map(async (proyecto) => {
            if (!proyecto.cotizacionId) {
              return {
                ...proyecto,
                cotizacionRelacionada: null,
              };
            }

            try {
              const cotizacionRef = doc(
                db,
                "cotizaciones",
                proyecto.cotizacionId
              );

              const cotizacionSnap = await getDoc(cotizacionRef);

              return {
                ...proyecto,
                cotizacionRelacionada: cotizacionSnap.exists()
                  ? {
                      id: cotizacionSnap.id,
                      ...cotizacionSnap.data(),
                    }
                  : null,
              };
            } catch (error) {
              console.error(
                "Error cargando cotización relacionada:",
                error
              );

              return {
                ...proyecto,
                cotizacionRelacionada: null,
              };
            }
          })
        );

        setProyectosConCotizacion(proyectosHidratados);
      } finally {
        setCargandoCotizaciones(false);
      }
    };

    cargarCotizaciones();
  }, [proyectos, loading]);

  const avanzarEtapa = async (proyecto) => {
    const estadoActual = normalizarEstado(proyecto.estado);

    const siguienteEstado =
      SIGUIENTE_ETAPA[estadoActual];

    if (!siguienteEstado) {
      Swal.fire({
        icon: "success",
        title: "Proyecto entregado",
        text: "Este pedido ya llegó al final del proceso.",
        confirmButtonColor: "#7C3AED",
      });

      return;
    }

    const confirmar = await Swal.fire({
      icon: "question",
      title: "¿Avanzar etapa?",
      html: `
        <b>${proyecto.codigo || "Proyecto"}</b><br><br>
        ${proyecto.estado} ➜ <b>${siguienteEstado}</b>
      `,
      showCancelButton: true,
      confirmButtonText: `Sí, pasar a ${siguienteEstado}`,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#7C3AED",
      cancelButtonColor: "#52525B",
    });

    if (!confirmar.isConfirmed) return;

    try {
      const proyectoRef = doc(
        db,
        "proyectos",
        proyecto.id
      );

      await updateDoc(proyectoRef, {
        estado: siguienteEstado,
      });

      setProyectosConCotizacion((actuales) =>
        actuales.map((item) =>
          item.id === proyecto.id
            ? {
                ...item,
                estado: siguienteEstado,
              }
            : item
        )
      );

      Swal.fire({
        icon: "success",
        title: "Etapa actualizada",
        text: `${proyecto.codigo || "Proyecto"} ahora está en ${siguienteEstado}.`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error avanzando etapa:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar",
        text: "Ocurrió un error al cambiar la etapa.",
        confirmButtonColor: "#7C3AED",
      });
    }
  };

  if (loading || cargandoCotizaciones) {
    return (
      <div className="text-zinc-400 text-lg">
        Cargando Centro de Producción...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500 mb-2">
        🏭 Centro de Producción
      </h1>

      <p className="text-zinc-400 mb-8">
        Visualiza todos los pedidos organizados por etapa de
        producción.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {ETAPAS.map((etapa) => {
          const proyectosEtapa =
            proyectosConCotizacion.filter((proyecto) =>
              perteneceAEtapa(proyecto, etapa)
            );

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
                  proyectosEtapa.map((proyecto) => {
                    const resumenPago =
                      obtenerResumenPago(proyecto);

                    const avance =
                      calcularAvanceProduccion(
                        proyecto.estado
                      );

                    const siguienteEstado =
                      SIGUIENTE_ETAPA[
                        normalizarEstado(proyecto.estado)
                      ];

                    return (
                      <div
                        key={proyecto.id}
                        className="bg-zinc-900 rounded-xl border border-zinc-700 p-4"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <span className="font-bold text-purple-400">
                            {proyecto.codigo ||
                              proyecto.folio ||
                              proyecto.folioCotizacion ||
                              "Sin código"}
                          </span>

                          <span
                            className={`text-xs font-bold border px-2 py-1 rounded-full ${resumenPago.clase}`}
                          >
                            {resumenPago.texto}
                          </span>
                        </div>

                        <h3 className="font-bold text-white mt-2">
                          {proyecto.cliente || "Sin cliente"}
                        </h3>

                        <p className="text-zinc-400 text-sm mb-3">
                          {proyecto.proyecto ||
                            proyecto.nombreProyecto ||
                            "Sin nombre de proyecto"}
                        </p>

                        <EcoProgress value={avance} />

                        <div className="mt-3 text-xs text-zinc-500 space-y-1">
                          <div className="flex justify-between">
                            <span>Pagado</span>

                            <span>
                              $
                              {resumenPago.pagado.toLocaleString(
                                "es-MX"
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span>Saldo</span>

                            <span>
                              $
                              {resumenPago.saldo.toLocaleString(
                                "es-MX"
                              )}
                            </span>
                          </div>
                        </div>

                        {siguienteEstado && (
                          <button
                            onClick={() =>
                              avanzarEtapa(proyecto)
                            }
                            className="w-full mt-4 bg-green-600 hover:bg-green-700 rounded-xl py-2 font-bold transition"
                          >
                            🚀 Avanzar a {siguienteEstado}
                          </button>
                        )}

                        {!siguienteEstado && (
                          <div className="mt-4 text-center text-green-400 font-bold">
                            ✅ Proceso terminado
                          </div>
                        )}

                        <Link
                          to={`/proyectos/${proyecto.id}`}
                          className="block mt-3"
                        >
                          <button className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl py-2 font-bold transition">
                            📂 Abrir
                          </button>
                        </Link>
                      </div>
                    );
                  })
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