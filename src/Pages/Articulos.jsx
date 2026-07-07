import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../Services/firebase";
import Swal from "sweetalert2";

import EcoCard from "../Components/NeonUI/EcoCard";
import EcoInput from "../Components/NeonUI/EcoInput";
import EcoSelect from "../Components/NeonUI/EcoSelect";
import EcoButton from "../Components/NeonUI/EcoButton";

function Articulos() {
  const [articulos, setArticulos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    categoria: "Iluminación",
    proveedor: "",
    unidad: "Metro",
    precio: "",
    consumible: "No",
    notas: "",
    anchoHoja: "",
    altoHoja: "",
    porcentajeCorte: "",
    espesor: "",
    voltaje: "",
    amperaje: "",
    consumoPorMetro: "",
  });

  const actualizarCampo = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const cargarArticulos = async () => {
    const q = query(collection(db, "articulos"), orderBy("creadoEn", "desc"));
    const snapshot = await getDocs(q);

    const lista = snapshot.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));

    setArticulos(lista);
  };

  useEffect(() => {
    cargarArticulos();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      categoria: "Iluminación",
      proveedor: "",
      unidad: "Metro",
      precio: "",
      consumible: "No",
      notas: "",
      anchoHoja: "",
      altoHoja: "",
      porcentajeCorte: "",
      espesor: "",
      voltaje: "",
      amperaje: "",
      consumoPorMetro: "",
    });

    setEditandoId(null);
  };

  const guardarArticulo = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Falta el nombre",
        text: "Escribe el nombre del artículo.",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    try {
      const datos = {
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        proveedor: form.proveedor,
        unidad: form.unidad,
        precio: Number(form.precio || 0),
        consumible: form.consumible === "Sí",
        notas: form.notas,
        actualizadoEn: serverTimestamp(),
        anchoHoja: Number(form.anchoHoja || 0),
        altoHoja: Number(form.altoHoja || 0),
        porcentajeCorte: Number(form.porcentajeCorte || 0),
        espesor: form.espesor,
        voltaje: form.voltaje,
        amperaje: form.amperaje,
        consumoPorMetro: Number(form.consumoPorMetro || 0),
      };

      if (editandoId) {
        await updateDoc(doc(db, "articulos", editandoId), datos);

        Swal.fire({
          icon: "success",
          title: "Artículo actualizado",
          confirmButtonColor: "#7C3AED",
        });
      } else {
        await addDoc(collection(db, "articulos"), {
          ...datos,
          creadoEn: serverTimestamp(),
        });

        Swal.fire({
          icon: "success",
          title: "Artículo guardado",
          confirmButtonColor: "#7C3AED",
        });
      }

      limpiarFormulario();
      cargarArticulos();
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el artículo.",
        confirmButtonColor: "#7C3AED",
      });
    }
  };

  const editarArticulo = (articulo) => {
    setEditandoId(articulo.id);

    setForm({
      nombre: articulo.nombre || "",
      categoria: articulo.categoria || "Iluminación",
      proveedor: articulo.proveedor || "",
      unidad: articulo.unidad || "Metro",
      precio: articulo.precio || "",
      consumible: articulo.consumible ? "Sí" : "No",
      notas: articulo.notas || "",
      anchoHoja: articulo.anchoHoja || "",
      altoHoja: articulo.altoHoja || "",
      porcentajeCorte: articulo.porcentajeCorte || "",
      espesor: articulo.espesor || "",
      voltaje: articulo.voltaje || "",
      amperaje: articulo.amperaje || "",
      consumoPorMetro: articulo.consumoPorMetro || "",
    });
  };

  const eliminarArticulo = async (articulo) => {
    const confirmar = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar artículo?",
      text: `Se eliminará ${articulo.nombre}.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#7C3AED",
    });

    if (!confirmar.isConfirmed) return;

    await deleteDoc(doc(db, "articulos", articulo.id));

    Swal.fire({
      icon: "success",
      title: "Artículo eliminado",
      confirmButtonColor: "#7C3AED",
    });

    cargarArticulos();
  };

  const articulosFiltrados = articulos.filter((articulo) => {
    const texto = `
      ${articulo.nombre || ""}
      ${articulo.categoria || ""}
      ${articulo.proveedor || ""}
      ${articulo.unidad || ""}
    `.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-500">
        📦 Artículos
      </h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Base de precios de materiales, consumibles y servicios para cotizar más rápido.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={guardarArticulo}>
          <EcoCard>
            <h2 className="text-xl font-bold text-purple-400 mb-5">
              {editandoId ? "Editar artículo" : "Nuevo artículo"}
            </h2>

            <div className="space-y-4">
              <EcoInput
                label="Nombre del artículo"
                name="nombre"
                value={form.nombre}
                onChange={actualizarCampo}
                placeholder="Ej. Neón LED Blanco Cálido 5 mm"
              />

              <EcoSelect
                label="Categoría"
                name="categoria"
                value={form.categoria}
                onChange={actualizarCampo}
              >
                <option>Iluminación</option>
                <option>Acrílicos</option>
                <option>Componentes eléctricos</option>
                <option>Acabados</option>
                <option>Consumibles</option>
                <option>Ferretería</option>
                <option>Material estructural</option>
                <option>Herramientas</option>
                <option>Servicios</option>
                <option>Otros</option>
              </EcoSelect>

              <EcoInput
                label="Proveedor"
                name="proveedor"
                value={form.proveedor}
                onChange={actualizarCampo}
                placeholder="Ej. LED y Luz"
              />
              <div className="border-t border-zinc-800 pt-4">
  <h3 className="text-purple-400 font-bold mb-3">
    ⚙ Datos técnicos opcionales
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <EcoInput
      label="Ancho hoja cm"
      name="anchoHoja"
      type="number"
      value={form.anchoHoja}
      onChange={actualizarCampo}
      placeholder="122"
    />

    <EcoInput
      label="Alto hoja cm"
      name="altoHoja"
      type="number"
      value={form.altoHoja}
      onChange={actualizarCampo}
      placeholder="244"
    />

    <EcoInput
      label="% Corte"
      name="porcentajeCorte"
      type="number"
      value={form.porcentajeCorte}
      onChange={actualizarCampo}
      placeholder="20"
    />

    <EcoInput
      label="Espesor"
      name="espesor"
      value={form.espesor}
      onChange={actualizarCampo}
      placeholder="3 mm"
    />

    <EcoInput
      label="Voltaje"
      name="voltaje"
      value={form.voltaje}
      onChange={actualizarCampo}
      placeholder="12V"
    />

    <EcoInput
      label="Amperaje"
      name="amperaje"
      value={form.amperaje}
      onChange={actualizarCampo}
      placeholder="5A"
    />

    <EcoInput
      label="Consumo por metro"
      name="consumoPorMetro"
      type="number"
      value={form.consumoPorMetro}
      onChange={actualizarCampo}
      placeholder="10"
    />
  </div>
</div>

              <EcoSelect
                label="Unidad"
                name="unidad"
                value={form.unidad}
                onChange={actualizarCampo}
              >
                <option>Metro</option>
                <option>Pieza</option>
                <option>Hoja</option>
                <option>Rollo</option>
                <option>Litro</option>
                <option>Mililitro</option>
                <option>Gramo</option>
                <option>Kilo</option>
                <option>Servicio</option>
              </EcoSelect>

              <EcoInput
                label="Precio"
                name="precio"
                type="number"
                value={form.precio}
                onChange={actualizarCampo}
                placeholder="0"
              />

              <EcoSelect
                label="¿Es consumible?"
                name="consumible"
                value={form.consumible}
                onChange={actualizarCampo}
              >
                <option>No</option>
                <option>Sí</option>
              </EcoSelect>

              <textarea
                className="input min-h-28"
                name="notas"
                value={form.notas}
                onChange={actualizarCampo}
                placeholder="Notas del artículo..."
              />

              <EcoButton type="submit" className="w-full">
                {editandoId ? "💾 Actualizar artículo" : "💜 Guardar artículo"}
              </EcoButton>

              {editandoId && (
                <EcoButton
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={limpiarFormulario}
                >
                  Cancelar edición
                </EcoButton>
              )}
            </div>
          </EcoCard>
        </form>

        <div className="xl:col-span-2">
          <EcoCard>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-purple-400">
                  Artículos registrados
                </h2>

                <p className="text-zinc-500 text-sm">
                  {articulosFiltrados.length} artículos encontrados
                </p>
              </div>

              <input
                className="input md:max-w-xs"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar artículo..."
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-950 text-purple-400">
                  <tr>
                    <th className="p-4">Artículo</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Proveedor</th>
                    <th className="p-4">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {articulosFiltrados.map((articulo) => (
                    <tr
                      key={articulo.id}
                      className="border-t border-zinc-800 hover:bg-zinc-800"
                    >
                      <td className="p-4">
                        <p className="font-bold text-white">
                          {articulo.nombre}
                        </p>

                        <p className="text-sm text-zinc-500">
                          {articulo.consumible ? "🧪 Consumible" : "📦 Artículo"} · {articulo.unidad}
                        </p>
                      </td>

                      <td className="p-4">{articulo.categoria}</td>

                      <td className="p-4 font-bold text-green-400">
                        ${Number(articulo.precio || 0).toLocaleString("es-MX")}
                      </td>

                      <td className="p-4">
                        {articulo.proveedor || "Sin proveedor"}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => editarArticulo(articulo)}
                            className="text-purple-400 hover:text-purple-300 font-bold"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => eliminarArticulo(articulo)}
                            className="text-red-400 hover:text-red-300 font-bold"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {articulosFiltrados.length === 0 && (
                    <tr>
                      <td className="p-4 text-zinc-400" colSpan="5">
                        Aún no hay artículos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </EcoCard>
        </div>
      </div>
    </div>
  );
}

export default Articulos;