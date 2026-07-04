import { Outlet, NavLink } from "react-router-dom";
import logo from "../assets/logo.svg";

function MainLayout() {
  const menuItems = [
    { path: "/", label: "Dashboard", icon: "🏠" },
    { path: "/proyectos", label: "Proyectos", icon: "📂" },
    { path: "/proyectos/nuevo", label: "Nuevo Proyecto", icon: "➕" },
    { path: "/clientes", label: "Clientes", icon: "👥" },
    { path: "/produccion", label: "Producción", icon: "🏭" },
    { path: "/configuracion", label: "Configuración", icon: "⚙️" },
  ];

  return (
    <div className="flex min-h-screen bg-[#09090B] text-white">
      <aside className="w-72 bg-zinc-950 border-r border-purple-700/40 p-6 shadow-[0_0_30px_rgba(124,58,237,0.25)]">
        <div className="text-center mb-10">
          <img
            src={logo}
            alt="Ecofandy Neón"
            className="w-36 mx-auto mb-4 drop-shadow-[0_0_18px_rgba(168,85,247,0.9)]"
          />

          <h1 className="text-xl font-bold text-purple-400">
            Ecofandy Control
          </h1>

          <p className="text-xs tracking-[0.25em] text-zinc-400 mt-2">
            ILUMINAMOS TUS IDEAS
          </p>
        </div>

        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-[0_0_18px_rgba(124,58,237,0.65)]"
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-purple-300"
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;