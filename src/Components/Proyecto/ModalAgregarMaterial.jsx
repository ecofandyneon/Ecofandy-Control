import EcoButton from "../NeonUI/EcoButton";

function ModalAgregarMaterial({ abierto, onClose }) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-purple-700 rounded-2xl w-full max-w-2xl p-6">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-400">
            📦 Agregar Material
          </h2>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <input
          className="input w-full mb-6"
          placeholder="🔍 Buscar material..."
        />

        <div className="bg-zinc-950 rounded-xl p-8 text-center text-zinc-500">
          Aquí aparecerán los materiales encontrados...
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <EcoButton
            variant="secondary"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </EcoButton>

          <EcoButton
            type="button"
          >
            Agregar
          </EcoButton>
        </div>

      </div>
    </div>
  );
}

export default ModalAgregarMaterial;