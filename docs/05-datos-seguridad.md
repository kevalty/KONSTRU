# 05 — Modelo de Datos y Seguridad

## 1. Tablas de la Base de Datos

La base de datos es PostgreSQL en Supabase. Todas las tablas usan `id uuid DEFAULT gen_random_uuid()` como clave primaria salvo indicación contraria. Se asume extensión `pgcrypto` activa.

---

### `solicitudes`

Registra cada conversación de chat que llegó a confirmación.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador |
| `created_at` | timestamptz DEFAULT now() | Fecha/hora de creación |
| `numero_telefono` | text | Número del cliente en formato E.164. **Almacenado en claro solo para service_role**. Los asesores lo ven enmascarado. Las ferreterías NO lo ven. |
| `numero_telefono_hash` | text | SHA-256 hex del número, para búsquedas sin exponer el número real |
| `estado` | text | `nueva` \| `en_revision` \| `confirmada` \| `cancelada` |
| `trabajo_tipo` | text | Slug del tipo de trabajo (ej. `ceramica_piso`) |
| `medidas` | jsonb | Array de objetos con largo_m, ancho_m, alto_m, area_m2, descripcion, es_aproximado |
| `ubicacion` | jsonb | `{ provincia, zona, altitud_categoria }` |
| `gama_preferida` | text | `economica` \| `media` \| `premium` \| `todas` |
| `notas` | text | Notas adicionales del cliente o del asesor |
| `asesor_id` | uuid FK → auth.users | Asesor asignado (null hasta que un asesor abre el detalle) |

Índices: `(estado)`, `(created_at DESC)`, `(numero_telefono_hash)`.

---

### `cotizaciones`

Una solicitud genera hasta 3 cotizaciones (una por gama).

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | — |
| `solicitud_id` | uuid FK → solicitudes | — |
| `gama` | text | `economica` \| `media` \| `premium` |
| `estado` | text | `lista` \| `por_confirmar` \| `vencida` |
| `items` | jsonb | Array de ítems calculados: `[{ producto_id, nombre, cantidad, unidad, precio_unitario, subtotal_item, notas }]` |
| `subtotal` | numeric(10,2) | Suma de subtotales sin IVA |
| `iva_porcentaje` | numeric(5,4) | Porcentaje de IVA aplicado (ej. 0.1500) |
| `iva_monto` | numeric(10,2) | Monto de IVA |
| `total` | numeric(10,2) | subtotal + iva_monto |
| `supuestos` | text[] | Lista de advertencias: medidas aproximadas, ítems sin precio, sustituciones |
| `valida_hasta` | timestamptz | created_at + 7 días |
| `link_token_hash` | text | SHA-256 hex del UUID que va en la URL (`/c/<uuid>`) |
| `created_at` | timestamptz DEFAULT now() | — |

El `link_token` real (UUID v4) **nunca se almacena en la DB**. Solo se almacena su hash. El token se genera, se envía al cliente por WhatsApp, y para validarlo se hashea el token recibido y se compara contra `link_token_hash`.

---

### `pedidos`

Un pedido es la orden enviada a una ferretería específica, derivada de una solicitud confirmada.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | — |
| `solicitud_id` | uuid FK → solicitudes | — |
| `proveedor_id` | uuid FK → proveedores | — |
| `estado` | text | `borrador` \| `enviado` \| `en_proceso` \| `completado` \| `cancelado` |
| `codigo_acceso` | text | 6 dígitos numéricos. Almacenado **hasheado** (bcrypt, cost 10). El texto plano se envía solo por WhatsApp. |
| `codigo_acceso_intentos` | int DEFAULT 0 | Contador de intentos fallidos (resetea al iniciar nueva ventana) |
| `codigo_acceso_bloqueado_hasta` | timestamptz | Null si no hay bloqueo activo |
| `link_token_hash` | text | SHA-256 hex del UUID que va en la URL (`/o/<uuid>`) |
| `created_at` | timestamptz DEFAULT now() | — |
| `enviado_at` | timestamptz | Timestamp cuando el asesor envió a la ferretería |
| `completado_at` | timestamptz | Timestamp cuando la ferretería envió la lista completa |
| `asesor_id` | uuid FK → auth.users | Asesor que creó el pedido |

Restricción única: `(solicitud_id, proveedor_id)` donde `estado NOT IN ('cancelado')` — un proveedor no puede tener dos pedidos activos para la misma solicitud.

---

### `items_pedido`

Un ítem por cada material del pedido.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | — |
| `pedido_id` | uuid FK → pedidos | — |
| `producto_id` | text | Referencia al producto del catálogo |
| `nombre` | text | Nombre del producto (snapshot al crear el pedido, por si cambia el catálogo) |
| `cantidad` | numeric(10,3) | Cantidad redondeada al múltiplo vendible |
| `unidad` | text | `m2`, `bolsa`, `kg`, `unidad`, `litro`, `galon`, `m3` |
| `precio_unitario` | numeric(10,2) | Precio al momento de crear el pedido (snapshot) |
| `estado` | text | `pendiente` \| `disponible` \| `sin_stock` \| `sustitucion_pendiente` |
| `notas_ferreteria` | text | Nota libre de la ferretería (producto alternativo, disponibilidad parcial, etc.) |
| `updated_at` | timestamptz | Última actualización de estado |

---

### `proveedores`

Ferreterías registradas en el sistema.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | — |
| `nombre` | text NOT NULL | Nombre de la ferretería |
| `telefono` | text | Número E.164 para WhatsApp |
| `email` | text | Email de contacto |
| `ciudad` | text | Ciudad donde opera |
| `provincia` | text | Provincia |
| `activo` | boolean DEFAULT true | Si está disponible para recibir pedidos |
| `created_at` | timestamptz DEFAULT now() | — |

---

### `productos`

Catálogo de materiales con precios por proveedor.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | — |
| `proveedor_id` | uuid FK → proveedores | Proveedor que tiene este producto a este precio |
| `producto_id` | text | Slug único del producto (usado en recetas). Ej: `ceramica_nacional_30x30` |
| `nombre` | text | Nombre comercial |
| `unidad` | text | Unidad de venta |
| `precio` | numeric(10,2) | Precio unitario en USD |
| `gama` | text | `economica` \| `media` \| `premium` |
| `categoria` | text | Categoría del producto (ej. `ceramica`, `cemento`, `pintura`) |
| `caja_m2` | numeric(6,3) | Solo para cerámica/porcelanato: m² por caja. Null para otros. |
| `activo` | boolean DEFAULT true | — |
| `updated_at` | timestamptz DEFAULT now() | Fecha de última actualización de precio |

Índice: `(producto_id, proveedor_id, activo)`.

---

### `recetas_config`

Recetas almacenadas en la base de datos (alternativa a archivos JSON en disco).

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | — |
| `nombre` | text | Nombre legible (ej. "Cerámica de piso v1.1") |
| `version` | text | Semver: `1.0.0` |
| `trabajo_tipo` | text | Slug del tipo de trabajo |
| `contenido` | jsonb | La receta completa (mismo esquema que el JSON descrito en `docs/03-calculos.md`) |
| `activo` | boolean DEFAULT true | Solo la versión activa se usa en cálculos |
| `created_at` | timestamptz DEFAULT now() | — |
| `created_by` | uuid FK → auth.users | Asesor que subió la receta |

---

### `configuracion`

Tabla de clave-valor para parámetros del sistema.

| Columna | Tipo | Descripción |
|---|---|---|
| `clave` | text PK | Nombre de la config (ej. `iva_porcentaje`) |
| `valor` | text | Valor como string. Se parsea según el contexto (número, json, etc.) |
| `updated_at` | timestamptz DEFAULT now() | — |

Claves estándar:

| Clave | Valor por defecto | Descripción |
|---|---|---|
| `iva_porcentaje` | `0.15` | IVA en Ecuador (15%) |
| `cotizacion_validez_dias` | `7` | Días que vale una cotización |
| `whatsapp_asesor` | — | Número de teléfono del asesor para notificaciones |
| `sustituciones_climaticas` | `[]` | JSON de reglas de sustitución por zona |
| `max_intentos_codigo` | `3` | Intentos antes de bloqueo temporal |
| `bloqueo_minutos` | `15` | Minutos de bloqueo por intentos fallidos |

---

## 2. Políticas RLS (Row Level Security)

RLS está habilitado en todas las tablas. El principio general: **mínimo privilegio**. Los roles son:

- `service_role`: backend del servidor Next.js / Edge Functions. Acceso total. **Nunca exponer al cliente.**
- `authenticated`: asesores logueados via Supabase Auth.
- `anon`: visitantes sin sesión (clientes, ferreterías accediendo por token).

---

### `solicitudes`
```sql
-- Solo service_role y asesores autenticados pueden ver y modificar.
-- Anon no tiene acceso en ningún caso.
CREATE POLICY "asesores_full" ON solicitudes
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
-- service_role bypass RLS por defecto en Supabase.
```

---

### `cotizaciones`
```sql
-- Anon puede leer UNA cotización si conoce el link_token (lo verifica el servidor).
-- El servidor hace: SELECT * FROM cotizaciones WHERE link_token_hash = sha256(token_input)
-- La política RLS para anon NO abre acceso directo; el servidor usa service_role para la lookup.
-- Asesores leen y escriben todo.
CREATE POLICY "asesores_full" ON cotizaciones
  FOR ALL TO authenticated
  USING (true);
-- Acceso anon se hace siempre vía service_role en el servidor, nunca expuesto al cliente JS.
```

---

### `pedidos`
```sql
-- Asesores: acceso total.
-- Ferreterías (anon): pueden leer UN pedido si el servidor valida el token + codigo_acceso.
--   El servidor usa service_role para la lookup; nunca expone acceso anon directo.
-- Ferreterías NO ven numero_telefono (ese campo vive en solicitudes, no en pedidos).
CREATE POLICY "asesores_full" ON pedidos
  FOR ALL TO authenticated
  USING (true);
```

---

### `items_pedido`
```sql
-- Asesores: acceso total.
-- Ferreterías: pueden actualizar el estado y notas de ítems de SU pedido.
--   El servidor valida que el pedido_id corresponde al token+codigo antes de permitir UPDATE.
--   Se hace vía service_role con verificación previa, no con política RLS directa para anon.
CREATE POLICY "asesores_full" ON items_pedido
  FOR ALL TO authenticated
  USING (true);
```

---

### `proveedores` y `productos`
```sql
-- Solo asesores autenticados pueden leer y escribir.
-- Anon no tiene acceso.
CREATE POLICY "asesores_read_write" ON proveedores
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "asesores_read_write" ON productos
  FOR ALL TO authenticated
  USING (true);
```

---

### `recetas_config` y `configuracion`
```sql
-- Solo asesores autenticados.
CREATE POLICY "asesores_full" ON recetas_config FOR ALL TO authenticated USING (true);
CREATE POLICY "asesores_full" ON configuracion FOR ALL TO authenticated USING (true);
```

---

## 3. Manejo de Tokens

### link_token (cotizaciones y pedidos)

1. **Generación**: el servidor genera un UUID v4 con `crypto.randomUUID()`.
2. **Almacenamiento**: se hashea con SHA-256 (hex) y se guarda en `link_token_hash`. El UUID crudo **nunca se guarda en la DB**.
3. **Envío**: el UUID crudo va en el mensaje de WhatsApp dentro de la URL (`/c/<uuid>` o `/o/<uuid>`).
4. **Validación**: cuando un usuario visita la URL, el servidor toma el UUID del path, lo hashea, y busca `WHERE link_token_hash = $hash`. Si no encuentra registro, responde 404.

Riesgo aceptado: si alguien obtiene el UUID (ej. reenvío del WhatsApp), puede ver la cotización. Esto es intencional: el link de cotización es público-por-diseño. El link de pedido requiere adicionalmente el `codigo_acceso`.

### codigo_acceso (pedidos)

1. **Generación**: 6 dígitos aleatorios con `crypto.getRandomValues()` o equivalente seguro.
2. **Almacenamiento**: hasheado con bcrypt (cost 10) en `pedidos.codigo_acceso`. El texto plano **solo existe en el mensaje de WhatsApp**.
3. **Validación**: el servidor compara el input del usuario con bcrypt.compare contra el hash almacenado.
4. **Brute force**: máximo 3 intentos. Al tercer fallo, `codigo_acceso_bloqueado_hasta = now() + interval '15 minutes'`. El servidor rechaza intentos durante el bloqueo sin verificar el hash.

---

## 4. Autenticación de Asesores

- Supabase Auth con email + password.
- El rol `asesor` se almacena en `auth.users.raw_user_meta_data->>'role'`.
- Las rutas `/asesor/**` están protegidas por middleware que verifica la sesión Supabase y el rol.
- No existe auto-registro. Los asesores son creados manualmente por el administrador vía Supabase Dashboard o script.
- Tokens de sesión: Supabase JWT con expiración de 1 hora. Refresh automático en el cliente.

---

## 5. Secretos y Variables de Entorno

Ningún secreto va en código fuente, en la base de datos, ni en comentarios. Todos en variables de entorno:

| Variable | Descripción |
|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Key de service_role (solo backend/Edge Functions) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública (cliente) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Key anon (cliente) |
| `ANTHROPIC_API_KEY` | Key de Claude API |
| `WHATSAPP_API_TOKEN` | Token de WhatsApp Business API |
| `WHATSAPP_PHONE_ID` | ID del número de WhatsApp Business |
| `WHATSAPP_MODE` | `simulado` o `real` |
| `APP_URL` | URL base del deploy (para construir links en WhatsApp) |

El `SUPABASE_SERVICE_ROLE_KEY` **nunca** va en variables con prefijo `NEXT_PUBLIC_`. Si se detecta en un bundle de cliente, es un error crítico de seguridad.

---

## 6. Privacidad del Número de Teléfono del Cliente

El número de teléfono del cliente es el dato más sensible del sistema. Reglas:

1. Se almacena en texto claro en `solicitudes.numero_telefono` para que el asesor pueda contactar al cliente.
2. Se almacena hasheado en `solicitudes.numero_telefono_hash` para búsquedas internas.
3. Las ferreterías **nunca** ven el número. Los objetos de pedido (`pedidos`, `items_pedido`) no contienen número de teléfono.
4. Las APIs que sirven datos a ferreterías (vía token de pedido) NO incluyen joins a `solicitudes.numero_telefono`.
5. Los logs de WhatsApp en modo simulado almacenan el número del destinatario. Esta tabla tiene RLS restrictivo (solo service_role y asesores).
