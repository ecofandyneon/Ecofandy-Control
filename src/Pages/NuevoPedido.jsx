import { useState } from "react";
import { db } from "../Services/firebase";
import { collection, addDoc } from "firebase/firestore";
import Swal from "sweetalert2";

function NuevoPedido() {
  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [total, setTotal] = useState("");
  const [anticipo, setAnticipo] = useState("");

  const guardarPedido = async () => {
    try {
      await addDoc(collection(db, "pedidos"), {
        cliente,
        telefono,
        proyecto,
        total: Number(total),
        anticipo: Number(anticipo),
        fecha: new Date(),
        estado: "Diseño",
      });

      Swal.fire({
        icon: "success",
        title: "Pedido guardado",
        text: "El pedido se guardó correctamente.",
      });

      setCliente("");
      setTelefono("");
      setProyecto("");
      setTotal("");
      setAnticipo("");
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No fue posible guardar el pedido.",
      });
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold text-pink-500 mb-6">
        Nuevo Pedido
      </h1>

      <input
        className="w-full p-3 rounded mb-3 bg-zinc-800"
        placeholder="Cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
      />

      <input
        className="w-full p-3 rounded mb-3 bg-zinc-800"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      />

      <input
        className="w-full p-3 rounded mb-3 bg-zinc-800"
        placeholder="Proyecto"
        value={proyecto}
        onChange={(e) => setProyecto(e.target.value)}
      />

      <input
        className="w-full p-3 rounded mb-3 bg-zinc-800"
        placeholder="Total"
        value={total}
        onChange={(e) => setTotal(e.target.value)}
      />

      <input
        className="w-full p-3 rounded mb-6 bg-zinc-800"
        placeholder="Anticipo"
        value={anticipo}
        onChange={(e) => setAnticipo(e.target.value)}
      />

      <button
        onClick={guardarPedido}
        className="bg-pink-500 px-6 py-3 rounded font-bold hover:bg-pink-600"
      >
        Guardar Pedido
      </button>
    </div>
  );
}

export default NuevoPedido;