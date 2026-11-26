# CLAUDE.md · Plataforma de cotización y gestión de materiales de construcción

> Nombre del producto: **pendiente**. Nombre de trabajo: `cotizador`.
> Responsables: Keval (desarrollo y asesor) y su socio (asesor).

## 1. Resumen
Plataforma web para Ecuador. Un **chatbot** entiende lo que el cliente quiere construir o remodelar, toma medidas y ubicación, y el sistema genera **3 cotizaciones** (económica, media, premium) con materiales de ferreterías, ajustadas al **clima**. Los **asesores** revisan y confirman con el cliente, envían la orden a cada ferretería con un código y un enlace, la ferretería marca artículo por artículo, devuelve la lista completa y el asesor avisa al cliente.

Es un proyecto grande, con datos reales de clientes y pedidos reales. Se construye con calidad de producción.

## 2. Alcance
**Incluye**
- Cualquier trabajo de construcción o remodelación: automático, asistido o manual
- Costa, Sierra y Oriente
- Chatbot en la página y resultados por WhatsApp
- Panel de asesores, catálogo de proveedores, vista de ferretería

**No incluye todavía (no construir sin aprobación)**
- Modelo de ingresos (**en pausa**)
- Pagos en línea, envío y entrega, comisiones
- Mano de obra, diseño estructural o eléctrico
- Galápagos
- Cuentas para clientes, app nativa

## 3. Flujo principal
```
Cliente ─► Chatbot ─► Motor (cálculo + clima) ─► 3 cotizaciones ─► WhatsApp
                                                      │
                                               Bandeja de asesores
                                                      │ revisar y confirmar
                                                   Pedido
                                                      │ 1 orden por proveedor
                              WhatsApp + enlace ─► Ferretería marca ítems
                                                      │ "Enviar lista completa"
                                               Asesor verifica ─► Cliente avisado
```
Detalle y estados: `docs/01-flujos.md`.

## 4. Reglas que no se rompen
1. La IA **conversa**; el motor **calcula**. La IA no inventa cantidades, precios, marcas ni stock.
2. Cálculos deterministas, probados y con trazabilidad.
3. **Nada llega a una ferretería sin confirmación de un asesor.**
4. No inventar datos reales. Semillas ficticias marcadas como `DEMO`.
5. Sin precio vigente o sin producto apto: "por confirmar", nunca un sustituto silencioso.
6. Estructura, gas y cargas eléctricas requieren profesional.
7. La ferretería no ve datos del cliente.
8. RLS en todas las tablas; secretos solo en el entorno.
9. Toda cotización indica supuestos, validez, que es estimado de materiales y que se confirmará.
10. IVA, validez, umbrales y coeficientes son configurables, no constantes dispersas.

## 5. Stack

| Capa | Tecnología |
|---|---|
| Web y API | Next.js (App Router), React, TypeScript estricto |
| Estilos | Tailwind CSS |
| Datos, Auth, Storage, tiempo real | Supabase (PostgreSQL, RLS) |
| Chatbot | API de Claude con herramientas |
| Mensajería | WhatsApp Cloud API (Meta) |
| Validación | Zod |
| Pruebas | Vitest (dominio), Playwright (flujos) |
| Despliegue | Vercel + Supabase |
| Local | Docker (Supabase CLI) |

Usar versiones estables actuales y fijarlas al crear el proyecto.

## 6. Arquitectura
Monolito modular. La lógica de negocio vive en `src/domain`, sin dependencias de Next.js, Supabase ni IA. Las integraciones viven en `src/server`. Las páginas solo orquestan.

```
app → server (servicios, repositorios, integraciones) → domain (puro)
```

## 7. Estructura del proyecto
```
cotizador/
├─ CLAUDE.md
├─ docs/                      # especificación (ver sección 8)
├─ src/
│  ├─ app/
│  │  ├─ (publico)/           # inicio, chat, privacidad
│  │  ├─ c/[token]/           # cotización del cliente
│  │  ├─ o/[token]/           # orden de la ferretería
│  │  ├─ panel/
│  │  │  ├─ solicitudes/
│  │  │  ├─ pedidos/
│  │  │  ├─ catalogo/
│  │  │  ├─ proveedores/
│  │  │  ├─ recetas/
│  │  │  └─ configuracion/
│  │  └─ api/
│  │     ├─ chat/
│  │     ├─ ordenes/
│  │     └─ webhooks/whatsapp/
│  ├─ domain/
│  │  ├─ calculo/             # motor, fórmulas, redondeo
│  │  ├─ clima/               # perfil y reglas
│  │  ├─ cotizacion/          # selección por gama, totales
│  │  ├─ pedidos/             # máquinas de estado
│  │  └─ compartido/          # unidades, dinero, errores
│  ├─ recetas/                # definiciones versionadas, una carpeta por categoría
│  ├─ server/
│  │  ├─ db/                  # clientes y repositorios
│  │  ├─ servicios/
│  │  ├─ chat/                # instrucción, herramientas
│  │  ├─ whatsapp/            # plantillas, outbox
│  │  ├─ importacion/
│  │  └─ seguridad/           # tokens, límites, permisos
│  ├─ components/             # chat, panel, orden, ui
│  └─ lib/
├─ supabase/
│  ├─ migrations/
│  └─ seed/
├─ tests/
│  ├─ domain/
│  ├─ chat/
│  └─ e2e/
├─ scripts/
└─ .env.example
```

## 8. Documentación: leer antes de trabajar en cada área

| Archivo | Leer antes de |
|---|---|
| `docs/01-flujos.md` | Pantallas, estados, panel, vista de ferretería |
| `docs/02-chatbot-whatsapp.md` | Chat, IA, mensajes |
| `docs/03-calculos.md` | Motor y recetas |
| `docs/04-clima.md` | Reglas por región y selección de materiales |
| `docs/05-datos-seguridad.md` | Migraciones, permisos, enlaces, privacidad |
| `docs/06-plan.md` | Saber qué fase toca |

## 9. Convenciones
- Dominio y textos en **español**; sin tildes ni ñ en identificadores. Términos técnicos en inglés cuando son del framework.
- Componentes `PascalCase`, funciones `camelCase`, tablas y columnas `snake_case`, archivos `kebab-case`.
- TypeScript sin `any` sin justificar.
- Server Components por defecto.
- Errores tipados; mensajes claros al usuario sin detalles internos.
- Interfaz primero para celular, accesible, botones de al menos 44 px.
- Zona horaria de presentación `America/Guayaquil`; almacenamiento UTC. Moneda USD.
- Commits pequeños (`feat:`, `fix:`, `test:`, `docs:`), una rama por fase o función.

## 10. Variables de entorno
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
CHAT_MODEL=
WHATSAPP_MODE=simulado
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_APP_SECRET=
WHATSAPP_VERIFY_TOKEN=
APP_URL=
```

## 11. Cómo trabajar
1. Revisar "Estado actual" y la fase en `docs/06-plan.md`.
2. Leer los documentos del área.
3. Proponer un plan corto y esperar aprobación.
4. En el motor, escribir primero las pruebas.
5. Si algo no está definido o contradice un documento, **preguntar**.
6. Respuestas concisas y directas.

**Terminado significa:** tipos, lint y pruebas en verde; RLS revisado; probado en pantalla de celular; documentación actualizada.

Documentar en esta sección los comandos reales (`dev`, `test`, `lint`, `db`) al crearlos.

## 12. Decisiones pendientes
- [x] Nombre del producto → **KONSTRU** (plataforma) + **STEVE** (chatbot)
- [ ] Modelo de ingresos (en pausa)
- [ ] Cómo se cobra al cliente, cómo se paga a la ferretería y quién entrega
- [ ] ¿El cliente recibe las 3 cotizaciones antes de que el asesor las revise? **Supuesto actual: sí, marcadas como preliminares**
- [ ] Ciudad y ferreterías del piloto, y formato de sus listas
- [ ] Maestro de obra que valide recetas
- [ ] Faltantes de stock: ¿quién aprueba sustitutos? **Supuesto: asesor y cliente**
- [ ] ¿Precios mostrados con IVA incluido?

## 11. Comandos

```bash
npm run dev          # servidor de desarrollo
npm run build        # build de producción
npm test             # tests de dominio (Vitest) — 44 tests
npm run test:e2e     # tests end-to-end (Playwright) — requiere servidor activo
npm run lint         # ESLint
npx tsc --noEmit     # type check
```

## 13. Estado actual
- Fase: **2 · desplegado en Vercel, operativo con STEVE y panel admin**
- Última actualización: 2026-11-25
- **Hecho:**
  - Scaffolding Next.js 16 + TypeScript strict + Tailwind v4
  - Migración SQL + seed (47 productos DEMO) ejecutados en Supabase real
  - Chatbot STEVE operativo vía OpenRouter (`nvidia/nemotron-3.5-lightning:free`)
  - Landing page KONSTRU: hero, pasos, features, CTA, responsive
  - Login admin con Supabase Auth (`/login`) + middleware protege `/panel`
  - Dashboard admin con KPIs, solicitudes recientes y navegación completa
  - WhatsApp en modo `simulado`; plantillas en revisión en Meta (#133010 capturado)
  - Deploy en Vercel: `konstru.vercel.app`
  - GitHub: `github.com/kevalty/KONSTRU`
- **Pendiente para WhatsApp real:**
  - Aprobar plantillas en Meta (en revisión)
  - Agregar números de prueba en Meta Business → API Setup
  - Cambiar `WHATSAPP_MODE=real` en Vercel cuando esté listo
  - Actualizar `enviar.ts` para usar formato de plantilla aprobada
- **Pendiente de contenido:**
  - Logo KONSTRU real (reemplazar texto por imagen)
  - Imagen/dibujo 2D de STEVE (reemplazar 🤖 en landing y chat)
  - Crear usuario admin en Supabase Auth (Authentication → Users → Invite)
- **Bloqueos:** Ninguno técnico. WhatsApp en progreso.
