# Ruta de Avance Visible™ - Conectada a Google Sheets

Esta versión lee datos desde Google Sheets y muestra un tablero visual para el cliente.

## 1. Estructura esperada del Google Sheet

La app espera estas pestañas, con estos nombres exactos:

- Proyecto
- Hitos
- Hallazgos
- PendientesCliente
- Entregables
- Actualizaciones

Puedes usar el archivo `plantilla_ruta_avance_visible_google_sheets.xlsx` como base.

## 2. Cómo conectar Google Sheets

1. Sube la plantilla a Google Drive.
2. Ábrela como Google Sheets.
3. No cambies los nombres de las pestañas ni las columnas.
4. En Google Sheets ve a: Archivo > Compartir > Publicar en la web.
5. Publica el documento.
6. Copia el ID del Google Sheet desde la URL.

Ejemplo de URL:
https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit#gid=0

## 3. Configurar en Vercel

En Vercel:

1. Entra a tu proyecto.
2. Ve a Settings > Environment Variables.
3. Crea esta variable:

VITE_SPREADSHEET_ID

4. Pega el ID de tu Google Sheet como valor.
5. Guarda.
6. Vuelve a desplegar la app.

## 4. Modo demo

Si no configuras `VITE_SPREADSHEET_ID`, la app mostrará datos demo.

## 5. Importante

No incluyas información sensible en el Google Sheet publicado:
- sueldos individuales
- evaluaciones personales
- datos financieros confidenciales
- información interna delicada

Este tablero debe mostrar avance, hitos, pendientes y bloqueos, no datos confidenciales.
