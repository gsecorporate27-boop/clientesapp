# Ruta de Avance Visible™ - V4 Carga de Documentos

## Nueva pestaña incluida

Se añade la pestaña:

```text
Carga de documentos
```

## Google Sheet

### Nuevo campo en la pestaña `Proyecto`

```text
LinkCargaDocumentos
```

Aquí debes colocar el enlace único de OneDrive para que el cliente suba todos sus documentos.

### Nueva pestaña técnica

```text
Documentos
```

Columnas esperadas:

```text
Titulo | Descripcion | Categoria | Item | Detalle | Obligatorio | Estado | Observacion
```

## Archivos que debes reemplazar en GitHub

```text
src/main.jsx
src/sheets.js
src/index.css
```


## V4.1 - Corrección Documentos

Esta versión mejora la lectura de la pestaña de documentos.

La app ahora busca cualquiera de estos nombres de pestaña:

```text
Documentos
CargaDocumentos
Carga de documentos
Carga Documentos
ChecklistDocumentos
Checklist Documentos
Checklist
```

Columnas recomendadas:

```text
Titulo | Descripcion | Categoria | Item | Detalle | Obligatorio | Estado | Observacion
```

También acepta variantes como `Documento solicitado`, `Documento requerido`, `Descripción documento`, `Requerido`, `Comentarios`, etc.


## V4.2 fix

Se corrigió el error de pantalla en blanco al abrir Carga de documentos. La causa era un ícono no importado (`ClipboardCheck`). También se añadió un estado visible cuando no existen ítems en Google Sheet.
