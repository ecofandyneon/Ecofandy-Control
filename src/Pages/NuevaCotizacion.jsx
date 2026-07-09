import { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../Services/firebase";

import ClienteSelector from "../Components/Clientes/ClienteSelector";
import ModalAgregarMaterial from "../Components/Proyecto/ModalAgregarMaterial";
import ListaMaterialesProyecto from "../Components/Proyecto/ListaMaterialesProyecto";
import ResumenCostos from "../Components/Proyecto/ResumenCostos";
import EcoButton from "../Components/NeonUI/EcoButton";
import Swal from "sweetalert2";

function NuevaCotizacion() {
  const [cliente, setCliente] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState("");
  const [renderSeleccionado, setRenderSeleccionado] = useState(null);
  const [modalMaterial, setModalMaterial] = useState(false);
  const [materiales, setMateriales] = useState([]);

  const [form, setForm] = useState({
  nombreProyecto: "",
  tipo: "Neón LED",
  ancho: "",
  alto: "",
  manoObra: "",
  utilidad: 60,
  descuento: 0,
  });

  const actualizar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const seleccionarImagen = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setImagen(archivo);
    setPreview(URL.createObjectURL(archivo));
  };

  const generarRenders = () => {
    Swal.fire({
      icon: "info",
      title: "Render AI preparado",
      text: "Aquí conectaremos la IA para generar 2 o 3 renders.",
      confirmButtonColor: "#7C3AED",
    });
  };

  const generarSVG = () => {
    Swal.fire({
      icon: "info",
      title: "Vector SVG preparado",
      text: "Aquí conectaremos la generación del SVG.",
      confirmButtonColor: "#7C3AED",
    });
  };

  const agregarMaterial = (material) => {
    setMateriales([...materiales, material]);
  };

  const eliminarMaterial = (index) => {
    setMateriales(materiales.filter((_, i) => i !== index));
  };

  const totalMateriales = materiales.reduce(
    (suma, material) => suma + Number(material.total || 0),
    0
  );

  const manoObra = Number(form.manoObra || 0);
  const utilidad = Number(form.utilidad || 0);
  const descuento = Number(form.descuento || 0);

  const ganancia = totalMateriales * (utilidad / 100);

  const precioVenta = totalMateriales + ganancia + manoObra;
  const precioFinal = Math.max(precioVenta - descuento, 0);

  const guardarCotizacion = async () => {
    if (!cliente?.id) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona un cliente",
        text: "La cotización debe estar ligada a un cliente.",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    if (!form.nombreProyecto.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Falta nombre del proyecto",
        text: "Escribe un nombre para identificar la cotización.",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    try {
      const snapshot = await getCountFromServer(collection(db, "cotizaciones"));
      const folio = `COT-${String(snapshot.data().count + 1).padStart(4, "0")}`;

      await addDoc(collection(db, "cotizaciones"), {
        folio,
        clienteId: cliente.id,
        clienteNombre: cliente.nombre || "",
        whatsapp: cliente.whatsapp || "",
        correo: cliente.correo || "",

        nombreProyecto: form.nombreProyecto,
        tipo: form.tipo,
        estado: "Cotización",

        medidas: {
          ancho: Number(form.ancho || 0),
          alto: Number(form.alto || 0),
        },

        imagenNombre: imagen?.name || "",
        renderSeleccionado,

        materiales,
        totalMateriales,
        manoObra,
        utilidadPorcentaje: utilidad,
        ganancia,
        precioVenta,
        descuento,
        ganancia,
        precioVenta,
        precioFinal,

        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      });

      Swal.fire({
        icon: "success",
        title: "Cotización guardada",
        text: `Se guardó como ${folio}`,
        confirmButtonColor: "#7C3AED",
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar la cotización.",
        confirmButtonColor: "#7C3AED",
      });
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500">
        ✨ Nueva Cotización
      </h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Primero genera el render, después materiales, costos y cotización.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            👤 Cliente y proyecto
          </h2>

          <div className="space-y-4">
            <ClienteSelector onSelect={setCliente} />

            {cliente && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <p className="font-bold text-white">{cliente.nombre}</p>
                <p className="text-zinc-400 text-sm">
                  {cliente.whatsapp || "Sin WhatsApp"}
                </p>
              </div>
            )}

            <input
              className="input"
              name="nombreProyecto"
              value={form.nombreProyecto}
              onChange={actualizar}
              placeholder="Nombre del proyecto"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="input"
                name="tipo"
                value={form.tipo}
                onChange={actualizar}
              >
                <option>Neón LED</option>
                <option>Letras Corpóreas</option>
                <option>Caja de Luz</option>
                <option>Glorificador</option>
              </select>

              <input
                className="input"
                name="ancho"
                type="number"
                value={form.ancho}
                onChange={actualizar}
                placeholder="Ancho cm"
              />

              <input
                className="input"
                name="alto"
                type="number"
                value={form.alto}
                onChange={actualizar}
                placeholder="Alto cm"
              />
            </div>
          </div>
        </div>

        <ResumenCostos
          materiales={materiales}
          manoObra={manoObra}
          utilidad={utilidad}
          descuento={descuento}
        />

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            📷 Imagen del cliente
          </h2>

          {!preview ? (
            <label className="border-2 border-dashed border-zinc-700 rounded-xl p-10 text-center block cursor-pointer hover:border-purple-500">
              <input
                type="file"
                accept="image/*"
                onChange={seleccionarImagen}
                className="hidden"
              />
              <div className="text-5xl mb-3">📷</div>
              <p className="font-bold text-zinc-300">
                Subir imagen del cliente
              </p>
            </label>
          ) : (
            <img
              src={preview}
              alt="Imagen del cliente"
              className="w-full max-h-96 object-contain rounded-xl border border-zinc-800 bg-zinc-950"
            />
          )}

          <EcoButton type="button" className="w-full mt-5" onClick={generarRenders}>
            🎨 Generar 2 o 3 renders
          </EcoButton>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            🖼 Renders
          </h2>

          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRenderSeleccionado(item)}
                className={`w-full rounded-xl p-4 border text-left ${
                  renderSeleccionado === item
                    ? "border-purple-500 bg-purple-600/20"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                Render propuesta {item}
              </button>
            ))}
          </div>

          <EcoButton type="button" className="w-full mt-5" onClick={generarSVG}>
            ✏️ Generar SVG
          </EcoButton>
        </div>

        <ListaMaterialesProyecto
          materiales={materiales}
          onEliminar={eliminarMaterial}
        />

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            👨‍🏭 Mano de obra y utilidad
          </h2>

          <div className="space-y-4">
            <input
              className="input"
              name="manoObra"
              type="number"
              value={form.manoObra}
              onChange={actualizar}
              placeholder="Mano de obra"
            />

            <input
              className="input"
              name="utilidad"
              type="number"
              value={form.utilidad}
              onChange={actualizar}
              placeholder="Utilidad %"
              />

            <input
              className="input"
              name="descuento"
              type="number"
              value={form.descuento}
              onChange={actualizar}
              placeholder="Descuento"
            />

            <EcoButton
              type="button"
              className="w-full"
              onClick={() => setModalMaterial(true)}
            >
              ➕ Agregar Material
            </EcoButton>

            <EcoButton
              type="button"
              className="w-full"
              onClick={guardarCotizacion}
            >
              💾 Guardar Cotización
            </EcoButton>
          </div>
        </div>
      </div>

      <ModalAgregarMaterial
        abierto={modalMaterial}
        onClose={() => setModalMaterial(false)}
        onAgregar={agregarMaterial}
      />
    </div>
  );
}

export default NuevaCotizacion;