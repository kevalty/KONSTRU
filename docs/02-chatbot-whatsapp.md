# 02 — Chatbot y WhatsApp

## 1. Fases de la Conversación

El bot conduce al usuario por 5 fases en orden. No avanza a la siguiente fase hasta que la actual está completa y validada. Si el usuario da información de múltiples fases en un solo mensaje, el bot la extrae toda pero confirma cada parte en orden.

### Fase 1 — Saludo y tipo de trabajo
**Objetivo**: identificar qué obra quiere cotizar.

- El bot saluda y pregunta qué tipo de trabajo desea cotizar.
- El usuario puede escribir libremente ("quiero poner cerámica en el baño", "necesito construir una pared").
- El bot mapea la descripción a uno de los tipos de trabajo registrados en el sistema (ej. `ceramica_piso`, `pared_ladrillo`, `pintura_interior`, `cubierta_zinc`, `contrapiso`).
- Si no puede mapear con confianza, presenta una lista de opciones numeradas y pide que el usuario elija.
- Llama a la herramienta `registrar_trabajo` al confirmar.

### Fase 2 — Dimensiones y medidas
**Objetivo**: obtener las medidas necesarias para calcular materiales.

- El bot pregunta las dimensiones según el tipo de trabajo:
  - Pisos/paredes: largo y ancho (o área directamente)
  - Paredes: también alto
  - Volúmenes (contrapiso, cimientos): largo, ancho y espesor/alto
- Acepta medidas en metros. Si el usuario da en otras unidades (pies, varas, cm), convierte y confirma.
- Si el usuario no sabe las dimensiones exactas ("más o menos 20 metros cuadrados"), acepta la aproximación y la marca en `supuestos`.
- Llama a `agregar_medida` por cada dimensión confirmada.
- Puede haber múltiples áreas (ej. "baño 3×2 y pasillo 1×5"): las agrega todas.

### Fase 3 — Ubicación
**Objetivo**: saber provincia y zona climática.

- Pregunta en qué provincia está la obra.
- Acepta nombres de provincias en español con variaciones ortográficas comunes (ej. "Guayas", "El Oro", "Pichincha").
- Infiere la zona (costa/sierra/oriente) desde la provincia automáticamente (ver `docs/04-clima.md`).
- Si la provincia no es reconocida, lista las 24 provincias y pide que elija.
- Llama a `registrar_ubicacion` con `{ provincia, zona, altitud_categoria }`.

### Fase 4 — Preferencia de presupuesto
**Objetivo**: saber si el cliente prioriza precio, calidad media, o lo mejor.

- El bot pregunta brevemente si prefiere la opción más económica, una relación costo-calidad, o materiales premium.
- El input es libre; mapea a `gama_preferida`: `economica`, `media`, o `premium`.
- Si el usuario quiere ver todas las opciones: registra `todas`.
- Esta información influye en qué cotización se destaca primero en el mensaje de WhatsApp.

### Fase 5 — Resumen y confirmación
**Objetivo**: confirmar toda la información antes de generar cotizaciones.

- El bot presenta un resumen estructurado:
  ```
  Trabajo: Cerámica de piso
  Área: 15 m² (baño principal 3×3, baño secundario 2×3)
  Ubicación: Guayaquil, Guayas (zona Costa)
  Presupuesto: Económico
  
  ¿Los datos son correctos? Responde SÍ para generar tu cotización o dime qué deseas corregir.
  ```
- Si el usuario confirma, llama a `confirmar_solicitud`.
- Si pide corrección, identifica qué fase corregir y regresa a ella.
- Después de `confirmar_solicitud`, el bot responde que las cotizaciones se enviarán por WhatsApp en unos segundos.

---

## 2. Herramientas Claude (Function Calling)

El bot opera con `tool_choice: auto`. Las herramientas son funciones del servidor; el bot las llama cuando tiene confianza suficiente, no antes.

### `registrar_trabajo`
```json
{
  "name": "registrar_trabajo",
  "description": "Registra el tipo de trabajo de construcción que el cliente desea cotizar.",
  "parameters": {
    "tipo": "string — slug del tipo de trabajo (ej. ceramica_piso, pared_ladrillo)",
    "descripcion_original": "string — texto exacto que dio el cliente"
  }
}
```

### `agregar_medida`
```json
{
  "name": "agregar_medida",
  "description": "Agrega una medida o dimensión a la solicitud. Llamar una vez por cada área o conjunto de dimensiones.",
  "parameters": {
    "largo_m": "number | null",
    "ancho_m": "number | null",
    "alto_m": "number | null",
    "area_m2": "number | null — si el usuario dio área directamente",
    "volumen_m3": "number | null",
    "descripcion": "string — ej. 'baño principal', 'pared norte'",
    "es_aproximado": "boolean — true si el usuario indicó que es un estimado"
  }
}
```

### `registrar_ubicacion`
```json
{
  "name": "registrar_ubicacion",
  "description": "Registra la ubicación de la obra.",
  "parameters": {
    "provincia": "string — nombre oficial de la provincia",
    "zona": "string enum: costa | sierra | oriente",
    "altitud_categoria": "string enum: bajo | medio | alto"
  }
}
```

### `confirmar_solicitud`
```json
{
  "name": "confirmar_solicitud",
  "description": "Marca la solicitud como completa y dispara la generación de cotizaciones. Solo llamar cuando el usuario ha confirmado explícitamente el resumen.",
  "parameters": {
    "gama_preferida": "string enum: economica | media | premium | todas",
    "notas_adicionales": "string | null — cualquier detalle extra que mencionó el cliente"
  }
}
```

---

## 3. System Prompt — Principios

El system prompt se mantiene conciso y directo. Principios que debe seguir el modelo:

1. **Una pregunta a la vez.** Nunca hacer dos preguntas en el mismo mensaje. Si falta información de múltiples fases, priorizar en orden.
2. **Siempre en español.** Respuestas naturales, sin tecnicismos de construcción innecesarios. Evitar anglicismos.
3. **Nunca inventar cantidades.** El bot no calcula ni estima materiales durante la conversación. Solo recopila datos. Los cálculos los hace el motor de cálculo.
4. **Nunca dar precios durante el chat.** Los precios están en las cotizaciones generadas, no en la conversación.
5. **Tono amable y directo.** No usar frases como "¡Claro que sí!" ni emojis excesivos. Máximo un emoji por mensaje si se usa.
6. **Validar antes de continuar.** Antes de llamar una herramienta, confirmar brevemente la información entendida.
7. **Manejo de fuera de tema.** Si el usuario pregunta algo no relacionado con la cotización, responder brevemente y redirigir.
8. **Supuestos explícitos.** Cuando se acepta un dato aproximado, decirlo: "Anotaré 20 m² como medida aproximada."

Fragmento del system prompt:
```
Eres el asistente de cotización de materiales de construcción. Tu única función es 
recopilar la información necesaria para generar una cotización: tipo de trabajo, 
medidas, ubicación y preferencia de presupuesto. 

No calcules materiales, no des precios, no hagas recomendaciones de marcas. 
Haz una pregunta a la vez. Responde siempre en español.
Cuando tengas todo, presenta un resumen y pide confirmación antes de llamar confirmar_solicitud.
```

---

## 4. Templates de WhatsApp

Los mensajes de WhatsApp usan templates pre-aprobados (en modo real). En modo simulado, se loguea el contenido completo. Todos los templates están en español.

### `cotizacion_lista`
**Destinatario**: cliente (número del chat)  
**Momento**: inmediatamente después de `confirmar_solicitud` y generación exitosa de cotizaciones

```
Hola, aquí están sus 3 cotizaciones para {{1}}:

💰 Económica:    ${{2}}
⚖️  Media:         ${{3}}
✨ Premium:      ${{4}}

Ver desglose completo:
{{5}}

Válidas por 7 días. Un asesor se comunicará con usted pronto.
```

Variables: `{{1}}` tipo de trabajo, `{{2}}` total económica, `{{3}}` total media, `{{4}}` total premium, `{{5}}` link `https://<dominio>/c/<token>`

---

### `pedido_confirmado`
**Destinatario**: asesor (número configurado en `configuracion.clave = 'whatsapp_asesor'`)  
**Momento**: cuando la ferretería envía su lista completa

```
Pedido #{{1}} listo para revisar.
Ferretería: {{2}}
Ítems disponibles: {{3}}/{{4}}

Ver pedido:
{{5}}
```

Variables: `{{1}}` id pedido, `{{2}}` nombre proveedor, `{{3}}` ítems disponibles, `{{4}}` total ítems, `{{5}}` link `/asesor/pedidos/<id>`

---

### `orden_ferreteria`
**Destinatario**: ferretería (teléfono del proveedor)  
**Momento**: cuando el asesor hace clic en "Enviar a ferretería"

```
Nueva orden de materiales.
Código de acceso: {{1}}

Ingrese al siguiente link para ver y confirmar disponibilidad:
{{2}}

Este link es válido por 48 horas.
```

Variables: `{{1}}` codigo_acceso (6 dígitos), `{{2}}` link `https://<dominio>/o/<token>`

---

### `orden_completada`
**Destinatario**: asesor  
**Momento**: cuando la ferretería envía su lista completa

```
✅ La ferretería {{1}} completó la orden #{{2}}.

Resumen:
- Disponible: {{3}} ítems
- Sin stock: {{4}} ítems
- Con sustitución: {{5}} ítems

Ver detalle:
{{6}}
```

Variables: nombre proveedor, id pedido, conteos por estado, link al detalle

---

## 5. Modo Simulación

Controlado por la variable de entorno `WHATSAPP_MODE`.

| Valor | Comportamiento |
|---|---|
| `simulado` (default en dev) | No envía mensajes. Escribe en consola y en tabla `whatsapp_logs` con `enviado=false` |
| `real` | Usa la API de WhatsApp Business. Requiere `WHATSAPP_API_TOKEN` y `WHATSAPP_PHONE_ID` |

En modo simulado, la tabla `whatsapp_logs` almacena:
- `destinatario` (número)
- `template_name`
- `variables` (jsonb)
- `created_at`
- `enviado` (false en simulado)

Esto permite verificar en desarrollo qué mensajes se habrían enviado sin un número real de WhatsApp Business.

---

## 6. Rate Limits

Para prevenir abuso o bucles de error:

- **Por número de teléfono**: máximo 10 mensajes salientes por hora. Si se supera, el mensaje se encola y se envía después, o se descarta con log de error según configuración.
- **Por sesión de chat**: máximo 50 turnos de conversación. Si se supera, el bot responde que la sesión expiró y da un número de contacto de soporte.
- **Intentos de codigo_acceso**: máximo 3 por ventana de 15 minutos por IP. Después, bloqueo de 15 minutos.
- **Generación de cotizaciones**: máximo 3 cotizaciones por número de teléfono por día (evita llamadas masivas a Claude).

Los rate limits se implementan con contadores en la tabla `rate_limits` (clave, ventana_inicio, contador) o con Redis si está disponible.
