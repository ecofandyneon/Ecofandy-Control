import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../Services/firebase";

function ClienteSelector({ onSelect }) {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarClientes = async () => {
      const q = query(collection(db, "clientes"), orderBy("creadoEn", "desc"));
      const snapshot = await getDocs(q);

      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setClientes(lista);
    };

    cargarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = `${cliente.nombre || ""} ${cliente.whatsapp || ""} ${
      cliente.correo || ""
    }`.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div>
      <label className="text-zinc-300 font-semibold">
        Buscar cliente existente
      </label>

      <input
        className="input mt-2 mb-3"
        placeholder="Buscar por nombre, WhatsApp o correo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {busqueda && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
          {clientesFiltrados.map((cliente) => (
            <button
              type="button"
              key={cliente.id}
              onClick={() => {
                onSelect(cliente);
                setBusqueda("");
              }}
              className="w-full text-left p-4 hover:bg-zinc-800 border-b border-zinc-800"
            >
              <p className="font-bold text-white">{cliente.nombre}</p>
              <p className="text-sm text-zinc-400">
                📱 {cliente.whatsapp || "Sin WhatsApp"}
              </p>
              <p className="text-sm text-zinc-500">
                📧 {cliente.correo || "Sin correo"}
              </p>
            </button>
          ))}

          {clientesFiltrados.length === 0 && (
            <p className="p-4 text-zinc-500">No se encontró cliente.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ClienteSelector;