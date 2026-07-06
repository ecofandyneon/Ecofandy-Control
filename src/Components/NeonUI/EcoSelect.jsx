function EcoSelect({
  label,
  name,
  value,
  onChange,
  children,
  className = "",
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-zinc-300 font-semibold">
          {label}
        </label>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`
          w-full
          bg-zinc-900
          border
          border-zinc-700
          rounded-xl
          px-4
          py-3
          text-white
          outline-none
          transition-all
          duration-300
          focus:border-purple-500
          focus:shadow-[0_0_15px_rgba(124,58,237,.35)]
          ${className}
        `}
      >
        {children}
      </select>
    </div>
  );
}

export default EcoSelect;