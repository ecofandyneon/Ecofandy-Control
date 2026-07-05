function EcoProgress({ value = 0 }) {
  const porcentaje = Math.min(Math.max(value, 0), 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-zinc-400 mb-2">
        <span>Avance</span>
        <span>{porcentaje}%</span>
      </div>

      <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 rounded-full shadow-[0_0_14px_rgba(124,58,237,0.75)] transition-all duration-500"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}

export default EcoProgress;