import { Link } from "react-router-dom";
import EstadoBadge from "./EstadoBadge";
import EcoButton from "../NeonUI/EcoButton";
import EcoCard from "../NeonUI/EcoCard";
import EcoProgress from "../NeonUI/EcoProgress";
import { calcularAvance } from "../../Utils/calcularAvance";

function ProyectoCard({ proyecto }) {
  const saldo = Number(proyecto.saldo || 0);
  const avance = calcularAvance(proyecto.estado);

  const abrirWhatsapp = () => {
    const numero = (proyecto.whatsapp || "").replace(/\D/g, "");

    if (!numero) return;

    window.open(`https://wa.me/52${numero}`, "_blank");
  };

  return (
    <EcoCard>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-purple-400">
          {proyecto.codigo || "Sin código"}
        </h2>

        <EstadoBadge estado={proyecto.estado} />
      </div>

      {/* Cliente */}
      <h3 className="text-xl font-bold text-white capitalize">
        {proyecto.cliente}
      </h3>

      {/* Proyecto */}
      <p className="text-zinc-400 mt-1 mb-5">
        {proyecto.proyecto}
      </p>

      {/* Barra de progreso */}
      <div className="mb-6">
        <EcoProgress value={avance} />
      </div>

      {/* Información */}
      <div className="space-y-3">

        <div className="flex justify-between">
          <span className="text-zinc-500">💰 Saldo</span>

          <span className="font-bold text-green-400">
            ${saldo.toLocaleString("es-MX")}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-500">📅 Entrega</span>

          <span>
            {proyecto.fechaEntrega || "--"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-500">🚚 Tipo</span>

          <span>
            {proyecto.tipoEntrega || "--"}
          </span>
        </div>

      </div>

      {/* Botones */}
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

    </EcoCard>
  );
}

export default ProyectoCard;