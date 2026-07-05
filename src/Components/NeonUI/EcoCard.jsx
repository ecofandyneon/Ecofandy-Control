function EcoCard({ children, className = "" }) {
  return (
    <div
      className={`
        bg-zinc-900
        border
        border-purple-700/40
        rounded-2xl
        p-6
        shadow-[0_0_20px_rgba(124,58,237,0.18)]
        hover:shadow-[0_0_35px_rgba(124,58,237,0.30)]
        hover:-translate-y-1
        transition-all
        duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default EcoCard;