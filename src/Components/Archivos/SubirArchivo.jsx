import { useRef, useState } from "react";
import Swal from "sweetalert2";

import EcoButton from "../NeonUI/EcoButton";
import { subirArchivo } from "../../Services/storageService";

const CATEGORIAS = [
  {
    valor: "imagen-cliente",
    etiqueta: "📷 Imagen del cliente",
  },
  {
    valor: "render-propuesto",
    etiqueta: "🎨 Render propuesto",
  },
  {
    valor: "render-aprobado",
    etiqueta: "✅ Render aprobado",
  },
  {
    valor: "svg",
    etiqueta: "✏️ Archivo SVG",
  },
  {
    valor: "pdf-cotizacion",
    etiqueta: "📄 PDF de cotización",
  },
  {
    valor: "archivo-produccion",
    etiqueta: "📁 Archivo de producción",
  },
  {
    valor: "foto-fabricacion",
    etiqueta: "🔧 Foto de fabricación",
  },
  {
    valor: "foto-final",
    etiqueta: "✨ Foto del trabajo terminado",
  },
  {
    valor: "evidencia-entrega",
    etiqueta: "🚚 Evidencia de entrega",
  },
  {
    valor: "otro",
    etiqueta: "📎 Otro archivo",
  },
];

function SubirArchivo({ carpeta, onArchivoSubido }) {
  const inputArchivosRef = useRef(null);
  const inputCamaraRef = useRef(null);

  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [categoria, setCategoria] = useState("imagen-cliente");

  const procesarArchivos = async (listaArchivos) => {
    const archivos = Array.from(listaArchivos || []);

    if (archivos.length === 0) return;

    if (!carpeta) {
      Swal.fire({
        icon: "warning",
        title: "Falta la carpeta",
        text: "No se pudo identificar el expediente.",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    setSubiendo(true);

    try {
      for (const archivo of archivos) {
        const carpetaCategoria = `${carpeta}/${categoria}`;

        const resultado = await subirArchivo(
          archivo,
          carpetaCategoria
        );

        await onArchivoSubido?.({
          ...resultado,
          nombreOriginal: archivo.name,
          tipo:
            archivo.type ||
            "application/octet-stream",
          tamaño: Number(archivo.size || 0),
          categoria,
          subidoEn: new Date().toISOString(),
        });
      }

      await Swal.fire({
        icon: "success",
        title:
          archivos.length === 1
            ? "Archivo subido"
            : "Archivos subidos",
        text:
          archivos.length === 1
            ? "El archivo quedó guardado y clasificado."
            : `Se guardaron ${archivos.length} archivos.`,
        confirmButtonColor: "#7C3AED",
      });
    } catch (error) {
      console.error("Error subiendo archivo:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo subir",
        text:
          error?.code === "storage/unauthorized"
            ? "Firebase Storage bloqueó la carga."
            : "Revisa tu conexión e inténtalo nuevamente.",
        confirmButtonColor: "#7C3AED",
      });
    } finally {
      setSubiendo(false);

      if (inputArchivosRef.current) {
        inputArchivosRef.current.value = "";
      }

      if (inputCamaraRef.current) {
        inputCamaraRef.current.value = "";
      }
    }
  };

  const recibirArchivos = (e) => {
    e.preventDefault();
    setArrastrando(false);
    procesarArchivos(e.dataTransfer.files);
  };

  return (
    <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-purple-400 mb-5">
        📤 Subir archivos
      </h2>

      <div className="mb-5">
        <label className="block text-zinc-400 text-sm mb-2">
          ¿Qué tipo de archivo vas a subir?
        </label>

        <select
          className="input"
          value={categoria}
          disabled={subiendo}
          onChange={(e) =>
            setCategoria(e.target.value)
          }
        >
          {CATEGORIAS.map((opcion) => (
            <option
              key={opcion.valor}
              value={opcion.valor}
            >
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setArrastrando(false);
        }}
        onDrop={recibirArchivos}
        onClick={() => {
          if (!subiendo) {
            inputArchivosRef.current?.click();
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          arrastrando
            ? "border-purple-400 bg-purple-600/20"
            : "border-zinc-700 hover:border-purple-500 bg-zinc-950"
        }`}
      >
        <div className="text-5xl mb-4">
          {subiendo ? "⏳" : "📂"}
        </div>

        <p className="font-bold text-white text-lg">
          {subiendo
            ? "Subiendo archivos..."
            : "Arrastra tus archivos aquí"}
        </p>

        <p className="text-zinc-500 mt-2">
          También puedes tocar esta área para elegir
          archivos.
        </p>
      </div>

      <input
        ref={inputArchivosRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,.pdf,.svg,.cdr,.ai,.eps,.zip"
        onChange={(e) =>
          procesarArchivos(e.target.files)
        }
      />

      <input
        ref={inputCamaraRef}
        type="file"
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) =>
          procesarArchivos(e.target.files)
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
        <EcoButton
          type="button"
          className="w-full"
          disabled={subiendo}
          onClick={(e) => {
            e.stopPropagation();
            inputCamaraRef.current?.click();
          }}
        >
          📷 Tomar foto
        </EcoButton>

        <EcoButton
          type="button"
          variant="secondary"
          className="w-full"
          disabled={subiendo}
          onClick={(e) => {
            e.stopPropagation();
            inputArchivosRef.current?.click();
          }}
        >
          🖼️ Elegir archivos
        </EcoButton>
      </div>

      <p className="text-zinc-500 text-xs mt-4">
        Primero selecciona la categoría. Después arrastra,
        toma una foto o elige el archivo.
      </p>
    </div>
  );
}

export default SubirArchivo;