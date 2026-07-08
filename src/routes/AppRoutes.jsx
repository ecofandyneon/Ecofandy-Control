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
import RenderAI from "../Pages/RenderAI";
import BibliotecaProductos from "../Pages/BibliotecaProductos";
import RecetaNeonLED from "../Pages/RecetaNeonLED";
import Articulos from "../Pages/Articulos";
import CotizadorNeon from "../Pages/CotizadorNeon";
import NuevaCotizacion from "../Pages/NuevaCotizacion";

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
          <Route path="/render-ai" element={<RenderAI />} />
          <Route path="/biblioteca-productos" element={<BibliotecaProductos />} />
          <Route path="/biblioteca-productos/neon-led" element={<RecetaNeonLED />} />
          <Route path="/articulos" element={<Articulos />} />
          <Route path="/cotizador-neon" element={<CotizadorNeon />} />
          <Route path="/nueva-cotizacion" element={<NuevaCotizacion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;