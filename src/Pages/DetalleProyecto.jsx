import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { db } from "../Services/firebase";

function DetalleProyecto() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);

  useEffect(() => {
    const cargarProyecto = async () => {
      const docRef = doc(db, "proyectos", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProyecto({ id: docSnap.id, ...docSnap.data() });
      }
    };

    cargarProyecto();
  }, [id]);

  if (!proyecto) {
    return <p className="text-zinc-400">Cargando proyecto...</p>;
  }

  return (
    <div>
      <Link to="/proyectos" className="text-purple-400 hover:text-purple-300">
        ← Volver a proyectos
      </Link>

      <h1 className="text-4xl font-bold text-purple-500 mt-6">
        {proyecto.codigo || "Sin código"}
      </h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Centro del proyecto
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            Información
          </h2>

          <p><strong>Cliente:</strong> {proyecto.cliente}</p>
          <p><strong>WhatsApp:</strong> {proyecto.whatsapp}</p>
          <p><strong>Proyecto:</strong> {proyecto.proyecto}</p>
          <p><strong>Estado:</strong> {proyecto.estado}</p>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            Descripción
          </h2>

          <p className="text-zinc-300">
            {proyecto.descripcion || "Sin descripción"}
          </p>
        </div>
      </div>
    </div>
  );

}
  export default DetalleProyecto;
