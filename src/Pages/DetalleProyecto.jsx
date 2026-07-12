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
  "Foto final",
  "Listo para entrega",
  "Entregado",
];

const AVANCE = {
  Aprobado: 15,
  Corte: 30,
  "Armado LED": 50,
  Pruebas: 70,
  "Foto final": 85,
  "Listo para entrega": 95,
  Entregado: 100,
};

function DetalleProyecto() {
  const { id } = useParams();

  const [proyecto, setProyecto] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [cliente, setCliente] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [estado, setEstado] = useState("Aprobado");
  const [subtotal, setSubtotal] = useState("");
  const [requiereFactura, setRequiereFactura] = useState(false);
  const [anticipo, setAnticipo] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("Recoge en taller");
  const [notas, setNotas] = useState("");
  const [fotosProceso, setFotosProceso] = useState("");

  useEffect(() => {
    const cargarProyecto = async () => {
      try {
        const docRef = doc(db, "proyectos", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          Swal.fire({
            icon: "error",
            title: "Proyecto no encontrado",
            confirmButtonColor: "#7C3AED",
          });
          return;
        }

        const data = { id: docSnap.id, ...docSnap.data() };

        setProyecto(data);
        setCliente(data.cliente || "");
        setWhatsapp(data.whatsapp || "");
        setNombreProyecto(data.proyecto || "");
        setDescripcion(data.descripcion || "");

        const estadoInicial = ESTADOS.includes(data.estado)
          ? data.estado
          : "Aprobado";

        setEstado(estadoInicial);
        setSubtotal(data.subtotal ?? data.precio ?? data.total ?? "");
        setRequiereFactura(Boolean(data.requiereFactura));
        setAnticipo(data.anticipo ?? data.pagado ?? "");
        setFechaEntrega(data.fechaEntrega || "");
        setTipoEntrega(data.tipoEntrega || "Recoge en taller");
        setNotas(data.notasInternas ?? data.notas ?? "");
        setFotosProceso(data.fotosProceso || "");
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar el proyecto.",
          confirmButtonColor: "#7C3AED",
        });
      }
    };

    cargarProyecto();
  }, [id]);

  const iva = requiereFactura ? Number(subtotal || 0) * 0.16 : 0;
  const total = Number(subtotal || 0) + iva;
  const saldo = Math.max(total - Number(anticipo || 0), 0);
  const avance = AVANCE[estado] ?? 15;

  const estadoPago = useMemo(() => {
    if (total <= 0) return "Pendiente";
    if (saldo <= 0) return "Liquidado";
    if (Number(anticipo || 0) > 0) return "Anticipo recibido";
    return "Pendiente de pago";
  }, [total, saldo, anticipo]);

  const materialesHeredados =
    proyecto?.materiales ||
    proyecto?.materialesEstimados ||
    proyecto?.detalleMateriales ||
    "";

  const renderHeredado =
    proyecto?.renderAprobado ||
    proyecto?.urlRender ||
    proyecto?.renderUrl ||
    "";

  const vectorHeredado =
    proyecto?.archivoVector ||
    proyecto?.vector ||
    proyecto?.vectorUrl ||
    "";

  const medidasHeredadas =
    proyecto?.medidasFinales ||
    proyecto?.medidas ||
    "";

  const guardarCambios = async () => {
    try {
      setGuardando(true);

      await updateDoc(doc(db, "proyectos", id), {
        cliente,
        whatsapp,
        proyecto: nombreProyecto,
        descripcion,
        estado,
        avance,
        subtotal: Number(subtotal || 0),
        requiereFactura,
        iva,
        total,
        precio: total,
        anticipo: Number(anticipo || 0),
        saldo,
        estadoPago,
        fechaEntrega,
        tipoEntrega,
        notasInternas: notas,
        fotosProceso,
      });

      setProyecto((actual) => ({
        ...actual,
        cliente,
        whatsapp,
        proyecto: nombreProyecto,
        descripcion,
        estado,
        avance,
        subtotal: Number(subtotal || 0),
        requiereFactura,
        iva,
        total,
        precio: total,
        anticipo: Number(anticipo || 0),
        saldo,
        estadoPago,
        fechaEntrega,
        tipoEntrega,
        notasInternas: notas,
        fotosProceso,
      }));

      Swal.fire({
        icon: "success",
        title: "Proyecto actualizado",
        text: "Los cambios de producción quedaron guardados.",
        confirmButtonColor: "#7C3AED",
      });
    } catch (error) {
      console.error(error);

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

  const marcarLiquidado = () => {
    setAnticipo(total);
  };

  if (!proyecto) {
    return <p className="text-zinc-400">Cargando proyecto...</p>;
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
            {proyecto.codigo || "Sin código"} · {nombreProyecto || "Proyecto"}
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
            {typeof medidasHeredadas === "object" && medidasHeredadas !== null
         ? `${medidasHeredadas.ancho || 0} × ${
             medidasHeredadas.alto || 0
            } cm`
          : medidasHeredadas || "Sin medidas registradas"}
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
              <label className="text-zinc-400 text-sm">Tipo de entrega</label>
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
              <p className="text-zinc-200 break-all">
                {renderHeredado || "Sin render registrado"}
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-400 text-sm mb-2">Archivo vector</p>
              <p className="text-zinc-200 break-all">
                {vectorHeredado || "Sin vector registrado"}
              </p>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mt-4">
            <p className="text-zinc-400 text-sm mb-2">
              Materiales / información técnica
            </p>
            <p className="text-zinc-200 whitespace-pre-wrap">
              {Array.isArray(materialesHeredados)
                ? materialesHeredados
                 .map(
              (material) =>
               `${material.nombre || "Material"}${
                material.descripcionCantidad
              ? ` · ${material.descripcionCantidad}`
              : ""
          }`
      )
      .join("\n")
  : materialesHeredados || "Sin materiales registrados"}
            </p>
          </div>

          <div className="mt-4">
            <label className="text-zinc-400 text-sm">Descripción del trabajo</label>
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

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">Subtotal</span>
              <strong>${Number(subtotal || 0).toLocaleString("es-MX")}</strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-zinc-400">IVA</span>
              <strong>${iva.toLocaleString("es-MX")}</strong>
            </div>

            <div className="flex justify-between gap-4 border-t border-zinc-800 pt-3">
              <span className="text-zinc-300">Total</span>
              <strong className="text-green-400">
                ${total.toLocaleString("es-MX")}
              </strong>
            </div>
          </div>

          <label className="text-zinc-400 text-sm">Anticipo / pagado</label>
          <input
            className="input mt-2 mb-4"
            type="number"
            min="0"
            value={anticipo}
            onChange={(e) => setAnticipo(e.target.value)}
          />

          <div className="bg-purple-600/20 text-purple-300 rounded-xl p-4 mb-4">
            <p className="text-sm">Saldo pendiente</p>
            <p className="text-3xl font-bold">
              ${saldo.toLocaleString("es-MX")}
            </p>
          </div>

          <p
            className={`font-bold mb-4 ${
              estadoPago === "Liquidado"
                ? "text-green-400"
                : "text-yellow-400"
            }`}
          >
            {estadoPago}
          </p>

          <button
            type="button"
            onClick={marcarLiquidado}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
          >
            ✅ Marcar como liquidado
          </button>
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
        {guardando ? "Guardando..." : "💜 Guardar cambios de producción"}
      </button>
    </div>
  );
}

export default DetalleProyecto;