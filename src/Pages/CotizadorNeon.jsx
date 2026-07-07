import { useState } from "react";
import { calcularCotizacionNeon } from "../Utils/motorEcofandy";
import ModalAgregarMaterial from "../Components/Proyecto/ModalAgregarMaterial";
import EcoButton from "../Components/NeonUI/EcoButton";

function CotizadorNeon() {
  const [modalMaterial, setModalMaterial] = useState(false);

  const [form, setForm] = useState({
    ancho: 80,
    alto: 40,
    margen: 2,
    metrosNeon: 5,
    precioMetroNeon: 185,
    costoAcrilico: 250,
    costoFuente: 220,
    costoCable: 40,
    costoConectores: 30,
    costoConsumibles: 80,
    costoFabricacion: 600,
    utilidadPorcentaje: 60,
  });

  const actualizar = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resultado = calcularCotizacionNeon(form);

  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500">
        🧠 Cotizador Neón LED
      </h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Prueba del Motor Ecofandy para calcular materiales, costo y precio de venta.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            Datos del letrero
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input" name="ancho" type="number" value={form.ancho} onChange={actualizar} placeholder="Ancho acrílico cm" />
            <input className="input" name="alto" type="number" value={form.alto} onChange={actualizar} placeholder="Alto acrílico cm" />
            <input className="input" name="margen" type="number" value={form.margen} onChange={actualizar} placeholder="Margen interior cm" />
            <input className="input" name="metrosNeon" type="number" value={form.metrosNeon} onChange={actualizar} placeholder="Metros de neón" />

            <input className="input" name="precioMetroNeon" type="number" value={form.precioMetroNeon} onChange={actualizar} placeholder="Precio por metro de neón" />
            <input className="input" name="costoAcrilico" type="number" value={form.costoAcrilico} onChange={actualizar} placeholder="Costo acrílico" />
            <input className="input" name="costoFuente" type="number" value={form.costoFuente} onChange={actualizar} placeholder="Costo fuente" />
            <input className="input" name="costoCable" type="number" value={form.costoCable} onChange={actualizar} placeholder="Costo cable" />

            <input className="input" name="costoConectores" type="number" value={form.costoConectores} onChange={actualizar} placeholder="Costo conectores" />
            <input className="input" name="costoConsumibles" type="number" value={form.costoConsumibles} onChange={actualizar} placeholder="Consumibles" />
            <input className="input" name="costoFabricacion" type="number" value={form.costoFabricacion} onChange={actualizar} placeholder="Fabricación" />
            <input className="input" name="utilidadPorcentaje" type="number" value={form.utilidadPorcentaje} onChange={actualizar} placeholder="Utilidad %" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            Resultado
          </h2>

          <div className="space-y-4">
            <div className="bg-zinc-950 rounded-xl p-4">
              <p className="text-zinc-400 text-sm">Acrílico</p>
              <p className="text-2xl font-bold">
                {resultado.medidas.anchoAcrilico} × {resultado.medidas.altoAcrilico} cm
              </p>
            </div>

            <div className="bg-zinc-950 rounded-xl p-4">
              <p className="text-zinc-400 text-sm">Área útil para neón</p>
              <p className="text-2xl font-bold">
                {resultado.medidas.anchoUtil} × {resultado.medidas.altoUtil} cm
              </p>
              <p className="text-zinc-500 text-sm">
                Margen interior: {resultado.medidas.margenInterior} cm
              </p>
            </div>

            <div className="bg-zinc-950 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Neón</span>
                <strong>${resultado.costoNeon.toLocaleString("es-MX")}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Materiales</span>
                <strong>${resultado.costoMateriales.toLocaleString("es-MX")}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">Fabricación</span>
                <strong>${resultado.costoFabricacion.toLocaleString("es-MX")}</strong>
              </div>

              <div className="flex justify-between border-t border-zinc-800 pt-2">
                <span className="text-zinc-400">Costo total</span>
                <strong>${resultado.costoTotal.toLocaleString("es-MX")}</strong>
              </div>
            </div>

            <div className="bg-purple-600/20 text-purple-300 rounded-xl p-4">
              <p className="text-sm">Precio de venta sugerido</p>
              <p className="text-4xl font-bold">
                ${Math.round(resultado.precioVenta).toLocaleString("es-MX")}
              </p>
              <p className="text-sm mt-2">
                Utilidad: ${Math.round(resultado.utilidad).toLocaleString("es-MX")}
              </p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <EcoButton
            type="button"
            className="w-full"
            onClick={() => setModalMaterial(true)}
          >
            ➕ Agregar Material
          </EcoButton>
        </div>
      </div>

      <ModalAgregarMaterial
        abierto={modalMaterial}
        onClose={() => setModalMaterial(false)}
      />
    </div>
  );
}

export default CotizadorNeon;