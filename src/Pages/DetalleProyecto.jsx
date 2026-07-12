import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { db } from "../Services/firebase";
import Swal from "sweetalert2";

const ESTADOS = [
  "Aprobado",
  "Corte",
  "Armado LED",
  "Pruebas",
  "Finalizado",
  "Empaque",
  "Entregado",
];

const AVANCE = {
  Aprobado: 15,
  Corte: 30,
  "Armado LED": 50,
  Pruebas: 70,
  Finalizado: 85,
  Empaque: 95,
  Entregado: 100,
};

function moneda(valor) {
  return Number(valor || 0).toLocaleString("es-MX");
}

function mostrarMedidas(medidas) {
  if (!medidas) return "Sin medidas registradas";
  if (typeof medidas === "string") return medidas;

  const ancho = medidas.ancho || 0;
  const alto = medidas.alto || 0;
  return `${ancho} × ${alto} cm`;
}

function DetalleProyecto() {
  const { id } = useParams();

  const [proyecto, setProyecto] = useState(null);
  const [cotizacion, setCotizacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [cliente, setCliente] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("Aprobado");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("Recoge en taller");
  const [notas, setNotas] = useState("");
  const [fotosProceso, setFotosProceso] = useState("");

  useEffect(() => {
    const cargarProyecto = async () => {
      try {
        setCargando(true);

        const proyectoRef = doc(db, "proyectos", id);
        const proyectoSnap = await getDoc(proyectoRef);

        if (!proyectoSnap.exists()) {
          Swal.fire({
            icon: "error",
            title: "Proyecto no encontrado",
            confirmButtonColor: "#7C3AED",
          });
          return;
        }

        const data = {
          id: proyectoSnap.id,
          ...proyectoSnap.data(),
        };

        setProyecto(data);
        setCliente(data.cliente || "");
        setWhatsapp(data.whatsapp || "");
        setNombreProyecto(data.proyecto || data.nombreProyecto || "");
        setDescripcion(data.descripcion || "");
        setEstado(ESTADOS.includes(data.estado) ? data.estado : "Aprobado");
        setFechaEntrega(data.fechaEntrega || "");
        setTipoEntrega(data.tipoEntrega || "Recoge en taller");
        setNotas(data.notasInternas ?? data.notas ?? "");
        setFotosProceso(data.fotosProceso || "");

        if (data.cotizacionId) {
          const cotizacionRef = doc(db, "cotizaciones", data.cotizacionId);
          const cotizacionSnap = await getDoc(cotizacionRef);

          if (cotizacionSnap.exists()) {
            setCotizacion({
              id: cotizacionSnap.id,
              ...cotizacionSnap.data(),
            });
          } else {
            setCotizacion(null);
          }
        } else {
          setCotizacion(null);
        }
      } catch (error) {
        console.error("Error cargando proyecto:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar el proyecto.",
          confirmButtonColor: "#7C3AED",
        });
      } finally {
        setCargando(false);
      }
    };

    cargarProyecto();
  }, [id]);

  const avance = AVANCE[estado] ?? 15;

  const total = Number(
    cotizacion?.precioFinal ||
      cotizacion?.precioVenta ||
      proyecto?.precioFinal ||
      proyecto?.precioVenta ||
      0
  );

  const pagos = Array.isArray(cotizacion?.pagos)
    ? cotizacion.pagos
    : [];

  const totalPagado = useMemo(
    () =>
      pagos.reduce(
        (suma, pago) => suma + Number(pago.monto || 0),
        0
      ),
    [pagos]
  );

  const saldo = Math.max(total - totalPagado, 0);

  const estadoPago =
    total > 0 && saldo <= 0
      ? "LIQUIDADO"
      : totalPagado > 0
        ? "PAGO PARCIAL"
        : "SIN PAGO";

  const materiales =
    cotizacion?.materiales || proyecto?.materiales || [];

  const archivos =
    cotizacion?.archivos || proyecto?.archivos || [];

  const renderAprobado = archivos.find(
    (archivo) => archivo.categoria === "render-aprobado"
  );

  const archivoVector = archivos.find(
    (archivo) =>
      archivo.categoria === "svg" ||
      archivo.categoria === "archivo-produccion"
  );

  const medidas =
    cotizacion?.medidas || proyecto?.medidas || "";

  const guardarCambios = async () => {
    try {
      setGuardando(true);

      const cambios = {
        cliente,
        whatsapp,
        proyecto: nombreProyecto,
        nombreProyecto,
        descripcion,
        estado,
        avance,
        fechaEntrega,
        tipoEntrega,
        notasInternas: notas,
        fotosProceso,
      };

      await updateDoc(doc(db, "proyectos", id), cambios);

      setProyecto((actual) => ({
        ...actual,
        ...cambios,
      }));

      Swal.fire({
        icon: "success",
        title: "Proyecto actualizado",
        text: "Los cambios de producción quedaron guardados.",
        confirmButtonColor: "#7C3AED",
      });
    } catch (error) {
      console.error("Error guardando proyecto:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron guardar los cambios.",
        confirmButtonColor: "#7C3AED",
      });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <p className="text-zinc-400">Cargando proyecto...</p>;
  }

  if (!proyecto) {
    return <p className="text-red-400">Proyecto no encontrado.</p>;
  }

  return (
    <div>
      <Link
        to="/proyectos"
        className="text-purple-400 hover:text-purple-300"
      >
        ← Volver a proyectos
      </Link>

      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mt-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-purple-500">
            {proyecto.codigo ||
              proyecto.folio ||
              proyecto.folioCotizacion ||
              "Sin código"}{" "}
            · {nombreProyecto || "Proyecto"}
          </h1>

          <p className="text-zinc-400 mt-2">
            {cliente || "Sin cliente"} · Centro de producción
          </p>
        </div>

        <span className="bg-purple-600/20 text-purple-300 px-4 py-2 rounded-full font-bold">
          {estado}
        </span>
      </div>

      <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-purple-400">
            📌 Avance de producción
          </h2>

          <span className="font-bold text-purple-300">{avance}%</span>
        </div>

        <p className="text-zinc-400 text-sm mb-3">{estado}</p>

        <div className="w-full bg-zinc-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${avance}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            👤 Pedido
          </h2>

          <label className="text-zinc-400 text-sm">Cliente</label>
          <input
            className="input mt-2 mb-4"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />

          <label className="text-zinc-400 text-sm">WhatsApp</label>
          <input
            className="input mt-2 mb-4"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />

          <label className="text-zinc-400 text-sm">Trabajo</label>
          <input
            className="input mt-2 mb-4"
            value={nombreProyecto}
            onChange={(e) => setNombreProyecto(e.target.value)}
          />

          <label className="text-zinc-400 text-sm">Medidas</label>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mt-2 text-zinc-200">
            {mostrarMedidas(medidas)}
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            🏭 Producción
          </h2>

          <label className="text-zinc-400 text-sm">Estado actual</label>
          <select
            className="input mt-2 mb-4"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            {ESTADOS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-sm">
                Fecha estimada de entrega
              </label>

              <input
                className="input mt-2"
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
              />
            </div>

            <div>
              <label className="text-zinc-400 text-sm">
                Tipo de entrega
              </label>

              <select
                className="input mt-2"
                value={tipoEntrega}
                onChange={(e) => setTipoEntrega(e.target.value)}
              >
                <option>Recoge en taller</option>
                <option>Entrega local</option>
                <option>Envío</option>
                <option>Instalación</option>
              </select>
            </div>
          </div>

          <label className="text-zinc-400 text-sm block mt-4">
            Fotos / enlaces del proceso
          </label>

          <textarea
            className="input min-h-28 mt-2"
            value={fotosProceso}
            onChange={(e) => setFotosProceso(e.target.value)}
            placeholder="Pega aquí enlaces o referencias de fotos del corte, armado, pruebas y producto final."
          />
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            📦 Expediente heredado de la cotización
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-400 text-sm mb-2">Render aprobado</p>
              {renderAprobado ? (
                <a
                  href={renderAprobado.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-300 hover:text-purple-200 break-all"
                >
                  👁 Ver render aprobado
                </a>
              ) : (
                <p className="text-zinc-200">Sin render registrado</p>
              )}
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-400 text-sm mb-2">Archivo vector</p>
              {archivoVector ? (
                <a
                  href={archivoVector.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-300 hover:text-purple-200 break-all"
                >
                  👁 Ver archivo vector
                </a>
              ) : (
                <p className="text-zinc-200">Sin vector registrado</p>
              )}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mt-4">
            <p className="text-zinc-400 text-sm mb-3">
              Materiales / información técnica
            </p>

            {Array.isArray(materiales) && materiales.length > 0 ? (
              <div className="space-y-2">
                {materiales.map((material, index) => (
                  <div
                    key={`${material.articuloId || material.nombre}-${index}`}
                    className="flex justify-between gap-4 border-b border-zinc-800 pb-2"
                  >
                    <div>
                      <p className="font-bold text-zinc-200">
                        {material.nombre || "Material"}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {material.descripcionCantidad || ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-200">
                {typeof materiales === "string"
                  ? materiales
                  : "Sin materiales registrados"}
              </p>
            )}
          </div>

          <div className="mt-4">
            <label className="text-zinc-400 text-sm">
              Descripción del trabajo
            </label>

            <textarea
              className="input min-h-32 mt-2"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            💰 Pago
          </h2>

          <p className="text-zinc-500 text-sm mb-4">
            Información tomada directamente de la cotización.
          </p>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Total</span>
              <strong className="text-green-400">
                ${moneda(total)}
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Pagado</span>
              <strong>${moneda(totalPagado)}</strong>
            </div>

            <div className="flex justify-between gap-4 border-t border-zinc-800 pt-3">
              <span className="text-zinc-300">Saldo</span>
              <strong className={saldo <= 0 ? "text-green-400" : "text-yellow-300"}>
                ${moneda(saldo)}
              </strong>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 font-bold text-center ${
              estadoPago === "LIQUIDADO"
                ? "bg-green-950/60 border-green-500 text-green-300"
                : estadoPago === "PAGO PARCIAL"
                  ? "bg-yellow-950/60 border-yellow-500 text-yellow-300"
                  : "bg-red-950/60 border-red-500 text-red-300"
            }`}
          >
            {estadoPago}
          </div>

          {!cotizacion && (
            <p className="text-red-400 text-sm mt-4">
              ⚠️ Este proyecto no tiene una cotización relacionada.
            </p>
          )}
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-3">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            📝 Notas internas de producción
          </h2>

          <textarea
            className="input min-h-36"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Pendientes, cambios, detalles de fabricación, observaciones para corte, armado o entrega..."
          />
        </div>
      </div>

      <button
        onClick={guardarCambios}
        disabled={guardando}
        className="mt-8 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl"
      >
        {guardando
          ? "Guardando..."
          : "💜 Guardar cambios de producción"}
      </button>
    </div>
  );
}

export default DetalleProyecto;