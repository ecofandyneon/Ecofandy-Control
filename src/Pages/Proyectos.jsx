import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { db } from "../Services/firebase";
import ProyectoCard from "../Components/Proyectos/ProyectoCard";

function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    const q = query(collection(db, "proyectos"), orderBy("creadoEn", "desc"));
    const snapshot = await getDocs(q);

    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setProyectos(lista);
  };

  const eliminarProyecto = async (proyecto) => {
    const confirmar = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar proyecto?",
      text: `Se eliminará ${proyecto.codigo || "este proyecto"}. Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#7C3AED",
    });

    if (!confirmar.isConfirmed) return;

    await deleteDoc(doc(db, "proyectos", proyecto.id));

    setProyectos((actuales) =>
      actuales.filter((item) => item.id !== proyecto.id)
    );

    Swal.fire({
      icon: "success",
      title: "Proyecto eliminado",
      confirmButtonColor: "#7C3AED",
    });
  };

  const filtrados = proyectos.filter((proyecto) => {
    const texto = `
      ${proyecto.codigo || ""}
      ${proyecto.cliente || ""}
      ${proyecto.proyecto || ""}
      ${proyecto.estado || ""}
      ${proyecto.whatsapp || ""}
    `.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-purple-500">Proyectos</h1>

          <p className="text-zinc-400 mt-2">
            Centro de proyectos Ecofandy.
          </p>
        </div>

        <Link
          to="/proyectos/nuevo"
          className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-xl font-bold"
        >
          ➕ Nuevo Trabajo
        </Link>
      </div>

      <input
        className="input mb-8"
        placeholder="Buscar por folio, cliente, trabajo, WhatsApp o estado..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtrados.map((proyecto) => (
          <ProyectoCard
            key={proyecto.id}
            proyecto={proyecto}
            onDelete={eliminarProyecto}
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