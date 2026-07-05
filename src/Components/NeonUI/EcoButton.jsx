function EcoButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
}) {
  const variants = {
    primary:
      "bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_18px_rgba(124,58,237,.35)]",

    success:
      "bg-green-600 hover:bg-green-700 text-white shadow-[0_0_18px_rgba(34,197,94,.35)]",

    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-[0_0_18px_rgba(239,68,68,.35)]",

    secondary:
      "bg-zinc-800 hover:bg-zinc-700 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        px-5
        py-3
        rounded-xl
        font-bold
        transition-all
        duration-300
        hover:-translate-y-0.5
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default EcoButton;