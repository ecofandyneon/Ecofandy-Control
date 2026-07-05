import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../Services/firebase";

function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const cargarProyectos = async () => {
    const q = query(collection(db, "proyectos"), orderBy("creadoEn", "desc"));
    const snapshot = await getDocs(q);

    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setProyectos(lista);
  };

  useEffect(() => {
    cargarProyectos();
  }, []);

  const proyectosFiltrados = proyectos.filter((proyecto) => {
    const texto = `${proyecto.codigo || ""} ${proyecto.cliente || ""} ${
      proyecto.proyecto || ""
    } ${proyecto.whatsapp || ""} ${proyecto.estado || ""}`.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div>
      <div className="flex justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-purple-500">Proyectos</h1>

          <p className="text-zinc-400 mt-2">
            Lista de ideas y proyectos registrados en Ecofandy Control.
          </p>
        </div>

        <Link
          to="/proyectos/nuevo"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-3 rounded-xl"
        >
          ➕ Nuevo Proyecto
        </Link>
      </div>

      <input
        className="input mb-6"
        placeholder="Buscar por folio, cliente, proyecto, WhatsApp o estado..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 text-purple-400">
            <tr>
              <th className="p-4">Código</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Proyecto</th>
              <th className="p-4">WhatsApp</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {proyectosFiltrados.map((proyecto) => (
              <tr
                key={proyecto.id}
                className="border-t border-zinc-800 hover:bg-zinc-800 transition"
              >
                <td className="p-4 font-bold text-purple-400">
                  {proyecto.codigo || "Sin código"}
                </td>

                <td className="p-4">{proyecto.cliente}</td>

                <td className="p-4">{proyecto.proyecto}</td>

                <td className="p-4">{proyecto.whatsapp || "Sin WhatsApp"}</td>

                <td className="p-4">
                  <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                    {proyecto.estado || "Sin estado"}
                  </span>
                </td>

                <td className="p-4">
                  <Link
                    to={`/proyectos/${proyecto.id}`}
                    className="text-purple-400 hover:text-purple-300 font-bold"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}

            {proyectosFiltrados.length === 0 && (
              <tr>
                <td className="p-4 text-zinc-400" colSpan="6">
                  No se encontraron proyectos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Proyectos;