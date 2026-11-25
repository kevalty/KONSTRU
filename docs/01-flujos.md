# 01 — Flujos y Estados

## 1. Flujo del Cliente

```
[Home /]
  │
  ▼
[Chat /chat]
  │  Usuario describe el trabajo (obra, dimensiones, ubicación, presupuesto)
  │  El bot hace preguntas una por una
  │  Al final pide confirmación del resumen
  │
  ▼
[Generación de cotizaciones]
  │  El sistema calcula 3 variantes: económica · media · premium
  │  Se guardan en `cotizaciones` con estado `lista`
  │
  ▼
[WhatsApp: cotizacion_lista]
  │  Mensaje al número del cliente con resumen de las 3 cotizaciones
  │  Incluye link: https://<dominio>/c/<link_token>
  │
  ▼
[Vista cotización /c/:token]
     Cliente puede ver el desglose completo de materiales y precios
     No requiere login
```

El cliente nunca ve el panel del asesor. No hay cuenta de cliente. La interacción termina cuando el cliente recibe el WhatsApp o visita el link.

---

## 2. Flujo del Asesor

```
[Login /login]
  │  Email + password (Supabase Auth)
  │
  ▼
[Lista de solicitudes /asesor/solicitudes]
  │  Tabla con todas las solicitudes: fecha, tipo de trabajo, zona, estado
  │  Filtros: estado, fecha, zona
  │
  ▼
[Detalle de solicitud /asesor/solicitudes/:id]
  │  Ve el resumen del chat, dimensiones, ubicación
  │  Ve las 3 cotizaciones generadas
  │  Puede editar notas, ajustar cantidades si es necesario
  │  Botón: "Confirmar y crear pedido"
  │
  ▼  (acción: confirmar)
[Crear pedido /asesor/solicitudes/:id/pedido/nuevo]
  │  Selecciona proveedor (ferretería) de la lista
  │  Revisa los ítems que se enviarán
  │  Botón: "Enviar a ferretería"
  │
  ▼  (acción: enviar)
[Pedido enviado]
  │  Se genera link_token para el pedido
  │  WhatsApp enviado a la ferretería: orden_ferreteria con link o/<token>
  │  Estado del pedido pasa a `enviado`
  │
  ▼
[Seguimiento /asesor/pedidos/:id]
     Asesor ve en tiempo real el estado de cada ítem
     Cuando todos los ítems están marcados → botón "Marcar como completado"
     WhatsApp enviado al asesor: orden_completada
```

---

## 3. Flujo de la Ferretería

```
[Recibe WhatsApp: orden_ferreteria]
  │  Mensaje contiene: link o/<token> + codigo_acceso (6 dígitos)
  │
  ▼
[Vista orden /o/:token]
  │  Formulario de acceso: ingresar codigo_acceso
  │  Si el código es incorrecto: 3 intentos máximo, luego bloqueo temporal (15 min)
  │
  ▼
[Lista de ítems del pedido]
  │  Tabla: producto, cantidad, unidad
  │  El número de teléfono del cliente NO aparece (solo ve el código de pedido)
  │  Para cada ítem, la ferretería selecciona uno de tres estados:
  │    ✓ disponible
  │    ✗ sin_stock
  │    ~ sustitucion_pendiente (puede agregar nota con producto alternativo)
  │
  ▼
[Marcar ítems]
  │  Puede guardar progreso parcial (estado del ítem se actualiza al marcar)
  │  No puede enviar hasta que TODOS los ítems tengan un estado distinto a `pendiente`
  │
  ▼
[Enviar lista completa]
  │  Botón habilitado cuando todos los ítems están marcados
  │  Confirma envío
  │
  ▼
[Notificación al asesor]
     Sistema envía WhatsApp orden_completada al asesor
     Estado del pedido pasa a `en_proceso` → asesor lo cierra a `completado`
```

**Regla de validación crítica:** La ferretería no recibe ningún link ni código hasta que el asesor haya confirmado la solicitud. El botón "Enviar a ferretería" solo existe si `solicitud.estado = confirmada`.

---

## 4. Máquina de Estados: Solicitud

```
nueva ──────────────────────────────► cancelada
  │                                       ▲
  ▼                                       │
en_revision ──────────────────────────────┤
  │                                       │
  ▼                                       │
confirmada ────────────────────────────────┘
```

| Estado | Quién lo asigna | Precondición |
|---|---|---|
| `nueva` | Sistema (al finalizar chat) | — |
| `en_revision` | Asesor (al abrir el detalle) | estado = `nueva` |
| `confirmada` | Asesor (botón confirmar) | estado = `en_revision`, cotizaciones generadas |
| `cancelada` | Asesor | cualquier estado excepto `confirmada` con pedido activo |

Transiciones inválidas son rechazadas en el servidor. No existe transición de `confirmada` a `en_revision`.

---

## 5. Máquina de Estados: Pedido

```
borrador ──► enviado ──► en_proceso ──► completado
    │            │             │
    └────────────┴─────────────┴──► cancelado
```

| Estado | Quién lo asigna | Precondición |
|---|---|---|
| `borrador` | Sistema (al crear pedido) | solicitud.estado = `confirmada` |
| `enviado` | Asesor (botón enviar) | estado = `borrador` |
| `en_proceso` | Sistema (al recibir lista de ferretería) | estado = `enviado` |
| `completado` | Asesor | estado = `en_proceso` |
| `cancelado` | Asesor | estado ≠ `completado` |

---

## 6. Máquina de Estados: ItemPedido

```
pendiente ──► disponible
     │
     ├──► sin_stock
     │
     └──► sustitucion_pendiente
```

| Estado | Quién lo asigna |
|---|---|
| `pendiente` | Sistema (al crear el ítem) |
| `disponible` | Ferretería |
| `sin_stock` | Ferretería |
| `sustitucion_pendiente` | Ferretería (con nota de alternativa) |

No existe transición de vuelta a `pendiente` una vez marcado. Si la ferretería quiere corregir, puede cambiar entre los tres estados no-pendiente antes de enviar la lista final.

---

## 7. Pantallas UI

| Pantalla | Ruta | Descripción |
|---|---|---|
| Home | `/` | Landing page: descripción del servicio, botón "Cotizar ahora" |
| Chat | `/chat` | Interfaz de chat con el bot. Input de texto, burbuja de mensajes, indicador de escritura |
| Vista cotización | `/c/:token` | Desglose de las 3 cotizaciones. Solo lectura. Sin login. |
| Login asesor | `/login` | Formulario email + password |
| Lista solicitudes | `/asesor/solicitudes` | Tabla paginada con filtros de estado y zona |
| Detalle solicitud | `/asesor/solicitudes/:id` | Resumen de chat + 3 cotizaciones + notas + botón confirmar |
| Crear pedido | `/asesor/solicitudes/:id/pedido/nuevo` | Selección de proveedor + revisión de ítems |
| Lista pedidos | `/asesor/pedidos` | Tabla de pedidos con estado |
| Detalle pedido | `/asesor/pedidos/:id` | Ítems con estado por ítem, botón completar |
| Acceso ferretería | `/o/:token` | Formulario de código de acceso |
| Vista orden ferretería | `/o/:token/items` | Tabla de ítems con controles de estado + botón enviar |

---

## 8. Reglas de Validación

1. **Generación de cotizaciones**: el sistema solo genera cotizaciones si la solicitud tiene tipo de trabajo, al menos una medida y ubicación. Si falta alguno, el bot vuelve a preguntar.
2. **Confirmación por asesor**: ninguna acción sobre ferreterías ocurre si `solicitud.estado ≠ confirmada`. Esta regla se aplica tanto en el servidor (middleware) como en la UI (botones deshabilitados).
3. **Envío de lista**: la ferretería no puede enviar si `items_pedido` tiene algún ítem en estado `pendiente`.
4. **Intentos de código**: máximo 3 intentos de codigo_acceso incorrecto antes de bloqueo temporal de 15 minutos. Se registra IP y timestamp.
5. **Expiración de token de cotización**: `cotizaciones.valida_hasta` es 7 días desde la creación. Pasado ese plazo el link muestra aviso de cotización vencida.
6. **Un pedido por proveedor por solicitud**: no se puede crear un segundo pedido al mismo proveedor para la misma solicitud si el primero está en estado `enviado` o `en_proceso`.
