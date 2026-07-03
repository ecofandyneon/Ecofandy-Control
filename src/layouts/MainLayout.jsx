function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-zinc-900 text-white">
      {/* Menú lateral */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6">
        <h1 className="text-2xl font-bold text-pink-500">
          ECOFANDY
        </h1>

        <p className="text-sm text-zinc-400 mb-8">
          CONTROL
        </p>

        <nav className="space-y-3">
          <button className="w-full text-left hover:text-pink-400">
            🏠 Dashboard
          </button>

          <button className="w-full text-left hover:text-pink-400">
            📋 Pedidos
          </button>

          <button className="w-full text-left hover:text-pink-400">
            ➕ Nuevo Pedido
          </button>

          <button className="w-full text-left hover:text-pink-400">
            👥 Clientes
          </button>

          <button className="w-full text-left hover:text-pink-400">
            🏭 Producción
          </button>

          <button className="w-full text-left hover:text-pink-400">
            ⚙️ Configuración
          </button>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;