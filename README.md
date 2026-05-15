# Ruta de Avance Visible™ - Conexión Google Sheets

Esta versión está corregida para aceptar un Google Sheet publicado con ID tipo `2PACX-...`.

## Variable en Vercel

Crear la variable:

```text
VITE_SPREADSHEET_ID
```

Valor recomendado para este caso:

```text
2PACX-1vT5FVaNryfpqK38L3RKORy8fueRuS6qamcd85YfOYljPtVuhXUfklbv-v1OP248tg
```

También acepta la URL completa publicada:

```text
https://docs.google.com/spreadsheets/d/e/2PACX-.../pubhtml
```

## Importante

El Google Sheet debe estar publicado en la web:

Archivo → Compartir → Publicar en la web → Todo el documento

La app espera estas pestañas con nombres exactos:

- Proyecto
- Hitos
- Hallazgos
- PendientesCliente
- Entregables
- Actualizaciones

No cambies nombres de pestañas ni encabezados de columnas.

## Después de cambiar la variable o subir este código

En Vercel:

Deployments → tres puntitos → Redeploy


## Corrección incluida

Esta versión mejora la lectura de la pestaña `Proyecto`.
Ahora reconoce los campos aunque Google Sheets entregue encabezados con espacios, caracteres invisibles o variaciones como:

- EstadoGeneral / Estado general
- AvanceGeneral / Avance general
- ProximoPaso / Próximo paso
- FechaProximoPaso / Fecha próximo paso

Sigue siendo recomendado mantener la pestaña `Proyecto` con columnas:

Campo | Valor
