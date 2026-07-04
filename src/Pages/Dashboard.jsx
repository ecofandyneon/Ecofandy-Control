function Dashboard() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500">
        Dashboard
      </h1>

      <p className="text-zinc-400 mt-2">
        Bienvenido a Ecofandy Control.
      </p>

      <div className="grid grid-cols-4 gap-6 mt-10">
        <div className="bg-zinc-800 rounded-xl p-6">
          <h2 className="text-zinc-400">Proyectos</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6">
          <h2 className="text-zinc-400">Clientes</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6">
          <h2 className="text-zinc-400">Producción</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6">
          <h2 className="text-zinc-400">Entregados</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;