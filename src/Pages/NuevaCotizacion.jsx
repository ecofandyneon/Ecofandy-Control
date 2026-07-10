import { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";
import Swal from "sweetalert2";

import { db } from "../Services/firebase";
import { subirArchivo } from "../Services/storageService";

import ClienteSelector from "../Components/Clientes/ClienteSelector";
import ModalAgregarMaterial from "../Components/Proyecto/ModalAgregarMaterial";
import ListaMaterialesProyecto from "../Components/Proyecto/ListaMaterialesProyecto";
import ResumenCostos from "../Components/Proyecto/ResumenCostos";
import EcoButton from "../Components/NeonUI/EcoButton";

function SeccionPlegable({
  titulo,
  icono,
  abierta,
  onCambiar,
  children,
}) {
  return (
    <section className="bg-zinc-900 border border-purple-700/40 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={onCambiar}
        className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-zinc-800/60 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icono}</span>

          <h2 className="text-xl font-bold text-purple-400">
            {titulo}
          </h2>
        </div>

        <span className="text-zinc-400 text-xl">
          {abierta ? "▲" : "▼"}
        </span>
      </button>

      {abierta && (
        <div className="border-t border-zinc-800 p-6">
          {children}
        </div>
      )}
    </section>
  );
}

function NuevaCotizacion() {
  const [cliente, setCliente] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState("");
  const [renderSeleccionado, setRenderSeleccionado] = useState(null);

  const [modalMaterial, setModalMaterial] = useState(false);
  const [materiales, setMateriales] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const [secciones, setSecciones] = useState({
    cliente: true,
    imagen: true,
    materiales: true,
    costos: true,
  });

  const [form, setForm] = useState({
    nombreProyecto: "",
    tipo: "Neón LED",
    ancho: "",
    alto: "",
    margen: 2,
    manoObra: "",
    utilidad: 60,
    descuento: 0,
  });

  const actualizar = (e) => {
    const { name, value } = e.target;

    setForm((formActual) => ({
      ...formActual,
      [name]: value,
    }));
  };

  const alternarSeccion = (nombre) => {
    setSecciones((actuales) => ({
      ...actuales,
      [nombre]: !actuales[nombre],
    }));
  };

  const seleccionarImagen = (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImagen(archivo);
    setPreview(URL.createObjectURL(archivo));
  };

  const quitarImagen = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImagen(null);
    setPreview("");
  };

  const generarRenders = () => {
    if (!imagen) {
      Swal.fire({
        icon: "warning",
        title: "Falta la imagen",
        text: "Primero selecciona la imagen enviada por el cliente.",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    Swal.fire({
      icon: "info",
      title: "Render IA preparado",
      text: "Aquí conectaremos la generación real de dos o tres propuestas.",
      confirmButtonColor: "#7C3AED",
    });
  };

  const generarSVG = () => {
    if (!renderSeleccionado) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona un render",
        text: "Primero marca la propuesta aprobada por el cliente.",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    Swal.fire({
      icon: "info",
      title: "SVG preparado",
      text: "Aquí conectaremos la generación real del archivo vectorial.",
      confirmButtonColor: "#7C3AED",
    });
  };

  const agregarMaterial = (material) => {
    setMateriales((actuales) => [...actuales, material]);
  };

  const eliminarMaterial = (index) => {
    setMateriales((actuales) =>
      actuales.filter((_, posicion) => posicion !== index)
    );
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

  const ancho = Number(form.ancho || 0);
  const alto = Number(form.alto || 0);
  const margen = Number(form.margen || 0);

  const anchoUtil = Math.max(ancho - margen * 2, 0);
  const altoUtil = Math.max(alto - margen * 2, 0);

  const guardarProyecto = async () => {
    if (!cliente?.id) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona un cliente",
        text: "El proyecto debe quedar ligado a un cliente.",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    if (!form.nombreProyecto.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Falta el nombre",
        text: "Escribe un nombre para identificar el proyecto.",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    if (ancho <= 0 || alto <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Revisa las medidas",
        text: "El ancho y el alto deben ser mayores que cero.",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    setGuardando(true);

    try {
      const conteo = await getCountFromServer(
        collection(db, "cotizaciones")
      );

      const numero = conteo.data().count + 1;
      const folio = `COT-${String(numero).padStart(4, "0")}`;

      // Subir la imagen real a Firebase Storage.
      let imagenGuardada = null;

      if (imagen) {
        imagenGuardada = await subirArchivo(
          imagen,
          `expedientes/${folio}/imagen-cliente`
        );
      }

      const archivoImagen = imagenGuardada
        ? {
            id: `imagen-cliente-${Date.now()}`,
            nombre: imagenGuardada.nombre,
            nombreOriginal: imagen.name,
            url: imagenGuardada.url,
            tipo: imagen.type || "image/jpeg",
            tamaño: Number(imagen.size || 0),
            categoria: "imagen-cliente",
            subidoEn: new Date().toISOString(),
          }
        : null;

      const documento = await addDoc(
        collection(db, "cotizaciones"),
        {
          folio,

          clienteId: cliente.id,
          clienteNombre: cliente.nombre || "",
          whatsapp: cliente.whatsapp || "",
          correo: cliente.correo || "",

          nombreProyecto: form.nombreProyecto.trim(),
          tipo: form.tipo,
          estado: "Idea recibida",

          medidas: {
            ancho,
            alto,
            margen,
            anchoUtil,
            altoUtil,
          },

          imagenNombre: imagen?.name || "",
          imagenUrl: imagenGuardada?.url || "",
          imagenStorageNombre: imagenGuardada?.nombre || "",

          renderSeleccionado,
          renders: [],
          svg: null,

          archivos: archivoImagen ? [archivoImagen] : [],

          materiales,
          totalMateriales,

          manoObra,
          utilidadPorcentaje: utilidad,
          ganancia,
          precioVenta,
          descuento,
          precioFinal,

          observaciones: "",

          bitacora: [
            {
              accion: "Proyecto creado",
              fecha: new Date().toISOString(),
            },
            ...(archivoImagen
              ? [
                  {
                    accion: "Imagen del cliente agregada",
                    fecha: new Date().toISOString(),
                  },
                ]
              : []),
          ],

          creadoEn: serverTimestamp(),
          actualizadoEn: serverTimestamp(),
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Proyecto guardado",
        html: `
          <p>Se creó correctamente el expediente:</p>
          <strong>${folio}</strong>
          ${
            imagenGuardada
              ? "<p style='margin-top:8px'>La imagen quedó guardada en Firebase.</p>"
              : ""
          }
        `,
        confirmButtonColor: "#7C3AED",
      });

      console.log("Proyecto creado:", documento.id);
    } catch (error) {
      console.error("Error guardando proyecto:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text:
          error?.code === "storage/unauthorized"
            ? "Firebase Storage bloqueó la subida. Revisa las reglas de Storage."
            : "Revisa la conexión y vuelve a intentarlo.",
        confirmButtonColor: "#7C3AED",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-purple-500">
          ✨ Nuevo Proyecto
        </h1>

        <p className="text-zinc-400 mt-2">
          Un solo registro para diseño, materiales, costos, expediente y
          producción.
        </p>
      </div>

      <div className="space-y-6">
        <SeccionPlegable
          titulo="Cliente y datos del proyecto"
          icono="👤"
          abierta={secciones.cliente}
          onCambiar={() => alternarSeccion("cliente")}
        >
          <div className="space-y-5">
            <ClienteSelector onSelect={setCliente} />

            {cliente && (
              <div className="bg-zinc-950 border border-purple-700/40 rounded-xl p-4">
                <p className="text-sm text-zinc-500">
                  Cliente seleccionado
                </p>

                <p className="font-bold text-white text-lg mt-1">
                  {cliente.nombre}
                </p>

                <p className="text-zinc-400 text-sm">
                  📱 {cliente.whatsapp || "Sin WhatsApp"}
                </p>

                <p className="text-zinc-500 text-sm">
                  📧 {cliente.correo || "Sin correo"}
                </p>
              </div>
            )}

            <input
              className="input"
              name="nombreProyecto"
              value={form.nombreProyecto}
              onChange={actualizar}
              placeholder="Nombre del proyecto. Ej. Letrero Bella Lashes"
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <option>Señalética</option>
                <option>Otro</option>
              </select>

              <input
                className="input"
                name="ancho"
                type="number"
                min="0"
                step="0.1"
                value={form.ancho}
                onChange={actualizar}
                placeholder="Ancho cm"
              />

              <input
                className="input"
                name="alto"
                type="number"
                min="0"
                step="0.1"
                value={form.alto}
                onChange={actualizar}
                placeholder="Alto cm"
              />

              <input
                className="input"
                name="margen"
                type="number"
                min="0"
                step="0.1"
                value={form.margen}
                onChange={actualizar}
                placeholder="Margen cm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <p className="text-zinc-500 text-sm">
                  Medida final del letrero
                </p>

                <p className="text-2xl font-bold text-white mt-1">
                  {ancho} × {alto} cm
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <p className="text-zinc-500 text-sm">
                  Área útil con margen interior
                </p>

                <p className="text-2xl font-bold text-purple-300 mt-1">
                  {anchoUtil} × {altoUtil} cm
                </p>

                <p className="text-zinc-500 text-xs mt-1">
                  Margen de {margen} cm por cada lado
                </p>
              </div>
            </div>
          </div>
        </SeccionPlegable>

        <SeccionPlegable
          titulo="Imagen, renders y SVG"
          icono="🎨"
          abierta={secciones.imagen}
          onCambiar={() => alternarSeccion("imagen")}
        >
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              {!preview ? (
                <label className="border-2 border-dashed border-zinc-700 hover:border-purple-500 bg-zinc-950 rounded-2xl p-10 text-center block cursor-pointer transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={seleccionarImagen}
                    className="hidden"
                  />

                  <div className="text-5xl mb-3">📷</div>

                  <p className="font-bold text-zinc-300">
                    Subir imagen enviada por el cliente
                  </p>

                  <p className="text-zinc-500 text-sm mt-2">
                    JPG, PNG, WEBP u otra imagen compatible
                  </p>
                </label>
              ) : (
                <div>
                  <img
                    src={preview}
                    alt="Referencia enviada por el cliente"
                    className="w-full max-h-96 object-contain rounded-xl border border-zinc-800 bg-zinc-950"
                  />

                  <p className="text-zinc-500 text-sm mt-3">
                    {imagen?.name}
                  </p>

                  <button
                    type="button"
                    onClick={quitarImagen}
                    className="text-red-400 hover:text-red-300 font-bold mt-2"
                  >
                    🗑 Quitar imagen
                  </button>
                </div>
              )}

              <EcoButton
                type="button"
                className="w-full mt-5"
                onClick={generarRenders}
              >
                🎨 Generar 2 o 3 renders
              </EcoButton>
            </div>

            <div>
              <h3 className="font-bold text-purple-300 mb-3">
                Propuestas de render
              </h3>

              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRenderSeleccionado(item)}
                    className={`w-full rounded-xl p-4 border text-left transition ${
                      renderSeleccionado === item
                        ? "border-purple-500 bg-purple-600/20"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                    }`}
                  >
                    <p className="font-bold">
                      Render propuesta {item}
                    </p>

                    <p className="text-zinc-500 text-sm mt-1">
                      {renderSeleccionado === item
                        ? "✅ Seleccionado"
                        : "Pendiente de generar"}
                    </p>
                  </button>
                ))}
              </div>

              <EcoButton
                type="button"
                className="w-full mt-5"
                onClick={generarSVG}
              >
                ✏️ Generar SVG
              </EcoButton>
            </div>
          </div>
        </SeccionPlegable>

        <SeccionPlegable
          titulo="Materiales del proyecto"
          icono="📦"
          abierta={secciones.materiales}
          onCambiar={() => alternarSeccion("materiales")}
        >
          <div className="space-y-5">
            <EcoButton
              type="button"
              className="w-full md:w-auto"
              onClick={() => setModalMaterial(true)}
            >
              ➕ Agregar material
            </EcoButton>

            <ListaMaterialesProyecto
              materiales={materiales}
              onEliminar={eliminarMaterial}
            />
          </div>
        </SeccionPlegable>

        <SeccionPlegable
          titulo="Costos y precio final"
          icono="💰"
          abierta={secciones.costos}
          onCambiar={() => alternarSeccion("costos")}
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-zinc-400 text-sm">
                  Mano de obra / fabricación
                </label>

                <input
                  className="input mt-2"
                  name="manoObra"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.manoObra}
                  onChange={actualizar}
                  placeholder="Ej. 800"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-sm">
                  Utilidad sobre materiales %
                </label>

                <input
                  className="input mt-2"
                  name="utilidad"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.utilidad}
                  onChange={actualizar}
                  placeholder="Ej. 60"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-sm">
                  Descuento manual autorizado
                </label>

                <input
                  className="input mt-2"
                  name="descuento"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.descuento}
                  onChange={actualizar}
                  placeholder="Ej. 250"
                />
              </div>

              <EcoButton
                type="button"
                className="w-full"
                disabled={guardando}
                onClick={guardarProyecto}
              >
                {guardando
                  ? "Guardando proyecto e imagen..."
                  : "💾 Crear Proyecto"}
              </EcoButton>
            </div>

            <ResumenCostos
              materiales={materiales}
              manoObra={manoObra}
              utilidad={utilidad}
              descuento={descuento}
            />
          </div>
        </SeccionPlegable>
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