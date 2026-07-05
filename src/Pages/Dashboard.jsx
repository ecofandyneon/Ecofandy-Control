import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "../Services/firebase";

function Dashboard() {
  const [proyectos, setProyectos] = useState([]);
  const [ultimos, setUltimos] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const proyectosSnap = await getDocs(collection(db, "proyectos"));

      const lista = proyectosSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProyectos(lista);

      const ultimosQuery = query(
        collection(db, "proyectos"),
        orderBy("creadoEn", "desc"),
        limit(5)
      );

      const ultimosSnap = await getDocs(ultimosQuery);

      const listaUltimos = ultimosSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUltimos(listaUltimos);
    };

    cargarDatos();
  }, []);

  const activos = proyectos.filter(
    (p) => p.estado !== "Entregado" && p.estado !== "Liquidado"
  ).length;

  const entregados = proyectos.filter((p) => p.estado === "Entregado").length;

  const clientesUnicos = new Set(
    proyectos.map((p) => p.cliente?.toLowerCase().trim()).filter(Boolean)
  ).size;

  const saldoPendiente = proyectos.reduce((total, p) => {
    return total + Number(p.saldo || 0);
  }, 0);

  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500">
        Dashboard
      </h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Bienvenido, Fabián. Hoy seguimos iluminando ideas.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Tarjeta titulo="Proyectos activos" valor={activos} />
        <Tarjeta titulo="Clientes" valor={clientesUnicos} />
        <Tarjeta
          titulo="Por cobrar"
          valor={`$${saldoPendiente.toLocaleString("es-MX")}`}
        />
        <Tarjeta titulo="Entregados" valor={entregados} />
      </div>

      <div className="mt-10 bg-zinc-900 border border-purple-700/40 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-purple-400">
            Últimos proyectos
          </h2>
        </div>

        <table className="w-full text-left">
          <thead className="bg-zinc-950 text-purple-400">
            <tr>
              <th className="p-4">Código</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Proyecto</th>
              <th className="p-4">Estado</th>
            </tr>
          </thead>

          <tbody>
            {ultimos.map((proyecto) => (
              <tr
                key={proyecto.id}
                className="border-t border-zinc-800 hover:bg-zinc-800"
              >
                <td className="p-4 font-bold text-purple-400">
                  {proyecto.codigo || "Sin código"}
                </td>
                <td className="p-4">{proyecto.cliente}</td>
                <td className="p-4">{proyecto.proyecto}</td>
                <td className="p-4">
                  <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                    {proyecto.estado || "Sin estado"}
                  </span>
                </td>
              </tr>
            ))}

            {ultimos.length === 0 && (
              <tr>
                <td className="p-4 text-zinc-400" colSpan="4">
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

function Tarjeta({ titulo, valor }) {
  return (
    <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(124,58,237,0.18)]">
      <h2 className="text-zinc-400">{titulo}</h2>
      <p className="text-3xl font-bold mt-3 text-white">{valor}</p>
    </div>
  );
}

export default Dashboard;