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
import EcoSelect from "../Components/NeonUI/EcoSelect";
import ClienteSelector from "../Components/Clientes/ClienteSelector";

function NuevoPedido() {
  const [clienteId, setClienteId] = useState("");
  const [cliente, setCliente] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [correo, setCorreo] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [producto, setProducto] = useState("Neón LED");
  const [servicio, setServicio] = useState("Fabricación");
  const [medidas, setMedidas] = useState("");
  const [prioridad, setPrioridad] = useState("Normal");
  const [fechaEntrega, setFechaEntrega] = useState("");

  const [subtotal, setSubtotal] = useState("");
  const [requiereFactura, setRequiereFactura] = useState(false);
  const [anticipo, setAnticipo] = useState("");

  const [tipoEntrega, setTipoEntrega] = useState("Recoge en taller");
  const [instalacion, setInstalacion] = useState("No");
  const [garantia, setGarantia] = useState("No");
  const [descripcion, setDescripcion] = useState("");

  const iva = requiereFactura ? Number(subtotal || 0) * 0.16 : 0;
  const total = Number(subtotal || 0) + iva;
  const saldo = total - Number(anticipo || 0);

  const seleccionarCliente = (clienteSeleccionado) => {
    setClienteId(clienteSeleccionado.id);
    setCliente(clienteSeleccionado.nombre || "");
    setWhatsapp(clienteSeleccionado.whatsapp || "");
    setCorreo(clienteSeleccionado.correo || "");
  };

  const obtenerOCrearCliente = async () => {
    if (clienteId) return clienteId;

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
      correo,
      ciudad: "",
      cp: "",
      rfc: "",
      usoCfdi: "",
      notas: "",
      creadoEn: serverTimestamp(),
    });

    return nuevoCliente.id;
  };

  const guardarProyecto = async (e) => {
    e.preventDefault();

    try {
      const idClienteFinal = await obtenerOCrearCliente();

      const snapshot = await getCountFromServer(collection(db, "proyectos"));
      const totalProyectos = snapshot.data().count + 1;
      const codigo = `EF-${String(totalProyectos).padStart(4, "0")}`;

      await addDoc(collection(db, "proyectos"), {
        codigo,
        clienteId: idClienteFinal,
        cliente: cliente.trim(),
        whatsapp: whatsapp.replace(/\D/g, ""),
        correo,
        proyecto,
        producto,
        servicio,
        medidas,
        prioridad,
        estado: "Idea recibida",
        fechaEntrega,

        subtotal: Number(subtotal || 0),
        requiereFactura,
        iva,
        total,
        precio: total,
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

      setClienteId("");
      setCliente("");
      setWhatsapp("");
      setCorreo("");
      setProyecto("");
      setProducto("Neón LED");
      setServicio("Fabricación");
      setMedidas("");
      setPrioridad("Normal");
      setFechaEntrega("");
      setSubtotal("");
      setRequiereFactura(false);
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
              <ClienteSelector onSelect={seleccionarCliente} />

              <EcoInput
                label="Nombre del cliente"
                value={cliente}
                onChange={(e) => {
                  setCliente(e.target.value);
                  setClienteId("");
                }}
                placeholder="Ej. Bella Lashes"
              />

              <EcoInput
                label="WhatsApp"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  setClienteId("");
                }}
                placeholder="7771234567"
              />

              <EcoInput
                label="Correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="cliente@correo.com"
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

              <EcoSelect
                label="Producto"
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
              </EcoSelect>

              <EcoSelect
                label="Servicio"
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
              >
                <option>Fabricación</option>
                <option>Reparación</option>
                <option>Restauración</option>
                <option>Mantenimiento</option>
              </EcoSelect>
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

              <EcoSelect
                label="Prioridad"
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
              >
                <option>Baja</option>
                <option>Normal</option>
                <option>Alta</option>
                <option>Urgente</option>
              </EcoSelect>

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
                label="Subtotal"
                type="number"
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                placeholder="0"
              />

              <label className="flex items-center gap-3 text-zinc-300 font-semibold bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <input
                  type="checkbox"
                  checked={requiereFactura}
                  onChange={(e) => setRequiereFactura(e.target.checked)}
                />
                Requiere factura (+16% IVA)
              </label>

              <div className="bg-zinc-950 rounded-xl p-4 space-y-2 border border-zinc-800">
                <div className="flex justify-between">
                  <span className="text-zinc-400">IVA</span>
                  <strong>${iva.toLocaleString("es-MX")}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Total</span>
                  <strong className="text-green-400">
                    ${total.toLocaleString("es-MX")}
                  </strong>
                </div>
              </div>

              <EcoInput
                label="Anticipo / Pagado"
                type="number"
                value={anticipo}
                onChange={(e) => setAnticipo(e.target.value)}
                placeholder="0"
              />

              <div className="bg-purple-600/20 text-purple-300 rounded-xl p-4">
                <p className="text-sm">Saldo pendiente</p>
                <p className="text-3xl font-bold">
                  ${Math.max(saldo, 0).toLocaleString("es-MX")}
                </p>
              </div>
            </div>
          </EcoCard>

          <EcoCard>
            <h2 className="text-xl font-bold text-purple-400 mb-5">
              🚚 Entrega
            </h2>

            <div className="space-y-4">
              <EcoSelect
                label="Tipo de entrega"
                value={tipoEntrega}
                onChange={(e) => setTipoEntrega(e.target.value)}
              >
                <option>Recoge en taller</option>
                <option>Entrega local</option>
                <option>Envío</option>
                <option>Instalación</option>
              </EcoSelect>

              <EcoSelect
                label="¿Requiere instalación?"
                value={instalacion}
                onChange={(e) => setInstalacion(e.target.value)}
              >
                <option>No</option>
                <option>Sí</option>
              </EcoSelect>

              <EcoSelect
                label="¿Tiene garantía?"
                value={garantia}
                onChange={(e) => setGarantia(e.target.value)}
              >
                <option>No</option>
                <option>Sí</option>
              </EcoSelect>
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