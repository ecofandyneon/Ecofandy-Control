import { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

import { db } from "../Services/firebase";
import { subirArchivo } from "../Services/storageService";

import ClienteSelector from "../Components/Clientes/ClienteSelector";
import ModalAgregarMaterial from "../Components/Proyecto/ModalAgregarMaterial";
import ListaMaterialesProyecto from "../Components/Proyecto/ListaMaterialesProyecto";
import ResumenCostos from "../Components/Proyecto/ResumenCostos";
import EcoButton from "../Components/NeonUI/EcoButton";

function SeccionPlegable({ titulo, icono, abierta, onCambiar, children }) {
  return (
    <section className="bg-zinc-900 border border-purple-700/40 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={onCambiar}
        className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-zinc-800/60 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icono}</span>
          <h2 className="text-xl font-bold text-purple-400">{titulo}</h2>
        </div>
        <span className="text-zinc-400 text-xl">{abierta ? "▲" : "▼"}</span>
      </button>
      {abierta && <div className="border-t border-zinc-800 p-6">{children}</div>}
    </section>
  );
}

function crearSeleccion(archivo) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    archivo,
    preview: archivo.type.startsWith("image/")
      ? URL.createObjectURL(archivo)
      : "",
  };
}

function crearSeleccionGuardada(archivo) {
  return {
    id: archivo.id || `${archivo.categoria}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    archivo: {
      name: archivo.nombreOriginal || archivo.nombre || "archivo",
      type: archivo.tipo || "application/octet-stream",
      size: Number(archivo.tamaño || 0),
    },
    preview: String(archivo.tipo || "").startsWith("image/") ? archivo.url : "",
    esGuardado: true,
    datosGuardados: archivo,
  };
}

function ZonaArchivo({
  titulo,
  descripcion,
  seleccion,
  accept = "image/*",
  multiple = false,
  onSeleccionar,
  onQuitar,
  inputRef,
  children,
}) {
  const recibirArchivos = (lista) => {
    const archivos = Array.from(lista || []);
    if (archivos.length > 0) onSeleccionar(archivos);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="font-bold text-white">{titulo}</h3>
        <p className="text-zinc-500 text-sm mt-1">{descripcion}</p>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          recibirArchivos(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-zinc-700 hover:border-purple-500 rounded-xl p-6 text-center transition"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => recibirArchivos(e.target.files)}
        />
        <div className="text-4xl mb-3">📁</div>
        <p className="text-zinc-300 font-semibold">
          Arrastra aquí o elige desde tu dispositivo
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-xl"
        >
          Elegir archivo{multiple ? "s" : ""}
        </button>
      </div>

      {children}

      {Array.isArray(seleccion) && seleccion.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {seleccion.map((item, index) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              {item.preview ? (
                <img
                  src={item.preview}
                  alt={item.archivo.name}
                  className="w-full h-36 object-contain rounded-lg bg-black"
                />
              ) : (
                <div className="h-36 flex items-center justify-center text-5xl">📄</div>
              )}
              <p className="text-zinc-400 text-sm mt-3 break-all">{item.archivo.name}</p>
              <button
                type="button"
                onClick={() => onQuitar(index)}
                className="text-red-400 hover:text-red-300 font-bold text-sm mt-2"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}

      {!Array.isArray(seleccion) && seleccion && (
        <div className="mt-5 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          {seleccion.preview ? (
            <img
              src={seleccion.preview}
              alt={seleccion.archivo.name}
              className="w-full max-h-72 object-contain rounded-lg bg-black"
            />
          ) : (
            <div className="h-36 flex items-center justify-center text-5xl">📄</div>
          )}
          <p className="text-zinc-400 text-sm mt-3 break-all">{seleccion.archivo.name}</p>
          <button
            type="button"
            onClick={onQuitar}
            className="text-red-400 hover:text-red-300 font-bold text-sm mt-2"
          >
            Quitar
          </button>
        </div>
      )}
    </div>
  );
}

function NuevaCotizacion() {
  const [searchParams] = useSearchParams();
  const proyectoEditarId = searchParams.get("editar");
  const modoEdicion = Boolean(proyectoEditarId);

  const inputImagenClienteRef = useRef(null);
  const inputCamaraRef = useRef(null);
  const inputRendersRef = useRef(null);
  const inputCorelRef = useRef(null);
  const inputSvgRef = useRef(null);

  const [cliente, setCliente] = useState(null);
  const [imagenCliente, setImagenCliente] = useState(null);
  const [renders, setRenders] = useState([]);
  const [renderAprobado, setRenderAprobado] = useState(null);
  const [imagenCorel, setImagenCorel] = useState(null);
  const [svgFinal, setSvgFinal] = useState(null);
  const [modalMaterial, setModalMaterial] = useState(false);
  const [materiales, setMateriales] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargandoProyecto, setCargandoProyecto] = useState(modoEdicion);
  const [proyectoOriginal, setProyectoOriginal] = useState(null);
  const [borradorListo, setBorradorListo] = useState(modoEdicion);
  const [borradorGuardadoEn, setBorradorGuardadoEn] = useState(null);

  const BORRADOR_KEY = "ecofandy-nuevo-proyecto-borrador";

  const [secciones, setSecciones] = useState({
    cliente: true,
    archivos: true,
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

  useEffect(() => {
    if (modoEdicion) {
      setBorradorListo(true);
      return;
    }

    try {
      const guardado = localStorage.getItem(BORRADOR_KEY);

      if (guardado) {
        const borrador = JSON.parse(guardado);

        setCliente(borrador.cliente || null);
        setForm((actual) => ({
          ...actual,
          ...(borrador.form || {}),
        }));
        setMateriales(
          Array.isArray(borrador.materiales) ? borrador.materiales : []
        );
        setSecciones((actuales) => ({
          ...actuales,
          ...(borrador.secciones || {}),
        }));
        setBorradorGuardadoEn(borrador.guardadoEn || null);
      }
    } catch (error) {
      console.error("No se pudo recuperar el borrador:", error);
    } finally {
      setBorradorListo(true);
    }
  }, [modoEdicion]);

  useEffect(() => {
    if (modoEdicion || !borradorListo) return;

    const tieneContenido =
      Boolean(cliente?.id) ||
      Boolean(form.nombreProyecto.trim()) ||
      Boolean(form.ancho) ||
      Boolean(form.alto) ||
      materiales.length > 0 ||
      Boolean(form.manoObra);

    if (!tieneContenido) return;

    const temporizador = setTimeout(() => {
      try {
        const guardadoEn = new Date().toISOString();

        localStorage.setItem(
          BORRADOR_KEY,
          JSON.stringify({
            cliente,
            form,
            materiales,
            secciones,
            guardadoEn,
          })
        );

        setBorradorGuardadoEn(guardadoEn);
      } catch (error) {
        console.error("No se pudo guardar el borrador:", error);
      }
    }, 400);

    return () => clearTimeout(temporizador);
  }, [
    modoEdicion,
    borradorListo,
    cliente,
    form,
    materiales,
    secciones,
  ]);

  const descartarBorrador = async () => {
    const resultado = await Swal.fire({
      icon: "warning",
      title: "¿Descartar borrador?",
      text: "Se borrarán los datos temporales de este nuevo proyecto.",
      showCancelButton: true,
      confirmButtonText: "Sí, descartar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#52525B",
    });

    if (!resultado.isConfirmed) return;

    localStorage.removeItem(BORRADOR_KEY);

    setCliente(null);
    setImagenCliente(null);
    setRenders([]);
    setRenderAprobado(null);
    setImagenCorel(null);
    setSvgFinal(null);
    setMateriales([]);
    setBorradorGuardadoEn(null);
    setForm({
      nombreProyecto: "",
      tipo: "Neón LED",
      ancho: "",
      alto: "",
      margen: 2,
      manoObra: "",
      utilidad: 60,
      descuento: 0,
    });

    await Swal.fire({
      icon: "success",
      title: "Borrador descartado",
      timer: 1200,
      showConfirmButton: false,
    });
  };

  useEffect(() => {
    const cargarProyecto = async () => {
      if (!proyectoEditarId) {
        setCargandoProyecto(false);
        return;
      }

      try {
        const referencia = doc(db, "cotizaciones", proyectoEditarId);
        const snapshot = await getDoc(referencia);

        if (!snapshot.exists()) {
          await Swal.fire({
            icon: "error",
            title: "Proyecto no encontrado",
            confirmButtonColor: "#7C3AED",
          });
          return;
        }

        const datos = {
          id: snapshot.id,
          ...snapshot.data(),
        };

        setProyectoOriginal(datos);

        setCliente({
          id: datos.clienteId,
          nombre: datos.clienteNombre || "",
          whatsapp: datos.whatsapp || "",
          correo: datos.correo || "",
        });

        setForm({
          nombreProyecto: datos.nombreProyecto || "",
          tipo: datos.tipo || "Neón LED",
          ancho: datos.medidas?.ancho ?? "",
          alto: datos.medidas?.alto ?? "",
          margen: datos.medidas?.margen ?? 2,
          manoObra: datos.manoObra ?? "",
          utilidad: datos.utilidadPorcentaje ?? 60,
          descuento: datos.descuento ?? 0,
        });

        setMateriales(Array.isArray(datos.materiales) ? datos.materiales : []);

        const archivos = Array.isArray(datos.archivos) ? datos.archivos : [];

        const imagenClienteGuardada = archivos.find(
          (archivo) => archivo.categoria === "imagen-cliente"
        );

        const rendersGuardados = archivos.filter(
          (archivo) =>
            archivo.categoria === "render-propuesto" ||
            archivo.categoria === "render-aprobado"
        );

        const imagenCorelGuardada = archivos.find(
          (archivo) => archivo.categoria === "imagen-vectorizable"
        );

        const svgGuardado = archivos.find(
          (archivo) => archivo.categoria === "svg-final"
        );

        setImagenCliente(
          imagenClienteGuardada
            ? crearSeleccionGuardada(imagenClienteGuardada)
            : null
        );

        const rendersPreparados = rendersGuardados.map(crearSeleccionGuardada);
        setRenders(rendersPreparados);

        const aprobado = rendersPreparados.find(
          (render) => render.datosGuardados?.categoria === "render-aprobado"
        );
        setRenderAprobado(aprobado?.id || null);

        setImagenCorel(
          imagenCorelGuardada
            ? crearSeleccionGuardada(imagenCorelGuardada)
            : null
        );

        setSvgFinal(
          svgGuardado ? crearSeleccionGuardada(svgGuardado) : null
        );
      } catch (error) {
        console.error("Error cargando proyecto:", error);

        await Swal.fire({
          icon: "error",
          title: "No se pudo cargar el proyecto",
          text: "Revisa tu conexión y vuelve a intentarlo.",
          confirmButtonColor: "#7C3AED",
        });
      } finally {
        setCargandoProyecto(false);
      }
    };

    cargarProyecto();
  }, [proyectoEditarId]);

  const actualizar = (e) => {
    const { name, value } = e.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  };

  const alternarSeccion = (nombre) => {
    setSecciones((actuales) => ({
      ...actuales,
      [nombre]: !actuales[nombre],
    }));
  };

  const seleccionarImagenCliente = (archivos) => {
    if (imagenCliente?.preview) URL.revokeObjectURL(imagenCliente.preview);
    setImagenCliente(crearSeleccion(archivos[0]));
  };

  const quitarImagenCliente = () => {
    if (imagenCliente?.preview) URL.revokeObjectURL(imagenCliente.preview);
    setImagenCliente(null);
  };

  const agregarRenders = (archivos) => {
    setRenders((actuales) => [...actuales, ...archivos.map(crearSeleccion)]);
  };

  const quitarRender = (index) => {
    setRenders((actuales) => {
      const copia = [...actuales];
      const eliminado = copia[index];
      if (eliminado?.preview) URL.revokeObjectURL(eliminado.preview);
      if (renderAprobado === eliminado?.id) setRenderAprobado(null);
      copia.splice(index, 1);
      return copia;
    });
  };

  const seleccionarImagenCorel = (archivos) => {
    if (imagenCorel?.preview) URL.revokeObjectURL(imagenCorel.preview);
    setImagenCorel(crearSeleccion(archivos[0]));
  };

  const seleccionarSvg = (archivos) => {
    setSvgFinal(crearSeleccion(archivos[0]));
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

  const subirSeleccion = async (seleccion, carpeta, categoria) => {
    if (!seleccion?.archivo) return null;

    if (seleccion.esGuardado && seleccion.datosGuardados) {
      return {
        ...seleccion.datosGuardados,
        categoria,
      };
    }

    const resultado = await subirArchivo(seleccion.archivo, carpeta);
    return {
      id: `${categoria}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      nombre: resultado.nombre,
      nombreOriginal: seleccion.archivo.name,
      url: resultado.url,
      tipo: seleccion.archivo.type || "application/octet-stream",
      tamaño: Number(seleccion.archivo.size || 0),
      categoria,
      subidoEn: new Date().toISOString(),
    };
  };

  const guardarProyecto = async () => {
    if (!cliente?.id) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona un cliente",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    if (!form.nombreProyecto.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Falta el nombre del proyecto",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    if (ancho <= 0 || alto <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Revisa las medidas",
        text: "Ancho y alto deben ser mayores que cero.",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    setGuardando(true);

    try {
      let folio = proyectoOriginal?.folio || "";

      if (!modoEdicion) {
        const conteo = await getCountFromServer(collection(db, "cotizaciones"));
        folio = `COT-${String(conteo.data().count + 1).padStart(4, "0")}`;
      }

      const archivosGuardados = [];

      const clienteGuardado = await subirSeleccion(
        imagenCliente,
        `expedientes/${folio}/imagen-cliente`,
        "imagen-cliente"
      );
      if (clienteGuardado) archivosGuardados.push(clienteGuardado);

      for (const render of renders) {
        const categoria =
          render.id === renderAprobado ? "render-aprobado" : "render-propuesto";
        const guardado = await subirSeleccion(
          render,
          `expedientes/${folio}/${categoria}`,
          categoria
        );
        if (guardado) archivosGuardados.push(guardado);
      }

      const corelGuardado = await subirSeleccion(
        imagenCorel,
        `expedientes/${folio}/imagen-vectorizable`,
        "imagen-vectorizable"
      );
      if (corelGuardado) archivosGuardados.push(corelGuardado);

      const svgGuardado = await subirSeleccion(
        svgFinal,
        `expedientes/${folio}/svg-final`,
        "svg-final"
      );
      if (svgGuardado) archivosGuardados.push(svgGuardado);

      const renderAprobadoGuardado = archivosGuardados.find(
        (archivo) => archivo.categoria === "render-aprobado"
      );

      const datosProyecto = {
        folio,
        clienteId: cliente.id,
        clienteNombre: cliente.nombre || "",
        whatsapp: cliente.whatsapp || "",
        correo: cliente.correo || "",
        nombreProyecto: form.nombreProyecto.trim(),
        tipo: form.tipo,
        estado: proyectoOriginal?.estado || "Idea recibida",
        medidas: { ancho, alto, margen, anchoUtil, altoUtil },
        imagenNombre: clienteGuardado?.nombreOriginal || "",
        imagenUrl: clienteGuardado?.url || "",
        renderSeleccionado: renderAprobadoGuardado?.nombreOriginal || null,
        renderAprobadoUrl: renderAprobadoGuardado?.url || "",
        imagenCorelUrl: corelGuardado?.url || "",
        svgFinalUrl: svgGuardado?.url || "",
        archivos: archivosGuardados,
        materiales,
        totalMateriales,
        manoObra,
        utilidadPorcentaje: utilidad,
        ganancia,
        precioVenta,
        descuento,
        precioFinal,
        observaciones: proyectoOriginal?.observaciones || "",
        bitacora: [
          ...(Array.isArray(proyectoOriginal?.bitacora)
            ? proyectoOriginal.bitacora
            : []),
          {
            accion: modoEdicion ? "Proyecto editado" : "Proyecto creado",
            fecha: new Date().toISOString(),
          },
        ],
        actualizadoEn: serverTimestamp(),
      };

      if (modoEdicion) {
        await updateDoc(
          doc(db, "cotizaciones", proyectoEditarId),
          datosProyecto
        );
      } else {
        await addDoc(collection(db, "cotizaciones"), {
          ...datosProyecto,
          creadoEn: serverTimestamp(),
        });
      }

      if (!modoEdicion) {
        localStorage.removeItem(BORRADOR_KEY);
        setBorradorGuardadoEn(null);
      }

      await Swal.fire({
        icon: "success",
        title: modoEdicion ? "Cambios guardados" : "Proyecto guardado",
        text: modoEdicion
          ? `Se actualizó el expediente ${folio}`
          : `Se creó el expediente ${folio}`,
        confirmButtonColor: "#7C3AED",
      });

      console.log(
        modoEdicion ? "Proyecto actualizado:" : "Proyecto creado:",
        proyectoEditarId || folio
      );
    } catch (error) {
      console.error("Error guardando proyecto:", error);
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text:
          error?.code === "storage/unauthorized"
            ? "Firebase Storage bloqueó la carga."
            : "Revisa tu conexión y vuelve a intentarlo.",
        confirmButtonColor: "#7C3AED",
      });
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoProyecto) {
    return (
      <div className="pb-10">
        <p className="text-zinc-400">Cargando proyecto...</p>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-purple-500">
          {modoEdicion ? "✏️ Editar Proyecto" : "✨ Nuevo Proyecto"}
        </h1>
        <p className="text-zinc-400 mt-2">
          Cliente, archivos, materiales, costos y expediente en un solo lugar.
        </p>
      </div>

      {!modoEdicion && (
        <div className="mb-6 bg-zinc-900 border border-purple-700/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-purple-300 font-bold">
              💾 Borrador automático activo
            </p>
            <p className="text-zinc-500 text-sm mt-1">
              {borradorGuardadoEn
                ? `Guardado temporalmente a las ${new Date(
                    borradorGuardadoEn
                  ).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Tus datos se guardarán automáticamente mientras trabajas."}
            </p>
            <p className="text-zinc-600 text-xs mt-1">
              Los archivos seleccionados todavía no se conservan al salir de esta pantalla.
            </p>
          </div>

          <button
            type="button"
            onClick={descartarBorrador}
            className="bg-zinc-800 hover:bg-red-600 text-zinc-300 hover:text-white font-bold px-4 py-2 rounded-xl transition"
          >
            🗑️ Descartar borrador
          </button>
        </div>
      )}

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
                <p className="text-sm text-zinc-500">Cliente seleccionado</p>
                <p className="font-bold text-white text-lg mt-1">{cliente.nombre}</p>
                <p className="text-zinc-400 text-sm">📱 {cliente.whatsapp || "Sin WhatsApp"}</p>
                <p className="text-zinc-500 text-sm">📧 {cliente.correo || "Sin correo"}</p>
              </div>
            )}

            <input
              className="input"
              name="nombreProyecto"
              value={form.nombreProyecto}
              onChange={actualizar}
              placeholder="Nombre del proyecto"
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select className="input" name="tipo" value={form.tipo} onChange={actualizar}>
                <option>Neón LED</option>
                <option>Letras Corpóreas</option>
                <option>Caja de Luz</option>
                <option>Glorificador</option>
                <option>Señalética</option>
                <option>Otro</option>
              </select>
              <input className="input" name="ancho" type="number" min="0" step="0.1" value={form.ancho} onChange={actualizar} placeholder="Ancho cm" />
              <input className="input" name="alto" type="number" min="0" step="0.1" value={form.alto} onChange={actualizar} placeholder="Alto cm" />
              <input className="input" name="margen" type="number" min="0" step="0.1" value={form.margen} onChange={actualizar} placeholder="Margen cm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <p className="text-zinc-500 text-sm">Medida final</p>
                <p className="text-2xl font-bold text-white mt-1">{ancho} × {alto} cm</p>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <p className="text-zinc-500 text-sm">Área útil</p>
                <p className="text-2xl font-bold text-purple-300 mt-1">{anchoUtil} × {altoUtil} cm</p>
              </div>
            </div>
          </div>
        </SeccionPlegable>

        <SeccionPlegable
          titulo="Archivos principales"
          icono="🎨"
          abierta={secciones.archivos}
          onCambiar={() => alternarSeccion("archivos")}
        >
          <div className="space-y-6">
            <ZonaArchivo
              titulo="📷 Imagen del cliente"
              descripcion="Desde celular puedes tomar foto o elegir de la galería. En computadora puedes arrastrar o seleccionar."
              seleccion={imagenCliente}
              onSeleccionar={seleccionarImagenCliente}
              onQuitar={quitarImagenCliente}
              inputRef={inputImagenClienteRef}
            >
              <input
                ref={inputCamaraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => seleccionarImagenCliente(Array.from(e.target.files || []))}
              />
              <button
                type="button"
                onClick={() => inputCamaraRef.current?.click()}
                className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-5 py-2 rounded-xl"
              >
                📷 Tomar foto
              </button>
            </ZonaArchivo>

            <ZonaArchivo
              titulo="🎨 Renders"
              descripcion="Sube uno o varios renders creados en ChatGPT y marca el aprobado."
              seleccion={renders}
              multiple
              onSeleccionar={agregarRenders}
              onQuitar={quitarRender}
              inputRef={inputRendersRef}
            />

            {renders.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                <h3 className="font-bold text-purple-300 mb-4">Selecciona el render aprobado</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renders.map((render) => (
                    <button
                      key={render.id}
                      type="button"
                      onClick={() => setRenderAprobado(render.id)}
                      className={`rounded-xl border p-3 text-left ${renderAprobado === render.id ? "border-green-500 bg-green-500/10" : "border-zinc-800 bg-zinc-900"}`}
                    >
                      <img src={render.preview} alt={render.archivo.name} className="w-full h-36 object-contain rounded-lg bg-black" />
                      <p className="text-sm text-zinc-300 mt-3 break-all">{render.archivo.name}</p>
                      <p className="text-sm font-bold mt-2">{renderAprobado === render.id ? "✅ Render aprobado" : "Marcar como aprobado"}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ZonaArchivo
              titulo="🖊 Imagen para Corel"
              descripcion="Sube la imagen limpia en líneas que usarás para vectorizar."
              seleccion={imagenCorel}
              onSeleccionar={seleccionarImagenCorel}
              onQuitar={() => setImagenCorel(null)}
              inputRef={inputCorelRef}
            />

            <ZonaArchivo
              titulo="📐 SVG final"
              descripcion="Sube el SVG terminado en Corel para conservarlo dentro del expediente."
              seleccion={svgFinal}
              accept=".svg,image/svg+xml"
              onSeleccionar={seleccionarSvg}
              onQuitar={() => setSvgFinal(null)}
              inputRef={inputSvgRef}
            />
          </div>
        </SeccionPlegable>

        <SeccionPlegable
          titulo="Materiales del proyecto"
          icono="📦"
          abierta={secciones.materiales}
          onCambiar={() => alternarSeccion("materiales")}
        >
          <div className="space-y-5">
            <EcoButton type="button" className="w-full md:w-auto" onClick={() => setModalMaterial(true)}>
              ➕ Agregar material
            </EcoButton>
            <ListaMaterialesProyecto materiales={materiales} onEliminar={eliminarMaterial} />
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
              <input className="input" name="manoObra" type="number" min="0" step="0.01" value={form.manoObra} onChange={actualizar} placeholder="Mano de obra" />
              <input className="input" name="utilidad" type="number" min="0" step="0.01" value={form.utilidad} onChange={actualizar} placeholder="Utilidad %" />
              <input className="input" name="descuento" type="number" min="0" step="0.01" value={form.descuento} onChange={actualizar} placeholder="Descuento" />
              <EcoButton type="button" className="w-full" disabled={guardando} onClick={guardarProyecto}>
                {guardando
                  ? modoEdicion
                    ? "Guardando cambios y archivos..."
                    : "Guardando proyecto y archivos..."
                  : modoEdicion
                    ? "💾 Guardar Cambios"
                    : "💾 Crear Proyecto"}
              </EcoButton>
            </div>
            <ResumenCostos materiales={materiales} manoObra={manoObra} utilidad={utilidad} descuento={descuento} />
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