function EstadoBadge({ estado = "Cotización" }) {
  const estilos = {
    "Cotización": "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    "Render aprobado": "bg-blue-500/20 text-blue-300 border-blue-500/40",
    "SVG generado": "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    "Materiales listos": "bg-purple-500/20 text-purple-300 border-purple-500/40",
    "Producción": "bg-orange-500/20 text-orange-300 border-orange-500/40",
    "Entregado": "bg-green-500/20 text-green-300 border-green-500/40",
    "Cancelado": "bg-red-500/20 text-red-300 border-red-500/40",
  };

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
        estilos[estado] ||
        "bg-zinc-700 text-zinc-300 border-zinc-600"
      }`}
    >
      {estado.toUpperCase()}
    </span>
  );
}

export default EstadoBadge;