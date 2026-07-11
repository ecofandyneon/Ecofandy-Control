import {
  Eye,
  Download,
  Trash2,
  Image,
  FileText,
  File,
} from "lucide-react";

function esImagen(archivo = {}) {
  const tipo = String(archivo.tipo || "").toLowerCase();
  const nombre = String(
    archivo.nombreOriginal || archivo.nombre || ""
  ).toLowerCase();

  return (
    tipo.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|jfif|bmp)$/i.test(nombre)
  );
}

function icono(archivo = {}) {
  const tipo = String(archivo.tipo || "").toLowerCase();
  const nombre = String(
    archivo.nombreOriginal || archivo.nombre || ""
  ).toLowerCase();

  if (esImagen(archivo)) return <Image size={22} />;
  if (tipo.includes("pdf") || nombre.endsWith(".pdf")) {
    return <FileText size={22} />;
  }
  if (tipo.includes("svg") || nombre.endsWith(".svg")) {
    return <Image size={22} />;
  }

  return <File size={22} />;
}

function ListaArchivos({ archivos = [], onEliminar }) {
  if (archivos.length === 0) {
    return (
      <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-3">📂</div>
        <p className="text-zinc-400">
          Aún no existen archivos en este expediente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {archivos.map((archivo, index) => {
        const mostrarMiniatura = esImagen(archivo);

        return (
          <div
            key={archivo.url || `${archivo.nombreOriginal}-${index}`}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-purple-500 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {mostrarMiniatura ? (
                  <a
                    href={archivo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0"
                  >
                    <img
                      src={archivo.url}
                      alt={archivo.nombreOriginal || "Archivo del proyecto"}
                      className="w-24 h-20 object-contain bg-black rounded-lg border border-zinc-800"
                    />
                  </a>
                ) : (
                  <div className="text-purple-400 shrink-0">
                    {icono(archivo)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="font-bold text-white break-words">
                    {archivo.nombreOriginal ||
                      archivo.nombre ||
                      "Archivo sin nombre"}
                  </p>

                  <p className="text-zinc-500 text-sm">
                    {archivo.categoria || "archivo"}
                  </p>

                  {mostrarMiniatura && (
                    <p className="text-purple-400 text-xs mt-1">
                      Toca la imagen para abrirla
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <a
                  href={archivo.url}
                  target="_blank"
                  rel="noreferrer"
                  title="Ver archivo"
                  className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg"
                >
                  <Eye size={18} />
                </a>

                <a
                  href={archivo.url}
                  download
                  title="Descargar archivo"
                  className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg"
                >
                  <Download size={18} />
                </a>

                <button
                  type="button"
                  onClick={() => onEliminar?.(archivo)}
                  title="Eliminar archivo"
                  className="bg-red-600 hover:bg-red-700 p-2 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ListaArchivos;