export function calcularAvance(estado = "") {
  const avances = {
    "idea recibida": 10,
    "diseño / render": 20,
    "aprobado": 30,
    "corte": 45,
    "armado led": 65,
    "pruebas": 80,
    "finalizado": 90,
    "empaque": 95,
    "entregado": 100,
    "liquidado": 100,
  };

  const clave = estado.trim().toLowerCase();

  return avances[clave] || 0;
}