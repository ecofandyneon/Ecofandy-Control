import {
  Eye,
  Download,
  Trash2,
  Image,
  FileText,
  File,
} from "lucide-react";

function icono(tipo = "") {
  if (tipo.includes("image")) return <Image size={22} />;
  if (tipo.includes("pdf")) return <FileText size={22} />;
  if (tipo.includes("svg")) return <Image size={22} />;

  return <File size={22} />;
}

function ListaArchivos({
  archivos = [],
  onEliminar,
}) {
  if (archivos.length === 0) {
    return (
      <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-3">
          📂
        </div>

        <p className="text-zinc-400">
          Aún no existen archivos en este expediente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {archivos.map((archivo) => (

        <div
          key={archivo.url}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center hover:border-purple-500 transition"
        >

          <div className="flex items-center gap-4">

            <div className="text-purple-400">
              {icono(archivo.tipo)}
            </div>

            <div>

              <p className="font-bold text-white">
                {archivo.nombreOriginal}
              </p>

              <p className="text-zinc-500 text-sm">
                {archivo.categoria}
              </p>

            </div>

          </div>

          <div className="flex gap-2">

            <a
              href={archivo.url}
              target="_blank"
              rel="noreferrer"
              className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg"
            >
              <Eye size={18}/>
            </a>

            <a
              href={archivo.url}
              download
              className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg"
            >
              <Download size={18}/>
            </a>

            <button
              onClick={() => onEliminar?.(archivo)}
              className="bg-red-600 hover:bg-red-700 p-2 rounded-lg"
            >
              <Trash2 size={18}/>
            </button>

          </div>

        </div>

      ))}

    </div>
  );
}

export default ListaArchivos;