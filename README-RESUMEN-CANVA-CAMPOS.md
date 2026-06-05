# Resumen Canva - campos recomendados

La nueva pantalla Resumen ya funciona con los datos actuales, pero algunas partes usan inferencias porque todavia no existen campos especificos en Google Sheets.

## Pestaña Proyecto

Campos opcionales recomendados:

- ColorMarca
- ColorSecundario
- ColorFondo
- CodigoAcceso

## Nueva pestaña Reuniones

Recomendada para el desplegable de reuniones:

- ID
- Titulo
- Fecha
- Hora
- LinkMeet
- Estado
- Descripcion

Ejemplos de Estado:

- Programada
- Realizada
- Reprogramada

## Pestaña Hitos

Campos recomendados para controlar pagos y desbloqueo:

- Orden
- CodigoHito
- FechaInicio
- FechaFin
- BloquePago
- EstadoDesbloqueo
- EstadoPago

Ejemplos:

- BloquePago: Anticipo, Mes 1, Mes 2, Mes 3
- EstadoDesbloqueo: Abierto, Cerrado
- EstadoPago: Pagado, Pendiente

Mientras estos campos no existan, la app abre provisionalmente los primeros 4 hitos y marca el resto segun estado.

## Pestaña MetricasSistema

Recomendada para que "Avances por Sistema" no dependa de inferencias:

- Sistema
- Total
- Completado
- EnProceso
- Pendiente
- Etiqueta

Ejemplos de Sistema:

- Hallazgos
- Perfiles
- Nivel de empleabilidad
- Masa salarial

## Pestañas COEASIS y COETOBE

Para que el grafico COE sea real, completar:

- COSTO (xmin)
- FRECUENCIA

O crear:

- CostoMensual
- Mes

Si se necesita tendencia de 6 meses real, crear una nueva pestaña:

## Nueva pestaña COETendencia

- Mes
- COEASIS
- COETOBE
- CLIOtroIndicador
