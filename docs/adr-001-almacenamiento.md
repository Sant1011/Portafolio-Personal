# ADR-001: Diseño del almacenamiento del proyecto en Amazon S3

- Fecha: 2026-10-20
- Autor: Joshua Werminsky
- Estado: Aceptada

## Contexto

El proyecto es un sitio web estático (`index.html`, `style.css`, `back.js`, `ft.jpg`) publicado desde S3, más datos que no deben ser públicos: contactos, respaldos y configuración.
Al inicio había un bucket público y un bucket privado con un archivo de prueba, sin criterio de qué guardar en cada uno.
Sin versionado, un borrado accidental de `index.html` era permanente y el sitio quedaba caído.
Al activar el versionado, las versiones se acumulan y generan costo sin límite.
Había que decidir dónde vive cada dato según quién debe leerlo y cómo recuperar archivos sin que el costo crezca.

## Decision

Dos buckets con versionado activado en ambos:

- **Sitio** (`cuc-bp-eq06-werminsky-sitio-2026`): público, solo lectura. Regla de ciclo de vida `retencion-sitio` sobre versiones no actuales: 30 días a Standard-IA, 90 a Glacier Flexible Retrieval y 365 eliminación.
- **Privado** (`cuc-bp-eq06-werminsky-privado-2026`): sin acceso público, con prefijos `contactos/`, `respaldos/` y `configuracion/`.

## Alternativas consideradas

- **Un solo bucket para todo:** descartada porque el acceso público se configura por bucket, y un error de política expondría datos personales y credenciales.
- **Sin versionado:** descartada porque un borrado de `index.html` sería irrecuperable.
- **Versionado sin regla de ciclo de vida:** descartada porque las versiones se acumularían sin tope y el costo crecería cada mes.

## Consecuencias

### Positivas

- Los datos sensibles quedan aislados en un bucket sin acceso público.
- Los borrados y sobrescrituras se pueden recuperar.
- El costo se controla: con 10 GB baja de 2.76 a 1.32 USD al año (ahorro de 1.44 USD, cerca del 52 %).

### Costos o desventajas que aceptamos

- El versionado ocupa espacio extra y hay dos buckets que administrar.
- Pasados 365 días, las versiones antiguas se eliminan y no se pueden recuperar.
- Recuperar desde Glacier tarda de minutos a horas.
- S3 no hace transiciones de objetos menores de 128 KB por defecto, así que con archivos de pocos KB aporta más la regla de eliminación que las transiciones.

### Que habria que revisar mas adelante

- Agregar una regla de ciclo de vida al bucket privado.
- Revisar los plazos de 30, 90 y 365 días con datos reales de uso.
- Evaluar CloudFront para tener HTTPS, porque el endpoint de sitio estático solo sirve HTTP.
