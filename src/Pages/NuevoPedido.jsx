import { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getCountFromServer,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../Services/firebase";
import Swal from "sweetalert2";

import EcoCard from "../Components/NeonUI/EcoCard";
import EcoButton from "../Components/NeonUI/EcoButton";
import EcoInput from "../Components/NeonUI/EcoInput";

function NuevoPedido() {
  const [cliente, setCliente] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [producto, setProducto] = useState("Neón LED");
  const [servicio, setServicio] = useState("Fabricación");
  const [medidas, setMedidas] = useState("");
  const [prioridad, setPrioridad] = useState("Normal");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [precio, setPrecio] = useState("");
  const [anticipo, setAnticipo] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("Recoge en taller");
  const [instalacion, setInstalacion] = useState("No");
  const [garantia, setGarantia] = useState("No");
  const [descripcion, setDescripcion] = useState("");

  const saldo = Number(precio || 0) - Number(anticipo || 0);

  const obtenerOCrearCliente = async () => {
    const nombreCliente = cliente.trim();
    const whatsappLimpio = whatsapp.replace(/\D/g, "");

    if (!nombreCliente) {
      throw new Error("El nombre del cliente es obligatorio");
    }

    const clientesRef = collection(db, "clientes");

    if (whatsappLimpio) {
      const q = query(clientesRef, where("whatsapp", "==", whatsappLimpio));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }
    }

    const nuevoCliente = await addDoc(clientesRef, {
      nombre: nombreCliente,
      whatsapp: whatsappLimpio,
      ciudad: "",
      notas: "",
      creadoEn: serverTimestamp(),
    });

    return nuevoCliente.id;
  };

  const guardarProyecto = async (e) => {
    e.preventDefault();

    try {
      const clienteId = await obtenerOCrearCliente();

      const snapshot = await getCountFromServer(collection(db, "proyectos"));
      const totalProyectos = snapshot.data().count + 1;
      const codigo = `EF-${String(totalProyectos).padStart(4, "0")}`;

      await addDoc(collection(db, "proyectos"), {
        codigo,
        clienteId,
        cliente: cliente.trim(),
        whatsapp: whatsapp.replace(/\D/g, ""),
        proyecto,
        producto,
        servicio,
        medidas,
        prioridad,
        estado: "Idea recibida",
        fechaEntrega,
        precio: Number(precio || 0),
        anticipo: Number(anticipo || 0),
        saldo,
        estadoPago: saldo <= 0 ? "Liquidado" : "Pendiente",
        tipoEntrega,
        instalacion,
        garantia,
        descripcion,
        creadoEn: serverTimestamp(),
      });

      Swal.fire({
        icon: "success",
        title: "Trabajo guardado",
        text: `El trabajo ${codigo} quedó registrado correctamente.`,
        confirmButtonColor: "#7C3AED",
      });

      setCliente("");
      setWhatsapp("");
      setProyecto("");
      setProducto("Neón LED");
      setServicio("Fabricación");
      setMedidas("");
      setPrioridad("Normal");
      setFechaEntrega("");
      setPrecio("");
      setAnticipo("");
      setTipoEntrega("Recoge en taller");
      setInstalacion("No");
      setGarantia("No");
      setDescripcion("");
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo guardar el trabajo.",
        confirmButtonColor: "#7C3AED",
      });
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500">✨ Nuevo Trabajo</h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Registra una nueva orden de trabajo para Ecofandy.
      </p>

      <form onSubmit={guardarProyecto}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <EcoCard>
            <h2 className="text-xl font-bold text-purple-400 mb-5">
              👤 Cliente
            </h2>

            <div className="space-y-4">
              <EcoInput
                label="Nombre del cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Ej. Bella Lashes"
              />

              <EcoInput
                label="WhatsApp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="0000000000"
              />
            </div>
          </EcoCard>

          <EcoCard>
            <h2 className="text-xl font-bold text-purple-400 mb-5">
              📋 Trabajo
            </h2>

            <div className="space-y-4">
              <EcoInput
                label="Nombre del trabajo"
                value={proyecto}
                onChange={(e) => setProyecto(e.target.value)}
                placeholder="Ej. Letrero recepción"
              />

              <div>
                <label className="text-zinc-300 font-semibold">Producto</label>
                <select
                  className="input mt-2"
                  value={producto}
                  onChange={(e) => setProducto(e.target.value)}
                >
                  <option>Neón LED</option>
                  <option>Letras Corpóreas</option>
                  <option>Caja de Luz</option>
                  <option>Caja Bandera</option>
                  <option>Vinil</option>
                  <option>Glorificador LED</option>
                  <option>Glorificador Neón</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold">Servicio</label>
                <select
                  className="input mt-2"
                  value={servicio}
                  onChange={(e) => setServicio(e.target.value)}
                >
                  <option>Fabricación</option>
                  <option>Reparación</option>
                  <option>Restauración</option>
                  <option>Mantenimiento</option>
                </select>
              </div>
            </div>
          </EcoCard>

          <EcoCard>
            <h2 className="text-xl font-bold text-purple-400 mb-5">
              🏭 Producción
            </h2>

            <div className="space-y-4">
              <EcoInput
                label="Medidas"
                value={medidas}
                onChange={(e) => setMedidas(e.target.value)}
                placeholder="Ej. 120 x 60 cm"
              />

              <div>
                <label className="text-zinc-300 font-semibold">Prioridad</label>
                <select
                  className="input mt-2"
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value)}
                >
                  <option>Baja</option>
                  <option>Normal</option>
                  <option>Alta</option>
                  <option>Urgente</option>
                </select>
              </div>

              <EcoInput
                label="Fecha de entrega"
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
              />
            </div>
          </EcoCard>

          <EcoCard>
            <h2 className="text-xl font-bold text-purple-400 mb-5">
              💰 Finanzas
            </h2>

            <div className="space-y-4">
              <EcoInput
                label="Precio total"
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0"
              />

              <EcoInput
                label="Anticipo"
                type="number"
                value={anticipo}
                onChange={(e) => setAnticipo(e.target.value)}
                placeholder="0"
              />

              <div className="bg-purple-600/20 text-purple-300 rounded-xl p-4">
                <p className="text-sm">Saldo pendiente</p>
                <p className="text-3xl font-bold">
                  ${saldo.toLocaleString("es-MX")}
                </p>
              </div>
            </div>
          </EcoCard>

          <EcoCard>
            <h2 className="text-xl font-bold text-purple-400 mb-5">
              🚚 Entrega
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-zinc-300 font-semibold">
                  Tipo de entrega
                </label>
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

              <div>
                <label className="text-zinc-300 font-semibold">
                  ¿Requiere instalación?
                </label>
                <select
                  className="input mt-2"
                  value={instalacion}
                  onChange={(e) => setInstalacion(e.target.value)}
                >
                  <option>No</option>
                  <option>Sí</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold">
                  ¿Tiene garantía?
                </label>
                <select
                  className="input mt-2"
                  value={garantia}
                  onChange={(e) => setGarantia(e.target.value)}
                >
                  <option>No</option>
                  <option>Sí</option>
                </select>
              </div>
            </div>
          </EcoCard>

          <EcoCard>
            <h2 className="text-xl font-bold text-purple-400 mb-5">
              📝 Observaciones
            </h2>

            <textarea
              className="input min-h-40"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe la idea, materiales, colores o indicaciones del cliente."
            />
          </EcoCard>
        </div>

        <div className="mt-8">
          <EcoButton type="submit" className="w-full py-4">
            💜 Guardar Trabajo
          </EcoButton>
        </div>
      </form>
    </div>
  );
}

export default NuevoPedido;