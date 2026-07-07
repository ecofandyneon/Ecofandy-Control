export function calcularAreaUtil(ancho, alto, margen = 2) {
  return {
    anchoAcrilico: Number(ancho || 0),
    altoAcrilico: Number(alto || 0),
    anchoUtil: Math.max(Number(ancho || 0) - margen * 2, 0),
    altoUtil: Math.max(Number(alto || 0) - margen * 2, 0),
    margenInterior: margen,
  };
}

export function calcularPrecioVenta(costoTotal, utilidadPorcentaje = 60) {
  const costo = Number(costoTotal || 0);
  const utilidad = costo * (Number(utilidadPorcentaje || 0) / 100);
  const precioVenta = costo + utilidad;

  return {
    costo,
    utilidad,
    precioVenta,
  };
}

export function calcularCotizacionNeon({
  ancho,
  alto,
  margen = 2,
  metrosNeon = 0,
  precioMetroNeon = 0,
  costoAcrilico = 0,
  costoFuente = 0,
  costoCable = 0,
  costoConectores = 0,
  costoConsumibles = 0,
  costoFabricacion = 0,
  utilidadPorcentaje = 60,
}) {
  const medidas = calcularAreaUtil(ancho, alto, margen);

  const costoNeon = Number(metrosNeon || 0) * Number(precioMetroNeon || 0);

  const costoMateriales =
    costoNeon +
    Number(costoAcrilico || 0) +
    Number(costoFuente || 0) +
    Number(costoCable || 0) +
    Number(costoConectores || 0) +
    Number(costoConsumibles || 0);

  const costoTotal = costoMateriales + Number(costoFabricacion || 0);

  const precio = calcularPrecioVenta(costoTotal, utilidadPorcentaje);

  return {
    medidas,
    costoNeon,
    costoMateriales,
    costoFabricacion: Number(costoFabricacion || 0),
    costoTotal,
    utilidad: precio.utilidad,
    precioVenta: precio.precioVenta,
  };
}
export function calcularAcrilico({
  costoHoja = 0,
  anchoHoja = 122,
  altoHoja = 244,
  porcentajeCorte = 20,
  anchoPieza = 0,
  altoPieza = 0,
}) {
  const areaHoja = Number(anchoHoja) * Number(altoHoja);
  const areaPieza = Number(anchoPieza) * Number(altoPieza);

  const piezasPorHoja =
    areaPieza > 0 ? Math.floor(areaHoja / areaPieza) : 0;

  const aprovechamiento =
    areaHoja > 0 && piezasPorHoja > 0
      ? ((areaPieza * piezasPorHoja) / areaHoja) * 100
      : 0;

  const desperdicio = 100 - aprovechamiento;

  const costoMaterial =
    piezasPorHoja > 0 ? Number(costoHoja) / piezasPorHoja : 0;

  const costoCorte = costoMaterial * (Number(porcentajeCorte) / 100);

  const costoConCorte = costoMaterial + costoCorte;

  return {
    areaHoja,
    areaPieza,
    piezasPorHoja,
    aprovechamiento,
    desperdicio,
    costoMaterial,
    costoCorte,
    costoConCorte,
  };
}