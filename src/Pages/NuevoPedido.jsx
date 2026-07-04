import { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../Services/firebase";
import Swal from "sweetalert2";

function NuevoPedido() {
  const [cliente, setCliente] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const guardarProyecto = async (e) => {
    e.preventDefault();

    try {
      const snapshot = await getCountFromServer(collection(db, "proyectos"));
      const totalProyectos = snapshot.data().count + 1;
      const codigo = `EF-${String(totalProyectos).padStart(4, "0")}`;

      await addDoc(collection(db, "proyectos"), {
        codigo,
        cliente,
        whatsapp,
        proyecto,
        descripcion,
        estado: "Idea recibida",
        creadoEn: serverTimestamp(),
      });

      Swal.fire({
        icon: "success",
        title: "Proyecto guardado",
        text: `El proyecto ${codigo} quedó registrado en Ecofandy Control.`,
        confirmButtonColor: "#7C3AED",
      });

      setCliente("");
      setWhatsapp("");
      setProyecto("");
      setDescripcion("");
    } catch (error) {
      console.error("ERROR FIREBASE:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el proyecto.",
        confirmButtonColor: "#7C3AED",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-purple-500">
        Nuevo Proyecto
      </h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Registra la idea inicial del cliente.
      </p>

      <form
        onSubmit={guardarProyecto}
        className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-8 shadow-[0_0_25px_rgba(124,58,237,0.25)]"
      >
        <input
          className="input mb-4"
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          required
        />

        <input
          className="input mb-4"
          placeholder="WhatsApp"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
        />

        <input
          className="input mb-4"
          placeholder="Nombre del proyecto"
          value={proyecto}
          onChange={(e) => setProyecto(e.target.value)}
          required
        />

        <textarea
          className="input min-h-32 mb-6"
          placeholder="Describe la idea del cliente"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl"
        >
          💜 Guardar Proyecto
        </button>
      </form>
    </div>
  );
}

export default NuevoPedido;