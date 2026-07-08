function ListaMaterialesProyecto({ materiales, onEliminar }) {
  const total = materiales.reduce(
    (suma, material) => suma + Number(material.total || 0),
    0
  );

  return (
    <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-2">
      <h2 className="text-xl font-bold text-purple-400 mb-5">
        📦 Materiales agregados
      </h2>

      <div className="space-y-3">
        {materiales.map((material, index) => (
          <div
            key={`${material.articuloId}-${index}`}
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex justify-between gap-4"
          >
            <div>
              <p className="font-bold text-white">{material.nombre}</p>
              <p className="text-sm text-zinc-500">
                {material.descripcionCantidad}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-green-400">
                ${Number(material.total || 0).toLocaleString("es-MX")}
              </p>

              <button
                type="button"
                onClick={() => onEliminar(index)}
                className="text-red-400 hover:text-red-300 text-sm font-bold"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}

        {materiales.length === 0 && (
          <p className="text-zinc-500 text-center py-8">
            Aún no has agregado materiales.
          </p>
        )}
      </div>

      <div className="border-t border-zinc-800 mt-5 pt-5 flex justify-between">
        <span className="text-zinc-400">Total materiales</span>
        <strong className="text-green-400 text-xl">
          ${total.toLocaleString("es-MX")}
        </strong>
      </div>
    </div>
  );
}

export default ListaMaterialesProyecto;