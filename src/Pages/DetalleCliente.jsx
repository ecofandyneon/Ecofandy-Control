import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { db } from "../Services/firebase";

import EstadoBadge from "../Components/Clientes/EstadoBadge";
import BarraProgreso from "../Components/Clientes/BarraProgreso";

function DetalleCliente() {
  const { id } = useParams();

  const [cliente, setCliente] = useState(null);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const clienteRef = doc(db, "clientes", id);
        const clienteSnap = await getDoc(clienteRef);

        if (!clienteSnap.exists()) {
          setCargando(false);
          return;
        }

        const clienteData = {
          id: clienteSnap.id,
          ...clienteSnap.data(),
        };

        setCliente(clienteData);

        const qClienteId = query(
          collection(db, "cotizaciones"),
          where("clienteId", "==", id)
        );

        const snapshotId = await getDocs(qClienteId);

        const listaId = snapshotId.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        let listaNombre = [];

        if (clienteData.nombre) {
          const qNombre = query(
            collection(db, "cotizaciones"),
            where("clienteNombre", "==", clienteData.nombre)
          );

          const snapshotNombre = await getDocs(qNombre);

          listaNombre = snapshotNombre.docs.map((documento) => ({
            id: documento.id,
            ...documento.data(),
          }));
        }

        const mezcladas = [...listaId, ...listaNombre];

        const sinDuplicados = mezcladas.filter(
          (cotizacion, index, array) =>
            index === array.findIndex((item) => item.id === cotizacion.id)
        );

        setCotizaciones(sinDuplicados);
      } catch (error) {
        console.error("Error cargando historial del cliente:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [id]);

  if (cargando) {
    return <p className="text-zinc-400">Cargando cliente...</p>;
  }

  if (!cliente) {
    return <p className="text-red-400">No se encontró el cliente.</p>;
  }

  return (
    <div>
      <Link to="/clientes" className="text-purple-400 hover:text-purple-300">
        ← Volver a clientes
      </Link>

      <div className="mt-6 mb-8">
        <h1 className="text-4xl font-bold text-purple-500">
          {cliente.nombre}
        </h1>

        <p className="text-zinc-400 mt-2">
          {cliente.whatsapp || "Sin WhatsApp"} ·{" "}
          {cliente.ciudad || "Sin ciudad"}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            👤 Datos del cliente
          </h2>

          <div className="space-y-3 text-zinc-300">
            <p>
              <span className="text-zinc-500">WhatsApp:</span>{" "}
              {cliente.whatsapp || "Sin WhatsApp"}
            </p>

            <p>
              <span className="text-zinc-500">Correo:</span>{" "}
              {cliente.correo || "Sin correo"}
            </p>

            <p>
              <span className="text-zinc-500">Ciudad:</span>{" "}
              {cliente.ciudad || "Sin ciudad"}
            </p>

            <p>
              <span className="text-zinc-500">RFC:</span>{" "}
              {cliente.rfc || "Sin RFC"}
            </p>
          </div>

          <Link
            to="/nueva-cotizacion"
            className="block text-center mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl"
          >
            ➕ Nuevo proyecto
          </Link>
        </div>

        <div className="xl:col-span-2 bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            📋 Historial de proyectos
          </h2>

          <div className="space-y-4">
            {cotizaciones.map((cotizacion) => (
              <div
                key={cotizacion.id}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-lg hover:border-purple-500 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:justify-between gap-6">
                  <div className="flex-1">
                    <p className="font-bold text-white text-lg">
                      {cotizacion.folio} · {cotizacion.nombreProyecto}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-zinc-400 text-sm">
                        {cotizacion.tipo}
                      </p>

                      <EstadoBadge estado={cotizacion.estado} />
                    </div>

                    <p className="text-zinc-500 text-sm mt-2">
                      {cotizacion.medidas?.ancho || 0} ×{" "}
                      {cotizacion.medidas?.alto || 0} cm
                    </p>

                    <BarraProgreso estado={cotizacion.estado} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 text-sm">
                      <div className="bg-zinc-900 rounded-xl p-3">
                        <p className="text-zinc-500">Materiales</p>
                        <p className="font-bold text-white">
                          $
                          {Number(
                            cotizacion.totalMateriales || 0
                          ).toLocaleString("es-MX")}
                        </p>
                      </div>

                      <div className="bg-zinc-900 rounded-xl p-3">
                        <p className="text-zinc-500">Mano de obra</p>
                        <p className="font-bold text-white">
                          $
                          {Number(cotizacion.manoObra || 0).toLocaleString(
                            "es-MX"
                          )}
                        </p>
                      </div>

                      <div className="bg-zinc-900 rounded-xl p-3">
                        <p className="text-zinc-500">Descuento</p>
                        <p className="font-bold text-red-400">
                          -$
                          {Number(cotizacion.descuento || 0).toLocaleString(
                            "es-MX"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="md:text-right min-w-44">
                    <p className="text-zinc-500 text-sm">Precio final</p>

                    <p className="text-green-400 font-bold text-3xl">
                      $
                      {Number(
                        cotizacion.precioFinal ||
                          cotizacion.precioVenta ||
                          0
                      ).toLocaleString("es-MX")}
                    </p>

                    <div className="flex flex-col gap-3 mt-5">
                      <Link
                        to={`/cotizaciones/${cotizacion.id}`}
                        className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-3 rounded-xl text-center"
                      >
                        📂 Abrir expediente
                      </Link>

                      <Link
                        to={`/nueva-cotizacion?editar=${cotizacion.id}`}
                        className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-5 py-3 rounded-xl text-center border border-zinc-700"
                      >
                        ✏️ Editar proyecto
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {cotizaciones.length === 0 && (
              <p className="text-zinc-500 text-center py-8">
                Este cliente aún no tiene proyectos.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleCliente;