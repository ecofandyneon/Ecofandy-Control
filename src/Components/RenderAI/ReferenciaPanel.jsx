import { useState } from "react";

function ReferenciaPanel() {
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState("");

  const seleccionarImagen = (e) => {
    const archivo = e.target.files[0];

    if (!archivo) return;

    setImagen(archivo);
    setPreview(URL.createObjectURL(archivo));
  };

  const quitarImagen = () => {
    setImagen(null);
    setPreview("");
  };

  return (
    <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-purple-400 mb-4">
        📷 Referencia
      </h2>

      {!preview ? (
        <label className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center text-zinc-500 cursor-pointer hover:border-purple-500 hover:text-purple-300 transition block">
          <input
            type="file"
            accept="image/*"
            onChange={seleccionarImagen}
            className="hidden"
          />

          <div className="text-4xl mb-3">📷</div>
          <p className="font-bold">Seleccionar imagen</p>
          <p className="text-sm mt-2">JPG, PNG o WEBP</p>
        </label>
      ) : (
        <div>
          <img
            src={preview}
            alt="Referencia"
            className="w-full rounded-xl border border-zinc-700"
          />

          <p className="text-zinc-400 text-sm mt-3">
            {imagen?.name}
          </p>

          <button
            type="button"
            onClick={quitarImagen}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl"
          >
            🗑 Quitar imagen
          </button>
        </div>
      )}
    </div>
  );
}

export default ReferenciaPanel;