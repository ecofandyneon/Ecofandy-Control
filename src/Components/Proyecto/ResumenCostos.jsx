function ResumenCostos({ materiales, manoObra = 0, utilidad = 60 }) {
  const totalMateriales = materiales.reduce(
    (suma, material) => suma + Number(material.total || 0),
    0
  );

  const ganancia = totalMateriales * (Number(utilidad || 0) / 100);
  const precioVenta = totalMateriales + ganancia + Number(manoObra || 0);

  return (
    <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-purple-400 mb-5">
        💰 Resumen de costos
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-zinc-400">Materiales</span>
          <strong>${totalMateriales.toLocaleString("es-MX")}</strong>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">Utilidad ({utilidad}%)</span>
          <strong className="text-yellow-400">
            ${ganancia.toLocaleString("es-MX")}
          </strong>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">Mano de obra</span>
          <strong>${Number(manoObra || 0).toLocaleString("es-MX")}</strong>
        </div>

        <div className="border-t border-zinc-800 pt-4 flex justify-between text-2xl">
          <span className="font-bold text-purple-300">Precio de venta</span>
          <span className="font-bold text-green-400">
            ${precioVenta.toLocaleString("es-MX")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ResumenCostos;