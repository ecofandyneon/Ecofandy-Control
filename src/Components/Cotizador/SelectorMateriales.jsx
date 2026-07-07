import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../Services/firebase";

function SelectorMateriales({ materiales, setMateriales }) {
  const [articulos, setArticulos] = useState([]);
  const [articuloId, setArticuloId] = useState("");
  const [cantidad, setCantidad] = useState("");

  useEffect(() => {
    const cargarArticulos = async () => {
      const q = query(collection(db, "articulos"), orderBy("nombre", "asc"));
      const snapshot = await getDocs(q);

      setArticulos(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    };

    cargarArticulos();
  }, []);

  const agregarMaterial = () => {
    const articulo = articulos.find((item) => item.id === articuloId);

    if (!articulo || !cantidad) return;

    const precio = Number(articulo.precio || 0);
    const cantidadNumero = Number(cantidad || 0);

    setMateriales([
      ...materiales,
      {
        articuloId: articulo.id,
        nombre: articulo.nombre,
        categoria: articulo.categoria,
        unidad: articulo.unidad,
        precio,
        cantidad: cantidadNumero,
        total: precio * cantidadNumero,
      },
    ]);

    setArticuloId("");
    setCantidad("");
  };

  const eliminarMaterial = (index) => {
    setMateriales(materiales.filter((_, i) => i !== index));
  };

  const totalMateriales = materiales.reduce(
    (total, item) => total + Number(item.total || 0),
    0
  );

  return (
    <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6 xl:col-span-2">
      <h2 className="text-xl font-bold text-purple-400 mb-5">
        📦 Materiales del proyecto
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <select
          className="input md:col-span-2"
          value={articuloId}
          onChange={(e) => setArticuloId(e.target.value)}
        >
          <option value="">Seleccionar artículo...</option>
          {articulos.map((articulo) => (
            <option key={articulo.id} value={articulo.id}>
              {articulo.nombre} - ${Number(articulo.precio || 0).toLocaleString("es-MX")} / {articulo.unidad}
            </option>
          ))}
        </select>

        <input
          className="input"
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder="Cantidad"
        />
      </div>

      <button
        type="button"
        onClick={agregarMaterial}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl mb-5"
      >
        ➕ Agregar material
      </button>

      <div className="space-y-3">
        {materiales.map((item, index) => (
          <div
            key={`${item.articuloId}-${index}`}
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex justify-between gap-4"
          >
            <div>
              <p className="font-bold text-white">{item.nombre}</p>
              <p className="text-sm text-zinc-500">
                {item.cantidad} {item.unidad} × ${item.precio.toLocaleString("es-MX")}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-green-400">
                ${item.total.toLocaleString("es-MX")}
              </p>

              <button
                type="button"
                onClick={() => eliminarMaterial(index)}
                className="text-red-400 hover:text-red-300 text-sm font-bold"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}

        {materiales.length === 0 && (
          <p className="text-zinc-500 text-center py-6">
            Aún no has agregado materiales.
          </p>
        )}
      </div>

      <div className="border-t border-zinc-800 mt-5 pt-5 flex justify-between">
        <span className="text-zinc-400">Total materiales</span>
        <strong className="text-green-400 text-xl">
          ${totalMateriales.toLocaleString("es-MX")}
        </strong>
      </div>
    </div>
  );
}

export default SelectorMateriales;