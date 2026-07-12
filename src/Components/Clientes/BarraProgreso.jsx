import { calcularAvance } from "../../Utils/calcularAvance";

function BarraProgreso({ estado = "" }) {
  const porcentaje = calcularAvance(estado);

  const obtenerColor = () => {
    if (porcentaje >= 100) return "bg-green-500";
    if (porcentaje >= 80) return "bg-cyan-500";
    if (porcentaje >= 65) return "bg-purple-500";
    if (porcentaje >= 45) return "bg-orange-500";
    if (porcentaje >= 30) return "bg-blue-500";

    return "bg-yellow-500";
  };

  const color = obtenerColor();

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{estado || "Sin estado"}</span>
        <span>{porcentaje}%</span>
      </div>

      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`${color} h-full transition-all duration-500`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}

export default BarraProgreso;