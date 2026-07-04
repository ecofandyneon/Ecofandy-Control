function Header() {
  const fecha = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="flex justify-between items-center bg-zinc-900 border-b border-pink-500 px-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-pink-500">
          Ecofandy Control
        </h1>
        <p className="text-gray-400 text-sm capitalize">{fecha}</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-white">👤 Fabián</span>

        <button className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg font-semibold">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default Header;