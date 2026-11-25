# 04 — Clima y Reglas Regionales

## 1. Las Tres Zonas

Ecuador tiene tres grandes zonas climáticas relevantes para construcción:

| Zona | Clima | Temperatura típica | Humedad |
|---|---|---|---|
| **Costa** | Cálido-húmedo, tropical | 24–32°C | 70–90% |
| **Sierra** | Templado a frío, posible helada en alturas | 8–22°C | 40–75% |
| **Oriente** | Tropical húmedo, lluvias intensas | 22–30°C | 80–98% |

---

## 2. Mapeo de Provincias a Zona

### Costa (10 provincias)
| Provincia | Notas |
|---|---|
| Esmeraldas | Costa norte, muy húmedo |
| Manabí | Costa central |
| Santo Domingo de los Tsáchilas | Zona transición, se trata como Costa |
| Los Ríos | Interior Costa, muy húmedo |
| Guayas | Principal zona urbana de Costa |
| Santa Elena | Costa sur, más seco relativamente |
| El Oro | Costa sur |
| Bolívar | Interandino bajo, se trata como Costa para efectos de cálculo |
| Galápagos | Costa insular (clima especial, mismas reglas que Costa) |

> Nota: Santo Domingo y Bolívar son casos de borde. Para efectos del motor de cálculo se asignan a Costa porque la humedad predominante requiere las mismas protecciones.

### Sierra (10 provincias)
| Provincia | Altitud promedio | Categoría altitud |
|---|---|---|
| Carchi | 2.800–3.000 m | alto |
| Imbabura | 2.200–2.800 m | alto |
| Pichincha | 2.400–2.800 m (Quito ~2.850) | alto |
| Cotopaxi | 2.700–3.100 m | alto |
| Tungurahua | 2.500–2.800 m | alto |
| Bolívar (zona sierra) | 2.400–3.200 m | alto |
| Chimborazo | 2.750–3.300 m | alto |
| Cañar | 2.500–3.000 m | alto |
| Azuay | 2.300–2.800 m (Cuenca ~2.550) | alto |
| Loja | 1.800–2.200 m | medio |

> Loja es el único caso Sierra con altitud `medio`. El motor aplica reglas de helada solo para categoría `alto`.

### Oriente (5 provincias)
| Provincia | Notas |
|---|---|
| Sucumbíos | Nor-oriente, lluvias intensas |
| Napo | Oriente central |
| Orellana | Amazonía, muy húmedo |
| Pastaza | Amazonía centro-sur |
| Morona Santiago | Oriente sur, valles húmedos |
| Zamora Chinchipe | Oriente sur, zona transición |

---

## 3. Categorías de Altitud

Usadas principalmente dentro de la Sierra para precisar reglas de frost y aislamiento térmico.

| Categoría | Rango | Provincias principales |
|---|---|---|
| `bajo` | < 500 m s.n.m. | Provincias de Costa, Oriente |
| `medio` | 500–2.500 m | Loja, valles andinos intermedios |
| `alto` | > 2.500 m | Sierra central y norte |

La altitud de la capital provincial se usa como referencia cuando no se conoce la altitud exacta del proyecto. El cliente no ingresa altitud: el sistema la infiere desde la provincia.

---

## 4. Reglas de Materiales por Zona

### 4.1 Zona Costa

**Problema principal**: humedad alta y salinidad en zonas costeras directas, que acelera corrosión de metales y deteriora pinturas y selladores.

| Categoría | Regla | Implementación |
|---|---|---|
| Fierro / varillas | Usar varillas con recubrimiento anticorrosión o galvanizadas | Sustitución: `varilla_std` → `varilla_anticorrosion` |
| Clavos, tornillos, pernos | Usar versiones galvanizadas o inoxidables | Sustitución por producto con sufijo `_galv` |
| Pintura exterior | Usar pintura con protección UV y antihongos | Sustitución: `pintura_ext_std` → `pintura_ext_costa` |
| Impermeabilización | Obligatoria en losas, terrazas y paredes enterradas | Ítem adicional: `impermeabilizante_losa` con `condicion: "zona == 'costa'"` |
| Cerámica de piso | Preferir antideslizante (coeficiente R10 o superior) | Flag en receta: recomendar `ceramica_antideslizante` |
| Barreras de vapor | Recomendadas bajo losa de piso | Ítem adicional en recetas de contrapiso |
| Sellador de juntas | Usar sellador elastomérico en lugar de porcelana estándar para exteriores | Sustitución en ítems de fachada |

**Factor de precio**: los materiales anticorrosión tienen aproximadamente un 15–25% de sobreprecio respecto a su equivalente estándar. Este sobreprecio está incorporado en `productos.precio` directamente.

### 4.2 Zona Sierra

**Problema principal**: temperatura baja, posibles heladas en zonas sobre 2.500 m, ciclos de congelación-descongelación que agrietan materiales no preparados.

| Categoría | Altitud aplicable | Regla | Implementación |
|---|---|---|---|
| Pintura exterior | alto (>2.500m) | Usar pintura resistente a bajas temperaturas y congelación | Sustitución: `pintura_ext_std` → `pintura_ext_sierra` |
| Adhesivo para cerámica (bondex) | alto | Usar bondex flexible (C2 o superior, norma ISO 13007) | Sustitución: `bondex_std` → `bondex_flex` |
| Junta de cerámica (porcelana) | alto | Usar porcelana epóxica para exteriores o zonas húmedas-frías | Sustitución en exteriores |
| Aislamiento térmico | alto | Agregar lana de vidrio o poliestireno en cubiertas y muros exteriores | Ítem adicional con `condicion: "altitud == 'alto'"` |
| Mortero | alto | Usar aditivo anticongelante en mezclas para exterior | Ítem adicional: `aditivo_anticongelante` |
| Impermeabilización de cubierta | medio y alto | Obligatoria (lluvias concentradas + posible granizo) | Ítem adicional |

**Nota sobre Loja (altitud `medio`)**: aplica reglas de impermeabilización de cubierta pero NO aplica reglas de helada. Las pinturas estándar son aceptables.

### 4.3 Zona Oriente

**Problema principal**: humedad extrema permanente (nunca baja de 80%), lluvias torrenciales frecuentes, proliferación de hongos y moho, suelos en algunos sectores con riesgo de inundación.

| Categoría | Regla | Implementación |
|---|---|---|
| Pintura interior y exterior | Usar pintura antihongos con inhibidor de moho | Sustitución: `pintura_int_std` → `pintura_antihongo` |
| Impermeabilización | Doble capa obligatoria en losas y terrazas | Multiplicar cantidad de impermeabilizante × 1.5 |
| Cerámica de piso | Antideslizante obligatoria en exteriores | Flag en receta |
| Cimientos / fundaciones | Incluir material para elevación de losa (bloques tipo jamba o vigas de relleno) | Ítem adicional con `condicion: "zona == 'oriente'"` |
| Madera | Usar madera tratada con preservante de alta resistencia | Sustitución cuando hay ítems de madera |
| Sellador y junta | Usar masilla de poliuretano en lugar de sellador acrílico | Sustitución |

---

## 5. Cómo el Motor Aplica las Reglas

Existen dos mecanismos. Ambos están disponibles; la receta define cuál usar por ítem.

### Mecanismo A — Condición en ítem de receta (preferido)
El ítem lleva un campo `condicion` con una expresión que el motor evalúa con las mismas variables disponibles en las fórmulas más `zona` y `altitud`:

```json
{
  "producto_id": "impermeabilizante_losa",
  "nombre": "Impermeabilizante para losa",
  "formula": "area",
  "unidad": "litro",
  "desperdicio": 0.05,
  "gama": "all",
  "condicion": "zona == 'costa' || zona == 'oriente'"
}
```

Ventaja: las reglas están en la receta, visibles y editables por el asesor sin tocar código.

### Mecanismo B — Tabla de sustituciones (para sustitución de producto_id)
En `configuracion` existe la clave `sustituciones_climaticas` con valor jsonb de este formato:

```json
[
  {
    "producto_id_original": "varilla_std",
    "zonas": ["costa"],
    "altitudes": null,
    "producto_id_sustitucion": "varilla_anticorrosion",
    "nota": "Requerido por humedad y salinidad en zona Costa"
  },
  {
    "producto_id_original": "bondex_std",
    "zonas": ["sierra"],
    "altitudes": ["alto"],
    "producto_id_sustitucion": "bondex_flex",
    "nota": "Requerido por ciclos de congelación en Sierra alta"
  }
]
```

El motor aplica la tabla al final del Paso 3 (antes de buscar precios): si un ítem calculado tiene un `producto_id` que aparece en la tabla y la zona/altitud coincide, sustituye el producto_id. La nota de sustitución se agrega a `cotizacion.supuestos`.

---

## 6. Resumen de Reglas por Combinación

| Zona | Altitud | Reglas activas |
|---|---|---|
| Costa | bajo | Anticorrosión, vapor barrier, antideslizante, impermeabilización simple |
| Sierra | medio (Loja) | Impermeabilización cubierta |
| Sierra | alto | Todo lo anterior + resistencia a helada, aislamiento térmico, aditivo anticongelante |
| Oriente | bajo | Antihongos, impermeabilización doble, elevación de fundación, madera tratada |

No existen combinaciones costa+alto ni oriente+alto en la geografía ecuatoriana; el motor no necesita manejarlas.
