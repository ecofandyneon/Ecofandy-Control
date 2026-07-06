import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { db } from "../Services/firebase";
import Swal from "sweetalert2";

function DetalleProyecto() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);

  const [cliente, setCliente] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [estado, setEstado] = useState("Diseño / Render");
  const [subtotal, setSubtotal] = useState("");
  const [requiereFactura, setRequiereFactura] = useState(false);
  const [anticipo, setAnticipo] = useState("");
  const [estadoPago, setEstadoPago] = useState("Cotización pendiente");

  const [fechaEntrega, setFechaEntrega] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("Recoge en taller");
  const [notas, setNotas] = useState("");

  const [promptRender, setPromptRender] = useState("");
  const [urlRender, setUrlRender] = useState("");
  const [archivoVector, setArchivoVector] = useState("");
  const [medidasFinales, setMedidasFinales] = useState("");
  const [metrosNeon, setMetrosNeon] = useState("");
  const [materialesEstimados, setMaterialesEstimados] = useState("");
  const [costoEstimado, setCostoEstimado] = useState("");
  const [utilidadPorcentaje, setUtilidadPorcentaje] = useState("60");
  const [observacionesDiseno, setObservacionesDiseno] = useState("");

  const precioSugerido =
    Number(costoEstimado || 0) +
    Number(costoEstimado || 0) * (Number(utilidadPorcentaje || 0) / 100);

  const iva = requiereFactura ? Number(subtotal || 0) * 0.16 : 0;
  const total = Number(subtotal || 0) + iva;
  const saldo = total - Number(anticipo || 0);

  useEffect(() => {
    const cargarProyecto = async () => {
      const docRef = doc(db, "proyectos", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };

        setProyecto(data);
        setCliente(data.cliente || "");
        setWhatsapp(data.whatsapp || "");
        setNombreProyecto(data.proyecto || "");
        setDescripcion(data.descripcion || "");
        setEstado(data.estado || "Diseño / Render");

        setSubtotal(data.subtotal ?? data.precio ?? "");
        setRequiereFactura(data.requiereFactura || false);
        setAnticipo(data.anticipo || "");
        setEstadoPago(data.estadoPago || "Cotización pendiente");

        setFechaEntrega(data.fechaEntrega || "");
        setTipoEntrega(data.tipoEntrega || "Recoge en taller");
        setNotas(data.notas || "");

        setPromptRender(data.promptRender || "");
        setUrlRender(data.urlRender || "");
        setArchivoVector(data.archivoVector || "");
        setMedidasFinales(data.medidasFinales || "");
        setMetrosNeon(data.metrosNeon || "");
        setMaterialesEstimados(data.materialesEstimados || "");
        setCostoEstimado(data.costoEstimado || "");
        setUtilidadPorcentaje(data.utilidadPorcentaje || "60");
        setObservacionesDiseno(data.observacionesDiseno || "");
      }
    };

    cargarProyecto();
  }, [id]);

  const aplicarPrecioSugerido = () => {
    setSubtotal(Math.round(precioSugerido));
  };

  const generarRenderIA = () => {
    Swal.fire({
      icon: "info",
      title: "Render con IA",
      text: "Esta sección ya quedó preparada. Después conectaremos la IA de forma segura con Firebase Functions.",
      confirmButtonColor: "#7C3AED",
    });
  };

  const guardarCambios = async () => {
    try {
      await updateDoc(doc(db, "proyectos", id), {
        cliente,
        whatsapp,
        proyecto: nombreProyecto,
        descripcion,
        estado,

        promptRender,
        urlRender,
        archivoVector,
        medidasFinales,
        metrosNeon,
        materialesEstimados,
        costoEstimado: Number(costoEstimado || 0),
        utilidadPorcentaje: Number(utilidadPorcentaje || 0),
        precioSugerido: Math.round(precioSugerido),
        observacionesDiseno,

        subtotal: Number(subtotal || 0),
        requiereFactura,
        iva,
        total,
        precio: total,
        anticipo: Number(anticipo || 0),
        saldo,
        estadoPago:
          total <= 0
            ? "Cotización pendiente"
            : saldo <= 0
            ? "Liquidado"
            : estadoPago,

        fechaEntrega,
        tipoEntrega,
        notas,
      });

      Swal.fire({
        icon: "success",
        title: "Proyecto actualizado",
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
    }
  };

  const marcarLiquidado = () => {
    setAnticipo(total);
    setEstadoPago("Liquidado");
  };

  if (!proyecto) {
    return <p className="text-zinc-400">Cargando proyecto...</p>;
  }

  return (
    <div>
      <Link to="/proyectos" className="text-purple-400 hover:text-purple-300">
        ← Volver a proyectos
      </Link>

      <div className="flex justify-between items-start mt-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-purple-500">
            {proyecto.codigo || "Sin código"}
          </h1>
          <p className="text-zinc-400 mt-2">Centro del proyecto</p>
        </div>

        <span className="bg-purple-600/20 text-purple-300 px-4 py-2 rounded-full">
          {estado}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            Información
          </h2>

          <input
            className="input mb-4"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Cliente"
          />

          <input
            className="input mb-4"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="WhatsApp"
          />

          <input
            className="input mb-4"
            value={nombreProyecto}
            onChange={(e) => setNombreProyecto(e.target.value)}
            placeholder="Nombre del trabajo"
          />
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            🎨 Diseño, Render, Vector y Cotización
          </h2>

          <label className="text-zinc-400 text-sm">Prompt para render con IA</label>
          <textarea
            className="input min-h-24 mt-2 mb-4"
            value={promptRender}
            onChange={(e) => setPromptRender(e.target.value)}
            placeholder="Ej. Render de letrero neón cálido sobre acrílico transparente..."
          />

          <button
            type="button"
            onClick={generarRenderIA}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl mb-4"
          >
            ✨ Generar render con IA
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-sm">URL o nombre del render</label>
              <input
                className="input mt-2"
                value={urlRender}
                onChange={(e) => setUrlRender(e.target.value)}
                placeholder="Render aprobado / enlace / archivo"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-sm">Archivo vector</label>
              <input
                className="input mt-2"
                value={archivoVector}
                onChange={(e) => setArchivoVector(e.target.value)}
                placeholder="CDR, SVG, AI, DXF..."
              />
            </div>

            <div>
              <label className="text-zinc-400 text-sm">Medidas finales</label>
              <input
                className="input mt-2"
                value={medidasFinales}
                onChange={(e) => setMedidasFinales(e.target.value)}
                placeholder="Ej. 120 x 60 cm"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-sm">Metros estimados de neón</label>
              <input
                className="input mt-2"
                type="number"
                value={metrosNeon}
                onChange={(e) => setMetrosNeon(e.target.value)}
                placeholder="Ej. 8.5"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-sm">
                Costo estimado de materiales
              </label>
              <input
                className="input mt-2"
                type="number"
                value={costoEstimado}
                onChange={(e) => setCostoEstimado(e.target.value)}
                placeholder="Ej. 1500"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-sm">Utilidad %</label>
              <input
                className="input mt-2"
                type="number"
                value={utilidadPorcentaje}
                onChange={(e) => setUtilidadPorcentaje(e.target.value)}
                placeholder="Ej. 60"
              />
            </div>
          </div>

          <textarea
            className="input min-h-28 mt-4"
            value={materialesEstimados}
            onChange={(e) => setMaterialesEstimados(e.target.value)}
            placeholder="Materiales estimados: neón, acrílico, fuente, vinil, aluminio, etc."
          />

          <textarea
            className="input min-h-28 mt-4"
            value={observacionesDiseno}
            onChange={(e) => setObservacionesDiseno(e.target.value)}
            placeholder="Observaciones del render, vector o diseño aprobado."
          />

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mt-4">
            <p className="text-zinc-400 text-sm">Precio sugerido</p>
            <p className="text-3xl font-bold text-green-400">
              ${Math.round(precioSugerido).toLocaleString("es-MX")}
            </p>

            <button
              type="button"
              onClick={aplicarPrecioSugerido}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl"
            >
              Aplicar como subtotal
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            Finanzas
          </h2>

          <label className="text-zinc-400 text-sm">Subtotal</label>
          <input
            className="input mt-2 mb-4"
            type="number"
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value)}
          />

          <label className="flex items-center gap-3 text-zinc-300 font-semibold bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-4">
            <input
              type="checkbox"
              checked={requiereFactura}
              onChange={(e) => setRequiereFactura(e.target.checked)}
            />
            Requiere factura (+16% IVA)
          </label>

          <div className="bg-zinc-950 rounded-xl p-4 space-y-2 border border-zinc-800 mb-4">
            <div className="flex justify-between">
              <span className="text-zinc-400">IVA</span>
              <strong>${iva.toLocaleString("es-MX")}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">Total</span>
              <strong className="text-green-400">
                ${total.toLocaleString("es-MX")}
              </strong>
            </div>
          </div>

          <label className="text-zinc-400 text-sm">Anticipo / Pagado</label>
          <input
            className="input mt-2 mb-4"
            type="number"
            value={anticipo}
            onChange={(e) => setAnticipo(e.target.value)}
          />

          <div className="bg-purple-600/20 text-purple-300 rounded-xl p-4 mb-4">
            <p className="text-sm">Saldo pendiente</p>
            <p className="text-3xl font-bold">
              ${Math.max(saldo, 0).toLocaleString("es-MX")}
            </p>
          </div>

          <p
            className={`font-bold mb-4 ${
              saldo <= 0 && total > 0 ? "text-green-400" : "text-yellow-400"
            }`}
          >
            {total <= 0
              ? "Cotización pendiente"
              : saldo <= 0
              ? "Liquidado"
              : estadoPago}
          </p>

          <button
            type="button"
            onClick={marcarLiquidado}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
          >
            ✅ Marcar como liquidado
          </button>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            Producción y entrega
          </h2>

          <select
            className="input mb-4"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option>Idea recibida</option>
            <option>Diseño / Render</option>
            <option>Aprobado</option>
            <option>Corte</option>
            <option>Armado LED</option>
            <option>Pruebas</option>
            <option>Finalizado</option>
            <option>Empaque</option>
            <option>Entregado</option>
            <option>Liquidado</option>
          </select>

          <input
            className="input mb-4"
            type="date"
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.target.value)}
          />

          <select
            className="input"
            value={tipoEntrega}
            onChange={(e) => setTipoEntrega(e.target.value)}
          >
            <option>Recoge en taller</option>
            <option>Entrega local</option>
            <option>Envío</option>
            <option>Instalación</option>
          </select>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            Descripción
          </h2>

          <textarea
            className="input min-h-32"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            Notas internas
          </h2>

          <textarea
            className="input min-h-32"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={guardarCambios}
        className="mt-8 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl"
      >
        💜 Guardar cambios
      </button>
    </div>
  );
}

export default DetalleProyecto;