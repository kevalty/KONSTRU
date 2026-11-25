# 06 — Plan de Construcción y Estado Actual

## Estado Actual

**Fecha de última actualización**: 2026-11-25  
**Fase actual**: Fase 0 — Scaffolding

| Ítem | Estado |
|---|---|
| Repositorio inicializado | ✅ |
| Next.js 14 app router configurado | — |
| Supabase proyecto creado | — |
| Migraciones iniciales escritas | — |
| Variables de entorno definidas | — |
| Tests de dominio escritos | — |

---

## Fase 0 — Scaffolding, Configuración y Migraciones

**Objetivo**: tener la infraestructura base lista para que cualquier fase siguiente pueda arrancar sin fricciones de setup.

### Tareas

- [ ] Crear proyecto Next.js 14 con TypeScript y App Router
- [ ] Instalar dependencias base: `@supabase/supabase-js`, `@anthropic-ai/sdk`, `zod`
- [ ] Configurar ESLint + Prettier con reglas del proyecto
- [ ] Crear todas las migraciones SQL iniciales (ver `docs/05-datos-seguridad.md`)
  - [ ] Tablas: `solicitudes`, `cotizaciones`, `pedidos`, `items_pedido`, `proveedores`, `productos`, `recetas_config`, `configuracion`
  - [ ] Habilitar RLS en todas las tablas
  - [ ] Crear políticas RLS por tabla
  - [ ] Índices de rendimiento
- [ ] Seed de datos: configuración base (`iva_porcentaje`, `cotizacion_validez_dias`), 2 proveedores de prueba, 20 productos de prueba en 3 gamas, 2 recetas de prueba
- [ ] Tests de dominio puro (sin Supabase, sin API):
  - [ ] `roundToSellableUnit()` — todos los casos de redondeo
  - [ ] Evaluador de fórmulas de receta
  - [ ] Motor de cálculo completo con receta mock
  - [ ] Mapeo provincia → zona
  - [ ] Aplicación de sustituciones climáticas

### Definición de hecho
- `npm test` pasa con 0 errores
- `npm run migrate` aplica todas las migraciones en un Supabase local limpio sin errores
- Seed popula datos suficientes para correr la Fase 1 sin ingresar datos manualmente

---

## Fase 1 — Chatbot MVP

**Objetivo**: un cliente puede ir a `/chat`, conversar con el bot, y recibir 3 cotizaciones por WhatsApp (en modo simulado).

### Tareas

- [ ] Página `/chat`: UI de chat (input, burbujas, indicador de escritura)
- [ ] API route `POST /api/chat`: recibe el historial de mensajes, llama Claude con tools, devuelve respuesta
- [ ] Implementar las 4 herramientas del bot (`registrar_trabajo`, `agregar_medida`, `registrar_ubicacion`, `confirmar_solicitud`) como server actions o handlers de la API
- [ ] Al llamar `confirmar_solicitud`:
  - [ ] Crear registro en `solicitudes` con estado `nueva`
  - [ ] Disparar cálculo de las 3 cotizaciones
  - [ ] Guardar cotizaciones en `cotizaciones`
  - [ ] "Enviar" WhatsApp `cotizacion_lista` (en modo simulado: loguear en `whatsapp_logs`)
- [ ] Página `/c/:token`: leer cotización por token, mostrar las 3 variantes con desglose
- [ ] Rate limiting de chat (máx 50 turnos, máx 3 cotizaciones/número/día)

### Definición de hecho
- El flujo completo funciona de punta a punta en desarrollo local
- Las cotizaciones generadas tienen totales correctos verificados contra cálculo manual
- El link `/c/:token` muestra el desglose correcto
- El número de teléfono usado en pruebas es ficticio (ej. `+593999000001`)
- `whatsapp_logs` tiene el registro del mensaje simulado

---

## Fase 2 — Panel del Asesor

**Objetivo**: un asesor puede ver solicitudes, revisarlas, confirmarlas y crear pedidos.

### Tareas

- [ ] Login page `/login` con Supabase Auth
- [ ] Middleware de protección para rutas `/asesor/**`
- [ ] Página `/asesor/solicitudes`: tabla con filtros de estado y zona, paginación
- [ ] Página `/asesor/solicitudes/:id`: resumen de chat, 3 cotizaciones, notas editables, botón confirmar
- [ ] Acción "Confirmar solicitud": cambia estado a `confirmada`, asigna `asesor_id`
- [ ] Página `/asesor/solicitudes/:id/pedido/nuevo`: selector de proveedor, revisión de ítems, botón enviar
- [ ] Acción "Enviar a ferretería": crea pedido + items_pedido, genera token y codigo_acceso, "envía" WhatsApp `orden_ferreteria`
- [ ] Página `/asesor/pedidos`: lista de pedidos con estado
- [ ] Página `/asesor/pedidos/:id`: ítems con estado, botón "Marcar completado"
- [ ] Validación server-side: no se puede crear pedido si solicitud no está `confirmada`

### Definición de hecho
- El asesor puede completar el flujo desde lista de solicitudes hasta pedido enviado
- Las validaciones de estado rechazan operaciones inválidas con mensaje claro
- El número de teléfono del cliente se muestra enmascarado (`+593 99X XXX XX01`) al asesor en el panel de solicitudes (nunca completo en UI; completo solo en la DB para uso de WhatsApp)

---

## Fase 3 — Vista de la Ferretería

**Objetivo**: la ferretería puede acceder a su orden por link + código, marcar ítems y enviar la lista.

### Tareas

- [ ] Página `/o/:token`: formulario de código de acceso con validación bcrypt
- [ ] Rate limiting de intentos: bloqueo temporal tras 3 fallos
- [ ] Página `/o/:token/items`: tabla de ítems con controles de estado (disponible / sin_stock / sustitucion_pendiente)
- [ ] Input de nota para ítems con `sustitucion_pendiente`
- [ ] Guardado parcial: cada cambio de estado de ítem se persiste inmediatamente
- [ ] Botón "Enviar lista completa": habilitado solo cuando todos los ítems tienen estado distinto a `pendiente`
- [ ] Al enviar: actualizar `pedido.estado = en_proceso`, "enviar" WhatsApp `orden_completada` al asesor
- [ ] Verificar que número de teléfono del cliente NO aparece en ninguna respuesta de API de esta vista

### Definición de hecho
- La ferretería no puede ver datos del cliente
- El botón enviar está correctamente bloqueado si hay ítems pendientes
- El asesor recibe la notificación simulada en `whatsapp_logs`
- Test de intentos de código: 3 fallos → bloqueo → verificar que el 4to fallo en periodo de bloqueo es rechazado sin verificar hash

---

## Fase 4 — Integración WhatsApp Real

**Objetivo**: reemplazar el modo simulado con envíos reales a través de WhatsApp Business API.

### Tareas

- [ ] Registrar templates en la cuenta de WhatsApp Business (`cotizacion_lista`, `pedido_confirmado`, `orden_ferreteria`, `orden_completada`)
- [ ] Implementar cliente de WhatsApp Business API con reintentos (exponential backoff, máx 3 intentos)
- [ ] Configurar `WHATSAPP_MODE=real` en el ambiente de producción
- [ ] Webhook de WhatsApp: recibir mensajes entrantes para el chat (si se decide continuar el chat por WA)
- [ ] Manejar errores de entrega: si el número no tiene WhatsApp, loguear y notificar al asesor
- [ ] Rate limiting de salida: respetar límites de la API de Meta

### Definición de hecho
- Los 4 templates están aprobados por Meta
- Un flujo de prueba de punta a punta envía mensajes reales a un número de prueba
- Los fallos de envío quedan registrados sin romper el flujo principal

---

## Fase 5 — Catálogo e Importación

**Objetivo**: el asesor puede gestionar el catálogo de productos y recetas desde el panel.

### Tareas

- [ ] Página `/asesor/catalogo/productos`: CRUD de productos con filtros por proveedor, gama, categoría
- [ ] Importación masiva de productos via CSV (columnas: `producto_id`, `nombre`, `unidad`, `precio`, `gama`, `categoria`, `proveedor_id`, `caja_m2`)
- [ ] Validación de CSV: rechazar filas con precio negativo, unidad inválida, proveedor inexistente
- [ ] Página `/asesor/catalogo/recetas`: lista de recetas activas por tipo de trabajo
- [ ] Editor de receta: formulario para crear/editar receta con validación de fórmulas
- [ ] Validador de fórmula en tiempo real (el asesor puede probar con valores de ejemplo)
- [ ] Activación/desactivación de versiones de receta
- [ ] Página `/asesor/configuracion`: formulario para las claves de `configuracion` (IVA, número asesor, sustituciones climáticas)

### Definición de hecho
- El asesor puede importar un CSV de 200 productos sin errores en < 10 segundos
- Una receta editada en el panel afecta inmediatamente los nuevos cálculos
- Los cambios de configuración (IVA) se reflejan en el próximo cálculo

---

## Fase 6 — Hardening y Deploy

**Objetivo**: el sistema está listo para uso en producción real.

### Tareas

- [ ] Auditoría completa de RLS: verificar que `anon` no puede acceder a ningún dato sin token válido
- [ ] E2E tests con Playwright:
  - [ ] Flujo cliente: chat → cotización → link funciona
  - [ ] Flujo asesor: login → confirmar → crear pedido
  - [ ] Flujo ferretería: acceso con token + código → marcar ítems → enviar
- [ ] Rate limits en todas las rutas públicas con headers de respuesta estándar (`Retry-After`)
- [ ] Variables de entorno en Vercel: todas las de producción configuradas
- [ ] Deploy en Vercel con dominio personalizado
- [ ] Supabase: activar backups diarios automáticos
- [ ] Monitoreo de errores: Sentry o equivalente en la API route del chat
- [ ] Revisión de seguridad: asegurar que `SUPABASE_SERVICE_ROLE_KEY` no está en ningún bundle de cliente
- [ ] Load test básico: simular 10 conversaciones concurrentes

### Definición de hecho
- 0 vulnerabilidades críticas en auditoría RLS
- Suite E2E pasa en CI
- El deploy en Vercel completa sin errores de build
- El link de cotización y el link de pedido funcionan en producción con HTTPS

---

## Convenciones del Plan

- Una fase no empieza hasta que la anterior tiene su "Definición de hecho" completa.
- Si una tarea bloquea varias otras, se escala antes de continuar.
- Los tests de cada fase viven en `tests/<fase>/` y corren con `npm test`.
- Los cambios de esquema siempre van en migraciones numeradas (`supabase/migrations/YYYYMMDDHHMMSS_descripcion.sql`), nunca editando migraciones existentes.
- Al actualizar este archivo con progreso, solo actualizar la sección "Estado Actual" y los checkboxes.
