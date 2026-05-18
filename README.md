# Ruta de Avance Visible™ V2 - GSE

Versión 2 con:
- Branding GSE (#00b8b5)
- Montserrat para títulos y Roboto para textos
- Logo GSE y logo del cliente
- Gerente general / dueño
- Link Google Meet
- Barra de desorden operativo
- Entregables filtrables por Sistema e Hito
- Nueva pestaña Educación con imagen previa, explicación y link del entregable

## Uso multi-cliente

https://clientesapp-nine.vercel.app/?sheet=ID_DEL_GOOGLE_SHEET

## Pestaña Proyecto

Formato horizontal recomendado:

Cliente | Servicio | EstadoGeneral | AvanceGeneral | ProximoPaso | FechaProximoPaso | LinkMeet | ResponsableCliente | GerenteGeneral | LogoGSE | LogoCliente | FraseProyecto | MensajeWhatsApp

## Pestaña Entregables

Sistema | Hito | Entregable | Estado | Avance | LinkEntregable | Observacion

## Pestaña Educacion

Sistema | Hito | Entregable | QueEs | ParaQueSirve | ComoLeerlo | ImagenPreview | LinkEntregable | Estado

## Importante

No cambies los nombres de las pestañas:
Proyecto, Hitos, Hallazgos, PendientesCliente, Entregables, Actualizaciones, Educacion


## Ajuste V4 - Hitos

La pestaña `Hitos` ahora acepta y muestra:

ID | Hito | Sistema | Estado | Avance | Descripcion | Incluye | Link | FechaObjetivo

- `Sistema` aparece como etiqueta dentro del hito.
- `FechaObjetivo` aparece debajo de las etiquetas del hito.


## V5 - Ajustes de interacción y visualización

- Las etiquetas de los hitos se centran.
- El sistema se muestra sin el prefijo "Sistema:".
- Al hacer clic en un hito desde el resumen, lleva a la pestaña Ruta del proyecto.
- En Ruta del proyecto, al hacer clic en un hito se despliega:
  - Descripcion
  - Incluye
  - Link
  - Entregables relacionados
- Las etiquetas evitan verse como círculos y no se salen del cuadro.


## V6 - Hitos y pendientes

Cambios:
- En Ruta del proyecto, cada hito se despliega al hacer clic y muestra Descripcion, Incluye, Link y entregables relacionados.
- Las etiquetas son más pequeñas, centradas y homogéneas.
- En Resumen, el bloque de Pendientes del cliente redirecciona a la pestaña Pendientes.
- PendientesCliente ahora acepta:
  Pendiente | Responsable | Fecha | Estado | Que bloquea | Descripcion | Link
- En la pestaña Pendientes, cada pendiente se despliega con descripción y link del documento a aprobar.


## V7 - Botón visible para detalle de hitos

Esta versión no depende de hacer clic en toda la tarjeta.
En la pestaña Ruta del proyecto, cada hito muestra un botón visible:

Ver detalle

Al hacer clic, despliega:
- Descripción
- Incluye
- Link
- Entregables relacionados


## V8 - Ver detalle desde resumen

Cambio clave:
- En el resumen, el botón ahora dice "Ver detalle".
- Al hacer clic, lleva a Ruta del proyecto y abre automáticamente ese hito.
- En Ruta del proyecto, el botón "Ver detalle" despliega Descripcion, Incluye, Link y entregables relacionados.


## V9 - Limpieza de resumen y ruta por clic

Cambios:
- Se elimina el botón visible "Ver detalle" del resumen.
- En el resumen, al hacer clic en cualquier hito, lleva a Ruta del proyecto y abre ese hito.
- En Ruta del proyecto, al hacer clic en cualquier hito, se despliega o se oculta su detalle.
- Los números del resumen son menos pesados visualmente.
- Las etiquetas mantienen tamaño más homogéneo y letra más pequeña.


## V10 - Ruta y resumen

Cambios:
- En resumen, los hitos se muestran 4 por fila en escritorio.
- En resumen, al hacer clic sobre un hito, lleva a Ruta del proyecto y abre ese hito.
- En Ruta del proyecto, al hacer clic sobre cualquier hito, se despliega/oculta descripción, incluye y link.
- Se mantiene el mensaje si el hito no tiene Descripcion, Incluye o Link cargado en Google Sheet.


## V11 - Acordeón nativo para Hitos

Cambio clave:
- Ruta del proyecto ahora usa <details>/<summary>, más estable para desplegar detalles.
- Campos aceptados en Hitos:
  ID | Hito | Sistema | Estado | Avance | Descripcion | Qué incluye | Link | FechaObjetivo
- En resumen, hitos a 4 por fila.
- Al abrir un hito en Ruta se muestra Descripción, Qué incluye, Link y entregables relacionados.


## V12 - Ruta forzada como desplegable

- La vista `ruta` queda forzada con `detailed={true}`.
- Si en Ruta sigues viendo el texto corto, revisa que el render `view === "ruta"` haya sido reemplazado en src/main.jsx.
- Hitos reconoce: ID | Hito | Sistema | Estado | Avance | Descripcion | Qué incluye | Link | FechaObjetivo.


## V13 - Detalle en tarjeta

Cambio clave:
- Ya no se despliegan los hitos.
- En la pestaña Ruta del proyecto, cada tarjeta muestra directamente:
  - Descripción
  - Qué incluye
  - Link
  - Entregables relacionados
- En resumen, los hitos siguen compactos y en 4 por fila.
