import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../Services/firebase";
import Swal from "sweetalert2";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [notas, setNotas] = useState("");

  const cargarClientes = async () => {
    const q = query(collection(db, "clientes"), orderBy("creadoEn", "desc"));
    const snapshot = await getDocs(q);

    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setClientes(lista);
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const guardarCliente = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "clientes"), {
        nombre,
        whatsapp,
        ciudad,
        notas,
        creadoEn: serverTimestamp(),
      });

      Swal.fire({
        icon: "success",
        title: "Cliente guardado",
        text: "El cliente quedó registrado correctamente.",
        confirmButtonColor: "#7C3AED",
      });

      setNombre("");
      setWhatsapp("");
      setCiudad("");
      setNotas("");

      cargarClientes();
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el cliente.",
        confirmButtonColor: "#7C3AED",
      });
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500">Clientes</h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Base de clientes de Ecofandy Control.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form
          onSubmit={guardarCliente}
          className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-purple-400 mb-4">
            Nuevo cliente
          </h2>

          <input
            className="input mb-4"
            placeholder="Nombre del cliente"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
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
            placeholder="Ciudad"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
          />

          <textarea
            className="input min-h-28 mb-5"
            placeholder="Notas del cliente"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl"
          >
            💜 Guardar cliente
          </button>
        </form>

        <div className="xl:col-span-2 bg-zinc-900 border border-purple-700/40 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-purple-400">
              Clientes registrados
            </h2>
          </div>

          <table className="w-full text-left">
            <thead className="bg-zinc-950 text-purple-400">
              <tr>
                <th className="p-4">Nombre</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4">Ciudad</th>
              </tr>
            </thead>

            <tbody>
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-t border-zinc-800 hover:bg-zinc-800"
                >
                  <td className="p-4 font-bold">{cliente.nombre}</td>
                  <td className="p-4">{cliente.whatsapp || "Sin WhatsApp"}</td>
                  <td className="p-4">{cliente.ciudad || "Sin ciudad"}</td>
                </tr>
              ))}

              {clientes.length === 0 && (
                <tr>
                  <td className="p-4 text-zinc-400" colSpan="3">
                    Aún no hay clientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Clientes;