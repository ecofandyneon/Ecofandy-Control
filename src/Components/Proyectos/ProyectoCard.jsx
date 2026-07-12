import { Link } from "react-router-dom";
import EstadoBadge from "./EstadoBadge";
import EcoButton from "../NeonUI/EcoButton";
import EcoCard from "../NeonUI/EcoCard";
import EcoProgress from "../NeonUI/EcoProgress";

function ProyectoCard({ proyecto, onDelete }) {
  const total = Number(
    proyecto.total ||
      proyecto.precioFinal ||
      proyecto.precioVenta ||
      proyecto.precio ||
      proyecto.subtotal ||
      0
  );

  const pagos = Array.isArray(proyecto.pagos)
    ? proyecto.pagos
    : [];

  const totalPagado = pagos.reduce(
    (suma, pago) => suma + Number(pago.monto || 0),
    0
  );

  const anticipo = Number(proyecto.anticipo || 0);

  const pagado = totalPagado > 0 ? totalPagado : anticipo;

  const saldo = Math.max(total - pagado, 0);

  const avances = {
    "Idea recibida": 5,
    "Diseño / Render": 10,
    Aprobado: 15,
    Corte: 30,
    "Armado LED": 50,
    Pruebas: 70,
    Finalizado: 85,
    Empaque: 95,
    Entregado: 100,
    Liquidado: 100,
  };

  const avance = avances[proyecto.estado] ?? 0;

  const abrirWhatsapp = () => {
    const numero = (proyecto.whatsapp || "").replace(/\D/g, "");

    if (!numero) return;

    const numeroWhatsApp =
      numero.length === 10 ? `52${numero}` : numero;

    window.open(
      `https://wa.me/${numeroWhatsApp}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <EcoCard>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-purple-400">
          {proyecto.codigo || proyecto.folio || "Sin código"}
        </h2>

        <EstadoBadge estado={proyecto.estado} />
      </div>

      <h3 className="text-xl font-bold text-white capitalize">
        {proyecto.cliente || proyecto.clienteNombre || "Sin cliente"}
      </h3>

      <p className="text-zinc-400 mt-1 mb-5">
        {proyecto.proyecto ||
          proyecto.nombreProyecto ||
          "Sin nombre de proyecto"}
      </p>

      <div className="mb-6">
        <EcoProgress value={avance} />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-zinc-500">💵 Total</span>

          <span className="font-bold text-white">
            ${total.toLocaleString("es-MX")}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-500">💳 Pagado</span>

          <span className="font-bold text-yellow-400">
            ${pagado.toLocaleString("es-MX")}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-500">💰 Saldo</span>

          <span
            className={`font-bold ${
              saldo <= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            ${saldo.toLocaleString("es-MX")}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-500">📅 Entrega</span>

          <span>{proyecto.fechaEntrega || "--"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-500">🚚 Tipo</span>

          <span>{proyecto.tipoEntrega || "--"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <EcoButton variant="success" onClick={abrirWhatsapp}>
          📱 WhatsApp
        </EcoButton>

        <Link to={`/proyectos/${proyecto.id}`}>
          <EcoButton className="w-full">
            📂 Abrir
          </EcoButton>
        </Link>
      </div>

      <button
        onClick={() => onDelete(proyecto)}
        className="mt-4 w-full text-red-400 hover:text-red-300 font-bold"
      >
        🗑 Eliminar proyecto
      </button>
    </EcoCard>
  );
}

export default ProyectoCard;