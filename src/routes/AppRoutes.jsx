import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../Pages/Dashboard";
import Pedidos from "../Pages/Pedidos";
import NuevoPedido from "../Pages/NuevoPedido";
import Clientes from "../Pages/Clientes";
import Produccion from "../Pages/Produccion";
import Configuracion from "../Pages/Configuracion";
import Proyectos from "../Pages/Proyectos";
import DetalleProyecto from "../Pages/DetalleProyecto";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/proyectos/nuevo" element={<NuevoPedido />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/produccion" element={<Produccion />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/proyectos/:id" element={<DetalleProyecto />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;