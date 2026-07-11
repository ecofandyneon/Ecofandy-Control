import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { Link, useParams } from "react-router-dom";

import { db } from "../Services/firebase";
import SubirArchivo from "../Components/Archivos/SubirArchivo";
import ListaArchivos from "../Components/Archivos/ListaArchivos";
import EstadoBadge from "../Components/Clientes/EstadoBadge";
import BarraProgreso from "../Components/Clientes/BarraProgreso";

function DetalleCotizacion() {
  const { id } = useParams();

  const [cotizacion, setCotizacion] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const imagenCliente =
    archivos.find(
      (archivo) => archivo.categoria === "imagen-cliente"
    ) ||
    archivos.find((archivo) =>
      archivo.tipo?.startsWith("image/")
    );

  useEffect(() => {
    const cargarCotizacion = async () => {
      try {
        const referencia = doc(db, "cotizaciones", id);
        const documento = await getDoc(referencia);

        if (documento.exists()) {
          const datosCotizacion = {
            id: documento.id,
            ...documento.data(),
          };

          setCotizacion(datosCotizacion);
          setArchivos(datosCotizacion.archivos || []);
        }
      } catch (error) {
        console.error("Error cargando cotización:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarCotizacion();
  }, [id]);

  const registrarArchivoSubido = async (archivo) => {
    try {
      const archivoGuardado = {
        ...archivo,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      };

      const cotizacionRef = doc(db, "cotizaciones", id);

      await updateDoc(cotizacionRef, {
        archivos: arrayUnion(archivoGuardado),
        actualizadoEn: serverTimestamp(),
      });

      setArchivos((archivosActuales) => [
        ...archivosActuales,
        archivoGuardado,
      ]);
    } catch (error) {
      console.error(
        "Error guardando archivo en Firestore:",
        error
      );

      throw error;
    }
  };

  const eliminarArchivoDeLista = (archivoSeleccionado) => {
    setArchivos((archivosActuales) =>
      archivosActuales.filter(
        (archivo) =>
          archivo.url !== archivoSeleccionado.url
      )
    );
  };

  if (cargando) {
    return <p className="text-zinc-400">Cargando expediente...</p>;
  }

  if (!cotizacion) {
    return (
      <p className="text-red-400">
        No se encontró el expediente.
      </p>
    );
  }

  return (
    <div>
      <Link
        to={`/clientes/${cotizacion.clienteId}`}
        className="text-purple-400 hover:text-purple-300"
      >
        ← Volver al cliente
      </Link>

      <div className="mt-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-purple-500">
            📂 {cotizacion.folio} · {cotizacion.nombreProyecto}
          </h1>

          <p className="text-zinc-400 mt-2">
            {cotizacion.clienteNombre} · {cotizacion.tipo}
          </p>
        </div>

        <EstadoBadge estado={cotizacion.estado} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-3 bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            📌 Avance del expediente
          </h2>

          <BarraProgreso estado={cotizacion.estado} />
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            👤 Cliente
          </h2>

          <div className="space-y-3 text-zinc-300">
            <p>
              <span className="text-zinc-500">Nombre:</span>{" "}
              {cotizacion.clienteNombre}
            </p>
            <p>
              <span className="text-zinc-500">WhatsApp:</span>{" "}
              {cotizacion.whatsapp || "Sin WhatsApp"}
            </p>
            <p>
              <span className="text-zinc-500">Correo:</span>{" "}
              {cotizacion.correo || "Sin correo"}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            📏 Datos del trabajo
          </h2>

          <div className="space-y-3 text-zinc-300">
            <p>
              <span className="text-zinc-500">Tipo:</span>{" "}
              {cotizacion.tipo}
            </p>
            <p>
              <span className="text-zinc-500">Medidas:</span>{" "}
              {cotizacion.medidas?.ancho || 0} ×{" "}
              {cotizacion.medidas?.alto || 0} cm
            </p>
            <p>
              <span className="text-zinc-500">Estado:</span>{" "}
              {cotizacion.estado}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            💰 Costos
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">Materiales</span>
              <strong>
                ${Number(cotizacion.totalMateriales || 0).toLocaleString("es-MX")}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">
                Utilidad ({cotizacion.utilidadPorcentaje || 0}%)
              </span>
              <strong className="text-yellow-400">
                ${Number(cotizacion.ganancia || 0).toLocaleString("es-MX")}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">Mano de obra</span>
              <strong>
                ${Number(cotizacion.manoObra || 0).toLocaleString("es-MX")}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">Descuento</span>
              <strong className="text-red-400">
                -${Number(cotizacion.descuento || 0).toLocaleString("es-MX")}
              </strong>
            </div>

            <div className="border-t border-zinc-800 pt-4 flex justify-between text-2xl">
              <span className="text-green-300 font-bold">Precio final</span>
              <strong className="text-green-400">
                ${Number(
                  cotizacion.precioFinal || cotizacion.precioVenta || 0
                ).toLocaleString("es-MX")}
              </strong>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            🎨 Diseño / Render
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
              <p className="font-bold text-white text-center mb-4">
                📷 Imagen del cliente
              </p>

              {imagenCliente ? (
                <div>
                  <a
                    href={imagenCliente.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img
                      src={imagenCliente.url}
                      alt={imagenCliente.nombreOriginal || "Imagen del cliente"}
                      className="w-full h-64 object-contain rounded-xl bg-black border border-zinc-800 hover:border-purple-500 transition"
                    />
                  </a>

                  <p className="text-zinc-500 text-center text-sm mt-3 break-all">
                    {imagenCliente.nombreOriginal ||
                      imagenCliente.nombre ||
                      cotizacion.imagenNombre}
                  </p>

                  <p className="text-purple-400 text-center text-xs mt-1">
                    Toca la imagen para abrirla
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-6xl">📷</p>
                  <p className="text-zinc-500 mt-4">
                    Aún no hay imagen del cliente.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-5xl mb-3">🎨</p>
              <p className="font-bold text-white">Render aprobado</p>
              <p className="text-zinc-500 text-sm mt-2">
                {cotizacion.renderSeleccionado
                  ? `Render propuesta ${cotizacion.renderSeleccionado}`
                  : "Pendiente"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            📐 SVG
          </h2>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center">
            <p className="text-5xl mb-3">✏️</p>
            <p className="font-bold text-white">Archivo vector</p>
            <p className="text-zinc-500 text-sm mt-2">
              Pendiente de generar SVG
            </p>
          </div>
        </div>

        <div className="xl:col-span-3 bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            📦 Materiales cotizados
          </h2>

          <div className="space-y-3">
            {(cotizacion.materiales || []).map((material, index) => (
              <div
                key={`${material.articuloId}-${index}`}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex justify-between gap-4"
              >
                <div>
                  <p className="font-bold text-white">{material.nombre}</p>
                  <p className="text-sm text-zinc-500">
                    {material.descripcionCantidad}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-green-400">
                    ${Number(material.total || 0).toLocaleString("es-MX")}
                  </p>
                  <p className="text-sm text-zinc-500">
                    Unitario: ${Number(material.precioUnitario || 0).toLocaleString("es-MX")}
                  </p>
                </div>
              </div>
            ))}

            {(!cotizacion.materiales || cotizacion.materiales.length === 0) && (
              <p className="text-zinc-500 text-center py-8">
                Esta cotización no tiene materiales registrados.
              </p>
            )}
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-purple-400">
              📂 Archivos del proyecto
            </h2>
            <p className="text-zinc-500 mt-2">
              Guarda imágenes, renders, SVG, PDF, Corel y fotografías del proceso.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SubirArchivo
              carpeta={`expedientes/${cotizacion.folio}`}
              onArchivoSubido={registrarArchivoSubido}
            />

            <ListaArchivos
              archivos={archivos}
              onEliminar={eliminarArchivoDeLista}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleCotizacion;