# Ruta de Avance Visible™ - V5 Documentos con respuesta del cliente

## Nuevo comportamiento

En la pestaña `Carga de documentos`, cada ítem del checklist ahora muestra un menú:

```text
Sí tengo
No tengo
```

Cuando el cliente selecciona una opción, la app envía la respuesta al Apps Script configurado en Vercel.

## Environment Variable requerida en Vercel

```text
VITE_DOCUMENTS_WEBHOOK_URL
```

Valor: URL publicada del Google Apps Script.

## Google Sheet

En la pestaña `Documentos`, usa estas columnas:

```text
Titulo | Descripcion | Categoria | Item | Detalle | Obligatorio | RespuestaCliente | Estado | Observacion | FechaRespuesta
```

## Lógica de actualización

```text
Sí tengo → RespuestaCliente: Sí tengo | Estado: Por subir
No tengo → RespuestaCliente: No tengo | Estado: No disponible
```

## Archivos que debes reemplazar en GitHub

```text
src/main.jsx
src/sheets.js
src/index.css
```
