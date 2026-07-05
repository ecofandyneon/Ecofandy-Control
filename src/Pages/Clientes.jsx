import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../Services/firebase";
import Swal from "sweetalert2";

import EcoCard from "../Components/NeonUI/EcoCard";
import EcoButton from "../Components/NeonUI/EcoButton";
import EcoInput from "../Components/NeonUI/EcoInput";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    whatsapp: "",
    correo: "",
    ciudad: "",
    cp: "",
    rfc: "",
    usoCfdi: "",
    notas: "",
  });

  const limpiarWhatsapp = (numero) => numero.replace(/\D/g, "");

  const actualizarCampo = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const cargarClientes = async () => {
    const q = query(collection(db, "clientes"), orderBy("creadoEn", "desc"));
    const snapshot = await getDocs(q);

    setClientes(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      whatsapp: "",
      correo: "",
      ciudad: "",
      cp: "",
      rfc: "",
      usoCfdi: "",
      notas: "",
    });
    setEditandoId(null);
  };

  const guardarCliente = async (e) => {
    e.preventDefault();

    try {
      const datos = {
        ...form,
        nombre: form.nombre.trim(),
        whatsapp: limpiarWhatsapp(form.whatsapp),
        actualizadoEn: serverTimestamp(),
      };

      if (editandoId) {
        await updateDoc(doc(db, "clientes", editandoId), datos);

        Swal.fire({
          icon: "success",
          title: "Cliente actualizado",
          confirmButtonColor: "#7C3AED",
        });
      } else {
        await addDoc(collection(db, "clientes"), {
          ...datos,
          creadoEn: serverTimestamp(),
        });

        Swal.fire({
          icon: "success",
          title: "Cliente guardado",
          confirmButtonColor: "#7C3AED",
        });
      }

      limpiarFormulario();
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

  const editarCliente = (cliente) => {
    setEditandoId(cliente.id);

    setForm({
      nombre: cliente.nombre || "",
      whatsapp: cliente.whatsapp || "",
      correo: cliente.correo || "",
      ciudad: cliente.ciudad || "",
      cp: cliente.cp || "",
      rfc: cliente.rfc || "",
      usoCfdi: cliente.usoCfdi || "",
      notas: cliente.notas || "",
    });
  };

  const eliminarCliente = async (clienteId) => {
    const confirmar = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar cliente?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#7C3AED",
    });

    if (!confirmar.isConfirmed) return;

    await deleteDoc(doc(db, "clientes", clienteId));

    Swal.fire({
      icon: "success",
      title: "Cliente eliminado",
      confirmButtonColor: "#7C3AED",
    });

    cargarClientes();
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500">Clientes</h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Base de datos de clientes y datos fiscales.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={guardarCliente}>
          <EcoCard>
            <h2 className="text-xl font-bold text-purple-400 mb-5">
              {editandoId ? "Editar cliente" : "Nuevo cliente"}
            </h2>

            <div className="space-y-4">
              <EcoInput
                label="Nombre del cliente"
                name="nombre"
                value={form.nombre}
                onChange={actualizarCampo}
                placeholder="Nombre del cliente"
              />

              <EcoInput
                label="WhatsApp"
                name="whatsapp"
                value={form.whatsapp}
                onChange={actualizarCampo}
                placeholder="7771234567"
              />

              <EcoInput
                label="Correo"
                name="correo"
                type="email"
                value={form.correo}
                onChange={actualizarCampo}
                placeholder="cliente@correo.com"
              />

              <EcoInput
                label="Ciudad"
                name="ciudad"
                value={form.ciudad}
                onChange={actualizarCampo}
                placeholder="Cuernavaca"
              />

              <EcoInput
                label="Código Postal"
                name="cp"
                value={form.cp}
                onChange={actualizarCampo}
                placeholder="62000"
              />

              <EcoInput
                label="RFC"
                name="rfc"
                value={form.rfc}
                onChange={actualizarCampo}
                placeholder="XAXX010101000"
              />

              <EcoInput
                label="Uso de CFDI"
                name="usoCfdi"
                value={form.usoCfdi}
                onChange={actualizarCampo}
                placeholder="G03, P01, S01..."
              />

              <textarea
                className="input min-h-28"
                name="notas"
                placeholder="Notas del cliente"
                value={form.notas}
                onChange={actualizarCampo}
              />

              <EcoButton type="submit" className="w-full">
                {editandoId ? "💾 Actualizar cliente" : "💜 Guardar cliente"}
              </EcoButton>

              {editandoId && (
                <EcoButton
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={limpiarFormulario}
                >
                  Cancelar edición
                </EcoButton>
              )}
            </div>
          </EcoCard>
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
                <th className="p-4">Correo</th>
                <th className="p-4">RFC</th>
                <th className="p-4">CP</th>
                <th className="p-4">Acciones</th>
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
                  <td className="p-4">{cliente.correo || "Sin correo"}</td>
                  <td className="p-4">{cliente.rfc || "Sin RFC"}</td>
                  <td className="p-4">{cliente.cp || "Sin CP"}</td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => editarCliente(cliente)}
                      className="text-purple-400 hover:text-purple-300 font-bold"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => eliminarCliente(cliente.id)}
                      className="text-red-400 hover:text-red-300 font-bold"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

              {clientes.length === 0 && (
                <tr>
                  <td className="p-4 text-zinc-400" colSpan="6">
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