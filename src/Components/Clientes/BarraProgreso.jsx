function BarraProgreso({ estado = "Cotización" }) {
  const estados = {
    "Cotización": 15,
    "Render aprobado": 30,
    "SVG generado": 45,
    "Materiales listos": 60,
    "Producción": 80,
    "Entregado": 100,
    "Cancelado": 100,
  };

  const colores = {
    "Cotización": "bg-yellow-500",
    "Render aprobado": "bg-blue-500",
    "SVG generado": "bg-cyan-500",
    "Materiales listos": "bg-purple-500",
    "Producción": "bg-orange-500",
    "Entregado": "bg-green-500",
    "Cancelado": "bg-red-500",
  };

  const porcentaje = estados[estado] || 15;
  const color = colores[estado] || "bg-yellow-500";

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{estado}</span>
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