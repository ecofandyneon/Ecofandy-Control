function EstadoBadge({ estado }) {
  const colores = {
    "Idea recibida": "bg-slate-600 text-white",
    "Diseño / Render": "bg-fuchsia-600 text-white",
    "Aprobado": "bg-blue-600 text-white",
    "Corte": "bg-yellow-500 text-black",
    "Armado LED": "bg-orange-500 text-white",
    "Pruebas": "bg-cyan-600 text-white",
    "Finalizado": "bg-green-600 text-white",
    "Empaque": "bg-indigo-600 text-white",
    "Entregado": "bg-emerald-600 text-white",
    "Liquidado": "bg-purple-700 text-white",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-bold ${
        colores[estado] || "bg-zinc-700 text-white"
      }`}
    >
      {estado}
    </span>
  );
}

export default EstadoBadge;