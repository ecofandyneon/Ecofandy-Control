import { Link } from "react-router-dom";
import EstadoBadge from "./EstadoBadge";
import EcoButton from "../NeonUI/EcoButton";
import EcoCard from "../NeonUI/EcoCard";
import EcoProgress from "../NeonUI/EcoProgress";
import { calcularAvance } from "../../Utils/calcularAvance";

function ProyectoCard({ proyecto, onDelete }) {
  const avance = calcularAvance(proyecto.estado);

  const cotizacion = proyecto.cotizacionRelacionada;

  const total = Number(
    cotizacion?.precioFinal ||
      cotizacion?.precioVenta ||
      proyecto.precioFinal ||
      proyecto.precioVenta ||
      0
  );

  const pagos = Array.isArray(cotizacion?.pagos)
    ? cotizacion.pagos
    : [];

  const pagado = pagos.reduce(
    (suma, pago) => suma + Number(pago.monto || 0),
    0
  );

  const saldo = Math.max(total - pagado, 0);

  const estadoPago =
    total > 0 && saldo <= 0
      ? "LIQUIDADO"
      : pagado > 0
        ? "PAGO PARCIAL"
        : "SIN PAGO";

  const clasePago =
    estadoPago === "LIQUIDADO"
      ? "bg-green-950/60 border-green-500 text-green-300"
      : estadoPago === "PAGO PARCIAL"
        ? "bg-yellow-950/60 border-yellow-500 text-yellow-300"
        : "bg-red-950/60 border-red-500 text-red-300";

  const abrirWhatsapp = () => {
    const numero = String(proyecto.whatsapp || "").replace(
      /\D/g,
      ""
    );

    if (!numero) return;

    const numeroWhatsApp =
      numero.length === 10 ? `52${numero}` : numero;

    window.open(
      `https://wa.me/${numeroWhatsApp}`,
      "_blank"
    );
  };

  return (
    <EcoCard>
      <div className="flex justify-between items-start gap-3 mb-4">
        <h2 className="text-2xl font-bold text-purple-400">
          {proyecto.codigo ||
            proyecto.folio ||
            proyecto.folioCotizacion ||
            "Sin código"}
        </h2>

        <EstadoBadge estado={proyecto.estado} />
      </div>

      <h3 className="text-xl font-bold text-white capitalize">
        {proyecto.cliente || "Sin cliente"}
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
          <span className="text-zinc-500">
            💵 Total
          </span>

          <span className="font-bold text-white">
            ${total.toLocaleString("es-MX")}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-500">
            💳 Pagado
          </span>

          <span className="font-bold text-yellow-300">
            ${pagado.toLocaleString("es-MX")}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-500">
            💰 Saldo
          </span>

          <span
            className={`font-bold ${
              saldo <= 0
                ? "text-green-400"
                : "text-red-300"
            }`}
          >
            ${saldo.toLocaleString("es-MX")}
          </span>
        </div>

        <div
          className={`border rounded-xl px-3 py-2 text-center text-sm font-bold ${clasePago}`}
        >
          {estadoPago}
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-500">
            📅 Entrega
          </span>

          <span>{proyecto.fechaEntrega || "--"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-500">
            🚚 Tipo
          </span>

          <span>{proyecto.tipoEntrega || "--"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <EcoButton
          variant="success"
          onClick={abrirWhatsapp}
        >
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