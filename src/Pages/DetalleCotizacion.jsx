import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";

import { db } from "../Services/firebase";
import logo from "../assets/logo.svg";
import SubirArchivo from "../Components/Archivos/SubirArchivo";
import ListaArchivos from "../Components/Archivos/ListaArchivos";
import EstadoBadge from "../Components/Clientes/EstadoBadge";
import BarraProgreso from "../Components/Clientes/BarraProgreso";

function DetalleCotizacion() {
  const { id } = useParams();

  const [cotizacion, setCotizacion] = useState(null);
  const [clienteActual, setClienteActual] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [notasCotizacion, setNotasCotizacion] = useState("");
  const [guardandoNotas, setGuardandoNotas] = useState(false);

  const imagenCliente =
    archivos.find(
      (archivo) => archivo.categoria === "imagen-cliente"
    ) ||
    archivos.find((archivo) =>
      archivo.tipo?.startsWith("image/")
    );

  const renderAprobado =
    archivos.find((archivo) => archivo.categoria === "render-aprobado") ||
    (cotizacion?.renderAprobadoUrl
      ? { url: cotizacion.renderAprobadoUrl }
      : null);

  const imagenVectorizable =
    archivos.find(
      (archivo) => archivo.categoria === "imagen-vectorizable"
    ) || null;

  const svgFinal =
    archivos.find((archivo) => archivo.categoria === "svg-final") || null;

  const moneda = (valor) =>
    Number(valor || 0).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const imagenADataUrl = async (url) => {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error(`No se pudo descargar la imagen: ${respuesta.status}`);
    }

    const blob = await respuesta.blob();

    const dataUrlOriginal = await new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result);
      lector.onerror = reject;
      lector.readAsDataURL(blob);
    });

    const imagen = await new Promise((resolve, reject) => {
      const elemento = new Image();
      elemento.onload = () => resolve(elemento);
      elemento.onerror = reject;
      elemento.src = dataUrlOriginal;
    });

    const canvas = document.createElement("canvas");
    canvas.width = imagen.naturalWidth || imagen.width;
    canvas.height = imagen.naturalHeight || imagen.height;

    const contexto = canvas.getContext("2d");
    contexto.fillStyle = "#FFFFFF";
    contexto.fillRect(0, 0, canvas.width, canvas.height);
    contexto.drawImage(imagen, 0, 0);

    return {
      dataUrl: canvas.toDataURL("image/png"),
      ancho: canvas.width,
      alto: canvas.height,
    };
  };

  const agregarImagenPdf = async (pdf, archivo, y, titulo) => {
    if (!archivo?.url) return y;

    try {
      const imagenPdf = await imagenADataUrl(archivo.url);

      const maxAncho = 180;
      const maxAlto = 72;
      const escala = Math.min(
        maxAncho / imagenPdf.ancho,
        maxAlto / imagenPdf.alto
      );

      const anchoImagen = imagenPdf.ancho * escala;
      const altoImagen = imagenPdf.alto * escala;
      const xImagen = (210 - anchoImagen) / 2;

      pdf.setTextColor(63, 63, 70);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(titulo, 15, y);

      y += 5;

      pdf.setDrawColor(228, 228, 231);
      pdf.roundedRect(15, y, 180, altoImagen + 6, 3, 3, "S");

      pdf.addImage(
        imagenPdf.dataUrl,
        "PNG",
        xImagen,
        y + 3,
        anchoImagen,
        altoImagen
      );

      return y + altoImagen + 14;
    } catch (error) {
      console.warn(`No se pudo agregar ${titulo} al PDF:`, error);
      return y;
    }
  };

  const nombreCliente =
    clienteActual?.nombre || cotizacion?.clienteNombre || "";

  const whatsappCliente =
    clienteActual?.whatsapp || cotizacion?.whatsapp || "";

  const correoCliente =
    clienteActual?.correo || cotizacion?.correo || "";

  const generarPdf = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const precioFinal = Number(
        cotizacion.precioFinal || cotizacion.precioVenta || 0
      );
      const descuento = Number(cotizacion.descuento || 0);

      const dibujarImagenEnCaja = async (
        archivo,
        x,
        y,
        anchoCaja,
        altoCaja,
        titulo
      ) => {
        if (!archivo?.url) return;

        try {
          const imagenPdf = await imagenADataUrl(archivo.url);

          pdf.setTextColor(63, 63, 70);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
          pdf.text(titulo, x, y);

          const yCaja = y + 4;

          pdf.setDrawColor(228, 228, 231);
          pdf.roundedRect(
            x,
            yCaja,
            anchoCaja,
            altoCaja,
            3,
            3,
            "S"
          );

          const margen = 4;
          const anchoDisponible = anchoCaja - margen * 2;
          const altoDisponible = altoCaja - margen * 2;

          const escala = Math.min(
            anchoDisponible / imagenPdf.ancho,
            altoDisponible / imagenPdf.alto
          );

          const anchoImagen = imagenPdf.ancho * escala;
          const altoImagen = imagenPdf.alto * escala;

          const xImagen = x + (anchoCaja - anchoImagen) / 2;
          const yImagen =
            yCaja + (altoCaja - altoImagen) / 2;

          pdf.addImage(
            imagenPdf.dataUrl,
            "PNG",
            xImagen,
            yImagen,
            anchoImagen,
            altoImagen
          );
        } catch (error) {
          console.warn(
            `No se pudo agregar ${titulo} al PDF:`,
            error
          );
        }
      };

      // ENCABEZADO
      pdf.setFillColor(24, 24, 27);
      pdf.rect(0, 0, 210, 36, "F");

      try {
        const logoPdf = await imagenADataUrl(logo);
        const proporcion = logoPdf.ancho / logoPdf.alto;
        const altoLogo = 18;
        const anchoLogo = Math.min(altoLogo * proporcion, 48);

        pdf.addImage(
          logoPdf.dataUrl,
          "PNG",
          15,
          9,
          anchoLogo,
          altoLogo
        );
      } catch (error) {
        console.warn("No se pudo agregar el logo:", error);
      }

      pdf.setTextColor(168, 85, 247);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("COTIZACIÓN", 195, 15, {
        align: "right",
      });

      pdf.setTextColor(212, 212, 216);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(cotizacion.folio || "", 195, 23, {
        align: "right",
      });
      pdf.text(
        new Date().toLocaleDateString("es-MX"),
        195,
        29,
        { align: "right" }
      );

      // CLIENTE Y PROYECTO EN DOS COLUMNAS
      pdf.setTextColor(39, 39, 42);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("CLIENTE", 15, 47);
      pdf.text("PROYECTO", 105, 47);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(nombreCliente || "Cliente", 15, 55);

      pdf.text(cotizacion.nombreProyecto || "", 105, 55);
      pdf.setFontSize(9);
      pdf.text(`Tipo: ${cotizacion.tipo || ""}`, 105, 62);
      pdf.text(
        `Medidas: ${cotizacion.medidas?.ancho || 0} x ${
          cotizacion.medidas?.alto || 0
        } cm`,
        105,
        68
      );

      // IMÁGENES LADO A LADO
      const hayImagenCliente = Boolean(imagenCliente?.url);
      const hayRender = Boolean(renderAprobado?.url);

      if (hayImagenCliente && hayRender) {
        await dibujarImagenEnCaja(
          imagenCliente,
          15,
          80,
          55,
          105,
          "IMAGEN DE REFERENCIA"
        );

        await dibujarImagenEnCaja(
          renderAprobado,
          75,
          80,
          120,
          105,
          "RENDER APROBADO"
        );
      } else if (hayImagenCliente) {
        await dibujarImagenEnCaja(
          imagenCliente,
          15,
          80,
          180,
          105,
          "IMAGEN DE REFERENCIA"
        );
      } else if (hayRender) {
        await dibujarImagenEnCaja(
          renderAprobado,
          15,
          80,
          180,
          105,
          "RENDER APROBADO"
        );
      }

      // PRECIO
      const yPrecio = 198;

      pdf.setFillColor(250, 250, 250);
      pdf.roundedRect(
        15,
        yPrecio,
        180,
        descuento > 0 ? 44 : 34,
        3,
        3,
        "F"
      );

      if (descuento > 0) {
        pdf.setTextColor(63, 63, 70);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(
          "Precio antes de descuento",
          22,
          yPrecio + 11
        );
        pdf.text(
          `$${moneda(precioFinal + descuento)} MXN`,
          188,
          yPrecio + 11,
          { align: "right" }
        );

        pdf.setTextColor(220, 38, 38);
        pdf.text("Descuento", 22, yPrecio + 21);
        pdf.text(
          `-$${moneda(descuento)} MXN`,
          188,
          yPrecio + 21,
          { align: "right" }
        );
      }

      const yTotal =
        descuento > 0 ? yPrecio + 35 : yPrecio + 21;

      pdf.setTextColor(22, 163, 74);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("PRECIO FINAL", 22, yTotal);
      pdf.text(
        `$${moneda(precioFinal)} MXN`,
        188,
        yTotal,
        { align: "right" }
      );

      // NOTAS DE COTIZACIÓN
      if (notasCotizacion.trim()) {
        const yNotas = descuento > 0 ? 248 : 238;
        const lineasNotas = pdf
          .splitTextToSize(notasCotizacion.trim(), 166)
          .slice(0, 5);

        pdf.setFillColor(250, 250, 250);
        pdf.roundedRect(15, yNotas, 180, 28, 3, 3, "F");

        pdf.setTextColor(63, 63, 70);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text("NOTAS", 22, yNotas + 7);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(lineasNotas, 22, yNotas + 13);
      }

      // PIE DE PÁGINA
      pdf.setTextColor(113, 113, 122);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(
        "Gracias por confiar en Ecofandy Neon.",
        105,
        280,
        { align: "center" }
      );
      pdf.text("ILUMINAMOS TUS IDEAS", 105, 285, {
        align: "center",
      });

      pdf.save(
        `${cotizacion.folio || "cotizacion"}-${
          cotizacion.nombreProyecto || "proyecto"
        }.pdf`
      );
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("No se pudo generar la cotización PDF.");
    }
  };

  const abrirWhatsApp = () => {
    const numero = String(whatsappCliente || "").replace(/\D/g, "");

    if (!numero) {
      alert("Este cliente no tiene WhatsApp registrado.");
      return;
    }

    const numeroWhatsApp = numero.length === 10 ? `52${numero}` : numero;
    const precioFinal = Number(
      cotizacion.precioFinal || cotizacion.precioVenta || 0
    );

    const mensaje = [
      `Hola ${nombreCliente || ""} 👋`,
      "",
      "Soy Fabián de Ecofandy Neon.",
      `Te comparto la cotización de tu proyecto *${
        cotizacion.nombreProyecto || ""
      }*.`,
      "",
      `📏 Medidas: ${cotizacion.medidas?.ancho || 0} x ${
        cotizacion.medidas?.alto || 0
      } cm`,
      `💰 Precio final: *$${moneda(precioFinal)} MXN*`,
      `📄 Folio: ${cotizacion.folio || ""}`,
      "",
      "Enseguida te comparto el PDF de la cotización. 😊",
    ].join("\n");

    window.open(
      `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  useEffect(() => {
    const cargarCotizacion = async () => {
      try {
        const referencia = doc(db, "cotizaciones", id);
        const documento = await getDoc(referencia);

        if (documento.exists()) {
          const datosCotizacion = {
            id: documento.id,
            ...documento.data(),
          };

          setCotizacion(datosCotizacion);
          setArchivos(datosCotizacion.archivos || []);
          setNotasCotizacion(datosCotizacion.notasCotizacion || "");

          if (datosCotizacion.clienteId) {
            try {
              const clienteRef = doc(
                db,
                "clientes",
                datosCotizacion.clienteId
              );
              const clienteSnap = await getDoc(clienteRef);

              if (clienteSnap.exists()) {
                setClienteActual({
                  id: clienteSnap.id,
                  ...clienteSnap.data(),
                });
              }
            } catch (errorCliente) {
              console.error(
                "Error cargando cliente actualizado:",
                errorCliente
              );
            }
          }
        }
      } catch (error) {
        console.error("Error cargando cotización:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarCotizacion();
  }, [id]);

  const guardarNotasCotizacion = async () => {
    try {
      setGuardandoNotas(true);

      const cotizacionRef = doc(db, "cotizaciones", id);

      await updateDoc(cotizacionRef, {
        notasCotizacion: notasCotizacion.trim(),
        actualizadoEn: serverTimestamp(),
      });

      setCotizacion((cotizacionActual) => ({
        ...cotizacionActual,
        notasCotizacion: notasCotizacion.trim(),
      }));

      alert("Notas guardadas correctamente.");
    } catch (error) {
      console.error("Error guardando notas:", error);
      alert("No se pudieron guardar las notas.");
    } finally {
      setGuardandoNotas(false);
    }
  };

  const registrarArchivoSubido = async (archivo) => {
    try {
      const archivoGuardado = {
        ...archivo,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      };

      const cotizacionRef = doc(db, "cotizaciones", id);

      await updateDoc(cotizacionRef, {
        archivos: arrayUnion(archivoGuardado),
        actualizadoEn: serverTimestamp(),
      });

      setArchivos((archivosActuales) => [
        ...archivosActuales,
        archivoGuardado,
      ]);
    } catch (error) {
      console.error(
        "Error guardando archivo en Firestore:",
        error
      );

      throw error;
    }
  };

  const eliminarArchivoDeLista = (archivoSeleccionado) => {
    setArchivos((archivosActuales) =>
      archivosActuales.filter(
        (archivo) =>
          archivo.url !== archivoSeleccionado.url
      )
    );
  };

  if (cargando) {
    return <p className="text-zinc-400">Cargando expediente...</p>;
  }

  if (!cotizacion) {
    return (
      <p className="text-red-400">
        No se encontró el expediente.
      </p>
    );
  }

  return (
    <div>
      <Link
        to={`/clientes/${cotizacion.clienteId}`}
        className="text-purple-400 hover:text-purple-300"
      >
        ← Volver al cliente
      </Link>

      <div className="mt-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-purple-500">
            📂 {cotizacion.folio} · {cotizacion.nombreProyecto}
          </h1>

          <p className="text-zinc-400 mt-2">
            {nombreCliente} · {cotizacion.tipo}
          </p>
        </div>

        <EstadoBadge estado={cotizacion.estado} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-3 bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            📌 Avance del expediente
          </h2>

          <BarraProgreso estado={cotizacion.estado} />
        </div>

        <div className="xl:col-span-3 bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <h2 className="text-xl font-bold text-purple-400">
                📄 Cotización para el cliente
              </h2>
              <p className="text-zinc-500 mt-2">
                Genera el PDF y abre WhatsApp con el mensaje listo.
              </p>
              <p className="text-zinc-600 text-sm mt-1">
                Descarga primero el PDF y después adjúntalo en el chat de WhatsApp.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={generarPdf}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-3 rounded-xl transition"
              >
                📄 Descargar cotización PDF
              </button>

              <button
                type="button"
                onClick={abrirWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-xl transition"
              >
                🟢 Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            👤 Cliente
          </h2>

          <div className="space-y-3 text-zinc-300">
            <p>
              <span className="text-zinc-500">Nombre:</span>{" "}
              {nombreCliente}
            </p>
            <p>
              <span className="text-zinc-500">WhatsApp:</span>{" "}
              {whatsappCliente || "Sin WhatsApp"}
            </p>
            <p>
              <span className="text-zinc-500">Correo:</span>{" "}
              {correoCliente || "Sin correo"}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            📏 Datos del trabajo
          </h2>

          <div className="space-y-3 text-zinc-300">
            <p>
              <span className="text-zinc-500">Tipo:</span>{" "}
              {cotizacion.tipo}
            </p>
            <p>
              <span className="text-zinc-500">Medidas:</span>{" "}
              {cotizacion.medidas?.ancho || 0} ×{" "}
              {cotizacion.medidas?.alto || 0} cm
            </p>
            <p>
              <span className="text-zinc-500">Estado:</span>{" "}
              {cotizacion.estado}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            💰 Costos
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">Materiales</span>
              <strong>
                ${Number(cotizacion.totalMateriales || 0).toLocaleString("es-MX")}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">
                Utilidad ({cotizacion.utilidadPorcentaje || 0}%)
              </span>
              <strong className="text-yellow-400">
                ${Number(cotizacion.ganancia || 0).toLocaleString("es-MX")}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">Mano de obra</span>
              <strong>
                ${Number(cotizacion.manoObra || 0).toLocaleString("es-MX")}
              </strong>
            </div>

            {Number(cotizacion.descuento || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Descuento</span>
                <strong className="text-red-400">
                  -${Number(cotizacion.descuento || 0).toLocaleString("es-MX")}
                </strong>
              </div>
            )}

            <div className="border-t border-zinc-800 pt-4 flex justify-between text-2xl">
              <span className="text-green-300 font-bold">Precio final</span>
              <strong className="text-green-400">
                ${Number(
                  cotizacion.precioFinal || cotizacion.precioVenta || 0
                ).toLocaleString("es-MX")}
              </strong>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-purple-400">
                📝 Notas de cotización
              </h2>
              <p className="text-zinc-500 mt-2">
                Escribe garantías, tiempos de fabricación o cláusulas para el cliente.
              </p>

              <textarea
                value={notasCotizacion}
                onChange={(evento) => setNotasCotizacion(evento.target.value)}
                placeholder="Ejemplo: Garantía de 6 meses por defectos de fabricación..."
                rows={5}
                className="mt-5 w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 outline-none rounded-xl p-4 text-zinc-200 resize-y transition"
              />

              <p className="text-zinc-600 text-sm mt-2">
                Estas notas aparecerán en la cotización PDF.
              </p>
            </div>

            <button
              type="button"
              onClick={guardarNotasCotizacion}
              disabled={guardandoNotas}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl transition lg:mt-12"
            >
              {guardandoNotas ? "Guardando..." : "💾 Guardar notas"}
            </button>
          </div>
        </div>

        <div className="xl:col-span-2 bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            🎨 Diseño / Render
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
              <p className="font-bold text-white text-center mb-4">
                📷 Imagen del cliente
              </p>

              {imagenCliente?.url ? (
                <div>
                  <a
                    href={imagenCliente.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img
                      src={imagenCliente.url}
                      alt={imagenCliente.nombreOriginal || "Imagen del cliente"}
                      className="w-full h-64 object-contain rounded-xl bg-black border border-zinc-800 hover:border-purple-500 transition"
                    />
                  </a>

                  <p className="text-zinc-500 text-center text-sm mt-3 break-all">
                    {imagenCliente.nombreOriginal ||
                      imagenCliente.nombre ||
                      "Imagen del cliente"}
                  </p>

                  <p className="text-purple-400 text-center text-xs mt-1">
                    Toca la imagen para abrirla
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-6xl">📷</p>
                  <p className="text-zinc-500 mt-4">
                    Aún no hay imagen del cliente.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
              <p className="font-bold text-white text-center mb-4">
                🎨 Render aprobado
              </p>

              {renderAprobado?.url ? (
                <div>
                  <a
                    href={renderAprobado.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img
                      src={renderAprobado.url}
                      alt={renderAprobado.nombreOriginal || "Render aprobado"}
                      className="w-full h-64 object-contain rounded-xl bg-black border border-zinc-800 hover:border-purple-500 transition"
                    />
                  </a>

                  <p className="text-zinc-500 text-center text-sm mt-3 break-all">
                    {renderAprobado.nombreOriginal ||
                      renderAprobado.nombre ||
                      "Render aprobado"}
                  </p>

                  <p className="text-purple-400 text-center text-xs mt-1">
                    Toca la imagen para abrirla
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-6xl">🎨</p>
                  <p className="text-zinc-500 mt-4">
                    Aún no hay render aprobado.
                  </p>
                </div>
              )}
            </div>

            {imagenVectorizable?.url && (
              <div className="md:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                <p className="font-bold text-white text-center mb-4">
                  ✏️ Imagen para Corel
                </p>

                <a
                  href={imagenVectorizable.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <img
                    src={imagenVectorizable.url}
                    alt={
                      imagenVectorizable.nombreOriginal ||
                      "Imagen vectorizable"
                    }
                    className="w-full h-64 object-contain rounded-xl bg-black border border-zinc-800 hover:border-purple-500 transition"
                  />
                </a>

                <p className="text-zinc-500 text-center text-sm mt-3 break-all">
                  {imagenVectorizable.nombreOriginal ||
                    imagenVectorizable.nombre ||
                    "Imagen vectorizable"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            📐 SVG
          </h2>

          {svgFinal?.url ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-5xl mb-3">📐</p>
              <p className="font-bold text-white">SVG final</p>
              <p className="text-zinc-500 text-sm mt-2 break-all">
                {svgFinal.nombreOriginal ||
                  svgFinal.nombre ||
                  "Archivo SVG"}
              </p>

              <div className="flex flex-col gap-3 mt-5">
                <a
                  href={svgFinal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl"
                >
                  👁 Ver SVG
                </a>

                <a
                  href={svgFinal.url}
                  download
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl"
                >
                  ⬇️ Descargar
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-5xl mb-3">✏️</p>
              <p className="font-bold text-white">Archivo vector</p>
              <p className="text-zinc-500 text-sm mt-2">
                Pendiente de generar SVG
              </p>
            </div>
          )}
        </div>

        <div className="xl:col-span-3 bg-zinc-900 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-5">
            📦 Materiales cotizados
          </h2>

          <div className="space-y-3">
            {(cotizacion.materiales || []).map((material, index) => (
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
                  <p className="text-sm text-zinc-500">
                    Unitario: ${Number(material.precioUnitario || 0).toLocaleString("es-MX")}
                  </p>
                </div>
              </div>
            ))}

            {(!cotizacion.materiales || cotizacion.materiales.length === 0) && (
              <p className="text-zinc-500 text-center py-8">
                Esta cotización no tiene materiales registrados.
              </p>
            )}
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-purple-400">
              📂 Archivos del proyecto
            </h2>
            <p className="text-zinc-500 mt-2">
              Guarda imágenes, renders, SVG, PDF, Corel y fotografías del proceso.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SubirArchivo
              carpeta={`expedientes/${cotizacion.folio}`}
              onArchivoSubido={registrarArchivoSubido}
            />

            <ListaArchivos
              archivos={archivos}
              onEliminar={eliminarArchivoDeLista}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleCotizacion;