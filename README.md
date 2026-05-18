# Ruta de Avance Visible™ - Versión multi-cliente

Esta versión permite usar UNA sola app para varios clientes.

## Cómo funciona

La app lee el Google Sheet desde el link usando el parámetro:

```text
?sheet=ID_DEL_GOOGLE_SHEET
```

Ejemplo:

```text
https://tuapp.vercel.app/?sheet=1Catg2DFNqLHJ_Kvb9uqiKJhrcsVIpICP
```

Si no colocas `?sheet=...`, la app usará la variable de Vercel:

```text
VITE_SPREADSHEET_ID
```

Esto te permite tener:

- Una sola app publicada en Vercel
- Un Google Sheet diferente para cada cliente
- Un link único por cliente

## Estructura recomendada por cliente

Duplica la plantilla de Google Sheet para cada cliente:

```text
Ruta de Avance Visible - Troya Motors
Ruta de Avance Visible - Vital Gym
Ruta de Avance Visible - Hospital
```

Cada Sheet debe tener las mismas pestañas:

- Proyecto
- Hitos
- Hallazgos
- PendientesCliente
- Entregables
- Actualizaciones

## Pestaña Proyecto recomendada

Formato horizontal:

| Cliente | Servicio | EstadoGeneral | AvanceGeneral | ProximoPaso | FechaProximoPaso | ResponsableCliente | MensajeWhatsApp |
|---|---|---|---|---|---|---|---|
| Troya Motors | Business Power™ | En tiempo | 40 | Validación de hallazgos | 28 de mayo · 10h00 | Gerencia | Hola, equipo... |

## Cómo crear un link para un cliente

1. Abre el Google Sheet del cliente.
2. Copia el ID desde la URL:

```text
https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
```

3. Pégalo al final de la URL de la app:

```text
https://tuapp.vercel.app/?sheet=ESTE_ES_EL_ID
```

## Importante

El Google Sheet del cliente debe estar compartido como:

```text
Cualquier persona con el enlace → Lector
```

No coloques datos sensibles en la hoja que se muestra al cliente.
