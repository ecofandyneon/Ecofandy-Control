import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { db } from "../Services/firebase";
import Swal from "sweetalert2";

function DetalleProyecto() {
  const { id } = useParams();

  const [proyecto, setProyecto] = useState(null);
  const [estado, setEstado] = useState("Idea recibida");
  const [precio, setPrecio] = useState("");
  const [anticipo, setAnticipo] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("Recoge en taller");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    const cargarProyecto = async () => {
      const docRef = doc(db, "proyectos", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };

        setProyecto(data);
        setEstado(data.estado || "Idea recibida");
        setPrecio(data.precio || "");
        setAnticipo(data.anticipo || "");
        setFechaEntrega(data.fechaEntrega || "");
        setTipoEntrega(data.tipoEntrega || "Recoge en taller");
        setNotas(data.notas || "");
      }
    };

    cargarProyecto();
  }, [id]);

  const saldo = Number(precio || 0) - Number(anticipo || 0);

  const guardarCambios = async () => {
    try {
      const docRef = doc(db, "proyectos", id);

      await updateDoc(docRef, {
        estado,
        precio: Number(precio || 0),
        anticipo: Number(anticipo || 0),
        saldo,
        fechaEntrega,
        tipoEntrega,
        notas,
      });

      setProyecto({
        ...proyecto,
        estado,
        precio: Number(precio || 0),
        anticipo: Number(anticipo || 0),
        saldo,
        fechaEntrega,
        tipoEntrega,
        notas,
      });

      Swal.fire({
        icon: "success",
        title: "Proyecto actualizado",
        text: "Los cambios se guardaron correctamente.",
        confirmButtonColor: "#7C3AED",
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron guardar los cambios.",
        confirmButtonColor: "#7C3AED",
      });
    }
  };

  if (!proyecto) {
    return <p className="text-zinc-400">Cargando proyecto...</p>;
  }

  return (
    <div>
      <Link to="/proyectos" className="text-purple-400 hover:text-purple-300">
        ← Volver a proyectos
      </Link>

      <div className="flex justify-between items-start mt-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-purple-500">
            {proyecto.codigo || "Sin código"}
          </h1>
          <p className="text-zinc-400 mt-2">Centro del proyecto</p>
        </div>

        <span className="bg-purple-600/20 text-purple-300 px-4 py-2 rounded-full">
          {estado}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            Información
          </h2>

          <p><strong>Cliente:</strong> {proyecto.cliente}</p>
          <p><strong>WhatsApp:</strong> {proyecto.whatsapp}</p>
          <p><strong>Proyecto:</strong> {proyecto.proyecto}</p>

          <div className="mt-5">
            <label className="text-zinc-400 text-sm">Estado</label>
            <select
              className="input mt-2"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option>Idea recibida</option>
              <option>Diseño / Render</option>
              <option>Aprobado</option>
              <option>Corte</option>
              <option>Armado LED</option>
              <option>Pruebas</option>
              <option>Finalizado</option>
              <option>Empaque</option>
              <option>Entregado</option>
              <option>Liquidado</option>
            </select>
          </div>
          </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            Finanzas
          </h2>

          <label className="text-zinc-400 text-sm">Precio total</label>
          <input
            className="input mt-2 mb-4"
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="0"
          />

          <label className="text-zinc-400 text-sm">Anticipo</label>
          <input
            className="input mt-2 mb-4"
            type="number"
            value={anticipo}
            onChange={(e) => setAnticipo(e.target.value)}
            placeholder="0"
          />

          <div className="bg-purple-600/20 text-purple-300 rounded-xl p-4 mt-2">
            <p className="text-sm">Saldo pendiente</p>
            <p className="text-3xl font-bold">
              ${saldo.toLocaleString("es-MX")}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            Entrega
          </h2>

          <label className="text-zinc-400 text-sm">Fecha compromiso</label>
          <input
            className="input mt-2 mb-4"
            type="date"
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.target.value)}
          />

          <label className="text-zinc-400 text-sm">Tipo de entrega</label>
          <select
            className="input mt-2"
            value={tipoEntrega}
            onChange={(e) => setTipoEntrega(e.target.value)}
          >
            <option>Recoge en taller</option>
            <option>Entrega local</option>
            <option>Envío</option>
            <option>Instalación</option>
          </select>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            Descripción
          </h2>

          <p className="text-zinc-300">
            {proyecto.descripcion || "Sin descripción"}
          </p>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            Notas internas
          </h2>

          <textarea
            className="input min-h-32"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Notas internas del proyecto"
          />
        </div>
      </div>

      <button
        onClick={guardarCambios}
        className="mt-8 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.5)]"
      >
        💜 Guardar cambios
      </button>
    </div>
  );
}

export default DetalleProyecto