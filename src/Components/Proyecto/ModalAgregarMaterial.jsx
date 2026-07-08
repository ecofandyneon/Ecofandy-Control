import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../Services/firebase";
import EcoButton from "../NeonUI/EcoButton";
import { calcularAcrilico } from "../../Utils/motorEcofandy";

function ModalAgregarMaterial({ abierto, onClose, onAgregar }) {
  const [articulos, setArticulos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);

  const [cantidad, setCantidad] = useState("");
  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");

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

    if (abierto) cargarArticulos();
  }, [abierto]);

  if (!abierto) return null;

  const limpiar = () => {
    setBusqueda("");
    setSeleccionado(null);
    setCantidad("");
    setAncho("");
    setAlto("");
  };

  const cerrar = () => {
    limpiar();
    onClose();
  };

  const esAcrilico =
    seleccionado?.categoria === "Acrílicos" || seleccionado?.unidad === "Hoja";

  const articulosFiltrados = articulos.filter((articulo) => {
    const texto = `${articulo.nombre} ${articulo.categoria} ${articulo.proveedor}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const agregar = () => {
    if (!seleccionado) return;

    let total = 0;
    let descripcionCantidad = "";

    if (esAcrilico) {
      const calculo = calcularAcrilico({
        costoHoja: seleccionado.precio,
        anchoHoja: seleccionado.anchoHoja || 122,
        altoHoja: seleccionado.altoHoja || 244,
        porcentajeCorte: seleccionado.porcentajeCorte || 20,
        anchoPieza: ancho,
        altoPieza: alto,
      });

      total = calculo.costoConCorte;
      descripcionCantidad = `${ancho} x ${alto} cm`;
    } else {
      total = Number(seleccionado.precio || 0) * Number(cantidad || 0);
      descripcionCantidad = `${cantidad} ${seleccionado.unidad || ""}`;
    }

    onAgregar({
      articuloId: seleccionado.id,
      nombre: seleccionado.nombre,
      categoria: seleccionado.categoria,
      unidad: seleccionado.unidad,
      precioUnitario: Number(seleccionado.precio || 0),
      cantidad: esAcrilico ? 1 : Number(cantidad || 0),
      ancho: esAcrilico ? Number(ancho || 0) : null,
      alto: esAcrilico ? Number(alto || 0) : null,
      descripcionCantidad,
      total,
    });

    cerrar();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-zinc-900 border border-purple-700 rounded-2xl w-full max-w-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-400">
            📦 Agregar material
          </h2>

          <button
            onClick={cerrar}
            className="text-zinc-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {!seleccionado ? (
          <>
            <input
              className="input w-full mb-5"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar material..."
              autoFocus
            />

            <div className="max-h-96 overflow-y-auto space-y-3">
              {articulosFiltrados.map((articulo) => (
                <button
                  key={articulo.id}
                  type="button"
                  onClick={() => setSeleccionado(articulo)}
                  className="w-full text-left bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-4"
                >
                  <p className="font-bold text-white">{articulo.nombre}</p>
                  <p className="text-sm text-zinc-400">
                    {articulo.categoria} · ${Number(articulo.precio || 0).toLocaleString("es-MX")} / {articulo.unidad}
                  </p>
                </button>
              ))}

              {articulosFiltrados.length === 0 && (
                <p className="text-zinc-500 text-center py-8">
                  No se encontraron artículos.
                </p>
              )}
            </div>
          </>
        ) : (
          <div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-5">
              <p className="text-zinc-400 text-sm">Material seleccionado</p>
              <p className="text-xl font-bold text-white">
                {seleccionado.nombre}
              </p>
              <p className="text-green-400 font-bold">
                ${Number(seleccionado.precio || 0).toLocaleString("es-MX")} / {seleccionado.unidad}
              </p>
            </div>

            {esAcrilico ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="input"
                  type="number"
                  value={ancho}
                  onChange={(e) => setAncho(e.target.value)}
                  placeholder="Ancho de pieza cm"
                />

                <input
                  className="input"
                  type="number"
                  value={alto}
                  onChange={(e) => setAlto(e.target.value)}
                  placeholder="Alto de pieza cm"
                />
              </div>
            ) : (
              <input
                className="input w-full"
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder={`Cantidad en ${seleccionado.unidad}`}
              />
            )}

            <div className="flex justify-end gap-3 mt-6">
              <EcoButton
                type="button"
                variant="secondary"
                onClick={() => setSeleccionado(null)}
              >
                Regresar
              </EcoButton>

              <EcoButton type="button" onClick={agregar}>
                Agregar
              </EcoButton>
            </div>
          </div>
        )}

        {!seleccionado && (
          <div className="flex justify-end mt-6">
            <EcoButton type="button" variant="secondary" onClick={cerrar}>
              Cancelar
            </EcoButton>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModalAgregarMaterial;