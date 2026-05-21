# Ruta de Avance Visible™ - V5.3 Fix Ruta Mobile

## Corrección

Se corrige el problema donde la pestaña `Ruta` quedaba en blanco en versión móvil.

## Qué se ajustó

- Se eliminó una regla CSS demasiado amplia que ocultaba el primer bloque de contenido en móvil.
- Ahora solo se oculta la tarjeta estática marcada como `mobileStaticHero`.
- La ruta del proyecto vuelve a mostrarse correctamente.

## Archivo principal a reemplazar

```text
src/index.css
```

También puedes reemplazar:

```text
src/main.jsx
src/sheets.js
src/index.css
```
