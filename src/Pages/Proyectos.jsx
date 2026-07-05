import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../Services/firebase";
import ProyectoCard from "../components/Proyectos/ProyectoCard";

function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    const q = query(
      collection(db, "proyectos"),
      orderBy("creadoEn", "desc")
    );

    const snapshot = await getDocs(q);

    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setProyectos(lista);
  };

  const filtrados = proyectos.filter((proyecto) => {
    const texto = `
      ${proyecto.codigo || ""}
      ${proyecto.cliente || ""}
      ${proyecto.proyecto || ""}
      ${proyecto.estado || ""}
    `.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold text-purple-500">
            Proyectos
          </h1>

          <p className="text-zinc-400 mt-2">
            Centro de proyectos Ecofandy.
          </p>

        </div>

        <Link
          to="/proyectos/nuevo"
          className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-xl font-bold"
        >
          ➕ Nuevo Proyecto
        </Link>

      </div>

      <input
        className="input mb-8"
        placeholder="Buscar proyecto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {filtrados.map((proyecto) => (
          <ProyectoCard
            key={proyecto.id}
            proyecto={proyecto}
          />
        ))}

      </div>

      {filtrados.length === 0 && (
        <div className="text-center text-zinc-500 mt-20">
          No se encontraron proyectos.
        </div>
      )}

    </div>
  );
}

export default Proyectos;