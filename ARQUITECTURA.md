# Ecofandy Control — Arquitectura v1.0

## Objetivo

Ecofandy Control administra el proceso completo de cada trabajo de Ecofandy Neon:

Cliente → Diseño → Render → SVG → Materiales → Cotización → Aprobación → Producción → Entrega.

La información de cada trabajo debe capturarse una sola vez y reutilizarse en todos los módulos.

---

## Regla principal

Cada trabajo existe como un único documento en la colección:

cotizaciones

No se crearán copias separadas para expediente, producción o historial.

Los demás módulos solamente consultan o actualizan ese mismo documento.

---

## 1. Clientes

Colección:

clientes

Guarda únicamente:

- Nombre
- WhatsApp
- Correo
- Ciudad
- Código postal
- RFC
- Uso de CFDI
- Notas

Un cliente puede tener varias cotizaciones.

Las cotizaciones se relacionan mediante:

clienteId

El módulo Clientes consulta las cotizaciones del cliente, pero no las duplica.

---

## 2. Nuevo Proyecto

Nombre actual de la página:

NuevaCotizacion.jsx

Será el corazón de Ecofandy Control.

Aquí se crea el único registro del trabajo.

Debe incluir:

- Cliente
- Nombre del proyecto
- Tipo de letrero
- Medidas
- Imagen original
- Renders
- Render aprobado
- SVG
- Materiales
- Mano de obra
- Utilidad
- Descuento
- Precio final
- Archivos
- Estado
- Fechas
- Observaciones

Al guardarlo se crea un documento en:

cotizaciones

La cotización y el proyecto serán el mismo registro.

---

## 3. Expediente

Página:

DetalleCotizacion.jsx

No crea una copia nueva.

Consulta el documento original de la colección cotizaciones.

Muestra:

- Cliente
- Datos del trabajo
- Imagen original
- Renders
- Render aprobado
- SVG
- Materiales
- Costos
- Archivos
- Estado
- Producción
- Bitácora
- Fotografías finales

Cualquier cambio realizado desde el expediente actualiza el mismo documento.

---

## 4. Historial del cliente

Página:

DetalleCliente.jsx

Consulta cotizaciones utilizando:

clienteId

Muestra todos los trabajos relacionados con el cliente.

No guarda copias de las cotizaciones.

Permite:

- Abrir expediente
- Duplicar proyecto
- Crear nuevo proyecto para ese cliente
- Consultar estado y precio final

---

## 5. Producción

El módulo Producción consulta los documentos de cotizaciones cuyo estado corresponda a fabricación.

Ejemplo:

estado = "Producción"

No crea una orden duplicada.

Actualiza sobre el mismo documento:

- Estado
- Etapa actual
- Fechas
- Comentarios
- Fotografías
- Responsable
- Bitácora

---

## 6. Biblioteca técnica

Colección:

articulos

Guarda materiales, consumibles y servicios.

Cada artículo puede incluir:

- Nombre
- Categoría
- Proveedor
- Unidad
- Precio
- Ancho y alto de hoja
- Porcentaje de corte
- Espesor
- Voltaje
- Amperaje
- Consumo por metro

Nuevo Proyecto selecciona los artículos necesarios y guarda una copia de sus precios dentro de la cotización.

Esto permite conservar el precio histórico aunque después cambie el precio del artículo.

---

## 7. Materiales del proyecto

Los materiales se guardan dentro del documento de cotización.

Cada material incluye:

- articuloId
- nombre
- categoría
- unidad
- cantidad
- medidas cuando correspondan
- precio unitario usado
- total
- descripción de cantidad

El usuario puede:

- Agregar
- Quitar
- Corregir cantidades
- Cambiar materiales sugeridos por la IA

La IA propone; el usuario decide.

---

## 8. Costos

Fórmula oficial:

Utilidad = total de materiales × porcentaje de utilidad

Precio antes de descuento =
total de materiales + utilidad + mano de obra

Precio final =
precio antes de descuento - descuento manual

La mano de obra no genera utilidad adicional.

El descuento es una cantidad manual autorizada por Ecofandy.

---

## 9. Archivos

Firebase Storage almacena los archivos del proyecto.

Estructura sugerida:

expedientes/
  COT-0001/
    imagen-cliente/
    renders/
    svg/
    pdf/
    produccion/
    fotos-finales/

Firestore guarda únicamente los datos de cada archivo:

- Nombre
- URL
- Ruta en Storage
- Tipo
- Tamaño
- Categoría
- Fecha

El expediente consulta esa lista.

---

## 10. Almacenamiento local

Ecofandy Control podrá permitir:

- Guardar en Firebase
- Descargar en la computadora
- Guardar en ambos

El navegador debe pedir permiso al usuario para elegir archivos o carpetas.

Firebase será el respaldo del expediente.

La computadora o disco externo podrá conservar los archivos de trabajo pesados.

---

## 11. Flujo oficial

1. Seleccionar cliente.
2. Crear nuevo proyecto.
3. Subir imagen original.
4. Generar dos o tres renders.
5. Mostrar propuestas al cliente.
6. Marcar el render aprobado.
7. Generar SVG.
8. Analizar SVG.
9. Sugerir materiales.
10. Corregir, agregar o quitar materiales.
11. Calcular costos.
12. Aplicar mano de obra y descuento.
13. Generar cotización.
14. Recibir Vo. Bo. del cliente.
15. Cambiar estado a producción.
16. Registrar proceso de fabricación.
17. Guardar fotografías finales.
18. Marcar como entregado.

---

## 12. Estados oficiales

- Idea recibida
- Diseño / Render
- Render aprobado
- SVG generado
- Materiales listos
- Cotización enviada
- Aprobado
- Corte
- Pegado LED
- Pruebas
- Empaque
- Entregado
- Cancelado

La barra de progreso depende del estado.

---

## 13. Módulos que solo consultan

Estos módulos no deben duplicar información:

- Dashboard
- Historial del cliente
- Expediente
- Producción
- Estadísticas
- Finanzas

Todos consultan la misma colección cotizaciones.

---

## 14. Cotizador Neón

CotizadorNeon.jsx fue un prototipo.

Sus funciones útiles deben trasladarse a NuevaCotizacion.jsx:

- Selección de materiales
- Cálculo de acrílico
- Cantidades
- Mano de obra
- Utilidad
- Descuento
- Precio final

Después de verificar que todo funcione en Nueva Cotización:

- Se quitará Cotizador Neón del menú.
- Se quitará su ruta.
- El archivo se conservará temporalmente como respaldo.
- Posteriormente podrá eliminarse.

---

## 15. Principio de desarrollo

Antes de agregar una función se debe comprobar:

1. ¿Ahorra tiempo al cotizar o fabricar?
2. ¿Usa el mismo documento del proyecto?
3. ¿Evita volver a capturar información?
4. ¿Pertenece al módulo correcto?
5. ¿Funciona en computadora y celular?

Si una función duplica datos, debe rediseñarse.