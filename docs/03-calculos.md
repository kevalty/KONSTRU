# 03 — Motor de Cálculo

## 1. Sistema de Recetas

Cada tipo de trabajo tiene una receta: un archivo JSON que define qué materiales se necesitan y cómo calcular la cantidad de cada uno a partir de las medidas del cliente.

### Estructura de una receta

```json
{
  "categoria": "ceramica_piso",
  "version": "1.0.0",
  "descripcion": "Cerámica para piso interior",
  "variables_requeridas": ["area"],
  "items": [
    {
      "producto_id": "ceramica_piso_std",
      "nombre": "Cerámica de piso",
      "formula": "area",
      "unidad": "m2",
      "desperdicio": 0.10,
      "gama": "all",
      "producto_por_gama": {
        "economica": "ceramica_nacional_30x30",
        "media": "ceramica_importada_40x40",
        "premium": "porcelanato_60x60"
      }
    },
    {
      "producto_id": "bondex_ceramica",
      "nombre": "Bondex (pegante)",
      "formula": "area * 0.004",
      "unidad": "m3",
      "desperdicio": 0.05,
      "gama": "all",
      "producto_por_gama": {
        "economica": "bondex_std",
        "media": "bondex_std",
        "premium": "bondex_flex"
      }
    },
    {
      "producto_id": "porcelana_junta",
      "nombre": "Porcelana para juntas",
      "formula": "area * 0.0015",
      "unidad": "m3",
      "desperdicio": 0.05,
      "gama": "all"
    }
  ]
}
```

**Campos de cada ítem**:

| Campo | Tipo | Descripción |
|---|---|---|
| `producto_id` | string | ID genérico del producto (key de búsqueda en catálogo) |
| `nombre` | string | Nombre legible para mostrar en cotización |
| `formula` | string | Expresión matemática en variables del sistema |
| `unidad` | string | Unidad de la cantidad calculada (`m2`, `m3`, `kg`, `unidad`, `bolsa`) |
| `desperdicio` | number | Factor de desperdicio (0.10 = 10%). Se suma al resultado |
| `gama` | string | `economica`, `media`, `premium`, o `all` (aplica a todas) |
| `producto_por_gama` | object | Map de gama → producto_id concreto del catálogo |
| `condicion` | string? | Expresión booleana opcional: ítem solo se incluye si la condición es verdadera (ej. `"zona == 'costa'"`) |
| `nota` | string? | Texto que aparece en la cotización como supuesto |

Las recetas se almacenan en la tabla `recetas_config` y se cargan al inicio de cada cálculo.

---

## 2. Variables Disponibles en Fórmulas

Todas las variables están en unidades SI (metros, metros cuadrados, metros cúbicos).

| Variable | Tipo | Descripción |
|---|---|---|
| `largo` | number | Longitud en metros |
| `ancho` | number | Ancho en metros |
| `alto` | number | Altura en metros |
| `perimetro` | number | Calculado: `2 * (largo + ancho)` si no se provee directamente |
| `area` | number | Calculado: `largo * ancho`, o valor directo si el cliente dio m² |
| `volumen` | number | Calculado: `largo * ancho * alto` |
| `zona` | string | `costa`, `sierra`, u `oriente` |
| `altitud` | string | `bajo`, `medio`, u `alto` |

Cuando el cliente da múltiples áreas (ej. dos baños), el motor suma todas las áreas en una sola variable `area` total antes de evaluar las fórmulas. Si se necesitan calcular por separado (ej. para un techo inclinado), la receta puede definir ítems con `condicion`.

Las fórmulas son expresiones matemáticas simples. El evaluador soporta: `+`, `-`, `*`, `/`, `(`, `)`, y números decimales. No soporta funciones ni condicionales dentro de la fórmula (usar `condicion` para eso).

---

## 3. Pasos del Cálculo

### Paso 1 — Parsear medidas del chat
Extraer de `solicitud.medidas` (jsonb) todas las medidas. Para cada área:
- Si tiene `largo_m` y `ancho_m`: calcular `area_m2 = largo * ancho`
- Si tiene `area_m2` directo: usarlo
- Sumar todas las áreas para obtener `area` total
- Si hay `alto_m`: usar el primero que esté disponible (para trabajos de pared)
- Calcular `perimetro` si hay `largo` y `ancho`
- Calcular `volumen` si hay `area` y `alto`

### Paso 2 — Cargar recetas aplicables
Buscar en `recetas_config` donde `trabajo_tipo = solicitud.trabajo_tipo` y `activo = true`. Ordenar por `version` desc, tomar la más reciente.

### Paso 3 — Evaluar cada fórmula
Para cada ítem de la receta:
1. Evaluar `condicion` si existe. Si es falsa, omitir el ítem.
2. Evaluar la `formula` con las variables del paso 1.
3. Si la evaluación falla (variable faltante, división por cero): marcar el ítem como `sin_formula` y continuar. La cotización se marcará `por_confirmar`.

### Paso 4 — Aplicar factor de desperdicio
```
cantidad_con_desperdicio = cantidad_base * (1 + desperdicio)
```

### Paso 5 — Redondear al múltiplo vendible (ver sección 4)

### Paso 6 — Buscar precio por unidad y gama
Para cada ítem y cada gama (económica/media/premium):
- Buscar en `productos` donde `producto_id` coincide con `producto_por_gama[gama]` y `activo = true`
- Si no existe precio: marcar ese ítem/gama como `sin_precio`, la cotización de esa gama queda `por_confirmar`

### Paso 7 — Aplicar ajustes climáticos (ver `docs/04-clima.md`)
Algunos ajustes agregan ítems adicionales. Otros sustituyen el `producto_id` elegido por uno con mejor especificación. Ambos ocurren después del paso 5 y antes del paso 6, o se implementan como ítems con `condicion` en la propia receta.

---

## 4. Reglas de Redondeo

El redondeo siempre va hacia arriba (techo), nunca hacia abajo. Vender de menos es inaceptable.

| Material / Unidad | Regla | Ejemplo |
|---|---|---|
| Cerámica / porcelanato (`m2`) | Redondear al múltiplo de caja. El tamaño de caja está en `productos.caja_m2` (default 1.5 m²) | 14.2 m² → 15 m² (10 cajas de 1.5) |
| Cemento, bondex, porcelana (`bolsa`) | Redondear al entero superior | 4.1 bolsas → 5 bolsas |
| Pintura (`litro` o `galón`) | Redondear al galón superior (1 galón = 3.785 L) | 7.2 L → 2 galones |
| Hierro, alambre (`kg`) | Redondear al kg superior | 23.4 kg → 24 kg |
| Ladrillos, bloques (`unidad`) | Redondear al entero superior | 312.3 → 313 |
| Volumen (`m3`) | Redondear al múltiplo de 0.05 superior | 0.73 m³ → 0.75 m³ |
| Área genérica (`m2`) | Redondear al múltiplo de 0.5 superior | 14.3 m² → 14.5 m² |

La lógica de redondeo vive en una función pura `roundToSellableUnit(cantidad, unidad, producto)` que recibe el producto para acceder a `caja_m2` u otras propiedades de empaque.

---

## 5. Niveles de Precio (Gama)

Cada cotización se genera en tres variantes simultáneas:

| Gama | Criterio de selección |
|---|---|
| `economica` | Producto más barato disponible de la categoría requerida |
| `media` | Producto de rango medio (precio entre p25 y p75 de la categoría) |
| `premium` | Producto de mayor calidad/precio disponible de la categoría |

La selección concreta se hace a través de `producto_por_gama` en la receta. Si la receta no define gama específica para un ítem (`gama: "all"`), el mismo producto se usa en las tres cotizaciones.

---

## 6. Cálculo de Totales

```
subtotal_gama = Σ (cantidad_redondeada[i] × precio_unitario[i])  para todos los ítems de esa gama

iva_monto = subtotal_gama × iva_porcentaje
iva_porcentaje = configuracion['iva_porcentaje'] (default: 0.15 = 15%)

total_gama = subtotal_gama + iva_monto
```

**Estado de la cotización**:
- `lista`: todos los ítems tienen precio, cálculo completo
- `por_confirmar`: al menos un ítem no tiene precio, o al menos una medida era aproximada. Se muestra al cliente con una nota aclaratoria.

Los `supuestos` de la cotización son un array de strings con todas las advertencias: medidas aproximadas, ítems sin precio, sustituciones climáticas aplicadas.

---

## 7. Ajustes Climáticos

Detalle completo en `docs/04-clima.md`. Desde el punto de vista del motor de cálculo:

**Tipo A — Ítem adicional**: la receta incluye un ítem con `condicion: "zona == 'costa'"`. Si la condición se cumple, el ítem se agrega normalmente al cálculo. No requiere lógica especial en el motor.

**Tipo B — Sustitución de producto**: la receta define en `producto_por_gama` variantes por zona, o el motor aplica una tabla de sustituciones definida en `configuracion['sustituciones_climaticas']` (jsonb). La sustitución reemplaza el `producto_id` antes del paso de búsqueda de precio, dejando la misma cantidad calculada.

**Ajuste de precio Costa**: materiales anticorrosión tienen un 5% adicional en su precio base. Este 5% está incorporado directamente en `productos.precio` para los productos de esa categoría, no es un multiplicador en el motor.
