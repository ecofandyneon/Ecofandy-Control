import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../Services/firebase";

function Proyectos() {
  const [proyectos, setProyectos] = useState([]);

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

  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500">Proyectos</h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Lista de ideas y proyectos registrados en Ecofandy Control.
      </p>

      <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 text-purple-400">
            <tr>
              <th className="p-4">Código</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Proyecto</th>
              <th className="p-4">WhatsApp</th>
              <th className="p-4">Estado</th>
            </tr>
          </thead>

          <tbody>
            {proyectos.map((proyecto) => (
              <tr
                key={proyecto.id}
                className="border-t border-zinc-800 hover:bg-zinc-800"
              >
                <td className="p-4 font-bold text-purple-400">
                  {proyecto.codigo || "Sin código"}
                </td>
                <td className="p-4">{proyecto.cliente}</td>
                <td className="p-4">{proyecto.proyecto}</td>
                <td className="p-4">{proyecto.whatsapp}</td>
                <td className="p-4">
                  <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                    {proyecto.estado}
                  </span>
                </td>
              </tr>
            ))}

            {proyectos.length === 0 && (
              <tr>
                <td className="p-4 text-zinc-400" colSpan="5">
                  Aún no hay proyectos registrados.
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