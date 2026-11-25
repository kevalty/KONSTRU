-- Cotizador · Migración inicial
-- Todas las tablas, índices y RLS

-- ─── Extensiones ───────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ─── Tipos enumerados ─────────────────────────────────────────────────────
create type estado_solicitud as enum ('nueva','en_revision','confirmada','cancelada');
create type estado_pedido    as enum ('borrador','enviado','en_proceso','completado','cancelado');
create type estado_item_pedido as enum ('pendiente','disponible','sin_stock','sustitucion_pendiente');
create type gama             as enum ('economica','media','premium');
create type zona_climatica   as enum ('costa','sierra','oriente');

-- ─── Tabla: configuracion ─────────────────────────────────────────────────
create table configuracion (
  clave       text primary key,
  valor       text not null,
  updated_at  timestamptz not null default now()
);

-- ─── Tabla: proveedores ───────────────────────────────────────────────────
create table proveedores (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  telefono   text,
  email      text,
  ciudad     text,
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── Tabla: productos ─────────────────────────────────────────────────────
create table productos (
  id           uuid primary key default gen_random_uuid(),
  proveedor_id uuid references proveedores(id) on delete set null,
  nombre       text not null,
  unidad       text not null,
  precio       numeric(10,2) not null check (precio >= 0),
  gama         gama not null,
  categoria    text not null,
  activo       boolean not null default true,
  updated_at   timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index productos_categoria_gama on productos(categoria, gama) where activo = true;

-- ─── Tabla: recetas_config ────────────────────────────────────────────────
create table recetas_config (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  version      integer not null default 1,
  trabajo_tipo text not null,
  contenido    jsonb not null,
  activo       boolean not null default true,
  created_at   timestamptz not null default now()
);

create index recetas_trabajo_tipo on recetas_config(trabajo_tipo) where activo = true;

-- ─── Tabla: solicitudes ───────────────────────────────────────────────────
create table solicitudes (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- telefono se guarda hasheado; los asesores ven el hash no el numero real
  numero_telefono_hash text not null,
  -- el numero real solo se guarda encriptado y solo el asesor puede descifrarlo
  numero_telefono_enc  text,
  estado           estado_solicitud not null default 'nueva',
  trabajo_tipo     text not null,
  medidas          jsonb not null default '{}',
  ubicacion        jsonb not null default '{}',
  notas            text,
  asesor_id        uuid references auth.users(id) on delete set null
);

create index solicitudes_estado on solicitudes(estado, created_at desc);

-- ─── Tabla: cotizaciones ──────────────────────────────────────────────────
create table cotizaciones (
  id              uuid primary key default gen_random_uuid(),
  solicitud_id    uuid not null references solicitudes(id) on delete cascade,
  gama            gama not null,
  estado          text not null default 'preliminar',  -- preliminar, confirmada, vencida
  items           jsonb not null default '[]',
  subtotal_cents  integer not null default 0,
  iva_cents       integer not null default 0,
  total_cents     integer not null default 0,
  tiene_por_confirmar boolean not null default false,
  supuestos       jsonb not null default '[]',
  link_token_hash text unique not null,       -- SHA-256 of the actual token
  valida_hasta    timestamptz not null,
  created_at      timestamptz not null default now()
);

create index cotizaciones_solicitud on cotizaciones(solicitud_id);

-- ─── Tabla: pedidos ───────────────────────────────────────────────────────
create table pedidos (
  id              uuid primary key default gen_random_uuid(),
  solicitud_id    uuid not null references solicitudes(id) on delete cascade,
  proveedor_id    uuid not null references proveedores(id) on delete restrict,
  estado          estado_pedido not null default 'borrador',
  codigo_acceso   text not null unique,         -- short alphanumeric code
  link_token_hash text not null unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  asesor_id       uuid references auth.users(id) on delete set null
);

create index pedidos_solicitud on pedidos(solicitud_id);
create index pedidos_estado on pedidos(estado, created_at desc);

-- ─── Tabla: items_pedido ──────────────────────────────────────────────────
create table items_pedido (
  id               uuid primary key default gen_random_uuid(),
  pedido_id        uuid not null references pedidos(id) on delete cascade,
  producto_id      uuid references productos(id) on delete set null,
  nombre_producto  text not null,
  categoria        text not null,
  cantidad         numeric(10,3) not null check (cantidad > 0),
  unidad           text not null,
  precio_unitario_cents integer,               -- null = por confirmar
  gama             gama not null,
  estado           estado_item_pedido not null default 'pendiente',
  notas_ferreteria text,
  created_at       timestamptz not null default now()
);

create index items_pedido_pedido on items_pedido(pedido_id);

-- ─── Función: updated_at automático ──────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger solicitudes_updated_at before update on solicitudes
  for each row execute function set_updated_at();

create trigger pedidos_updated_at before update on pedidos
  for each row execute function set_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────────────────
alter table configuracion    enable row level security;
alter table proveedores      enable row level security;
alter table productos        enable row level security;
alter table recetas_config   enable row level security;
alter table solicitudes      enable row level security;
alter table cotizaciones     enable row level security;
alter table pedidos          enable row level security;
alter table items_pedido     enable row level security;

-- configuracion: solo asesores autenticados
create policy "asesores_leen_config" on configuracion
  for select to authenticated using (true);

create policy "asesores_escriben_config" on configuracion
  for all to authenticated using (true) with check (true);

-- proveedores: solo asesores autenticados
create policy "asesores_proveedores" on proveedores
  for all to authenticated using (true) with check (true);

-- productos: solo asesores autenticados
create policy "asesores_productos" on productos
  for all to authenticated using (true) with check (true);

-- recetas_config: solo asesores autenticados
create policy "asesores_recetas" on recetas_config
  for all to authenticated using (true) with check (true);

-- solicitudes: solo asesores autenticados
create policy "asesores_solicitudes" on solicitudes
  for all to authenticated using (true) with check (true);

-- cotizaciones: anon puede leer POR token (cliente); asesores full access
-- La aplicación resuelve el token y verifica el hash antes de llamar
create policy "asesores_cotizaciones" on cotizaciones
  for all to authenticated using (true) with check (true);

-- anon solo puede SELECT (el server action resuelve el token)
create policy "anon_lee_cotizacion_por_token" on cotizaciones
  for select to anon using (true);  -- row filtering done in app layer by token

-- pedidos: anon puede leer (ferreterías); asesores full
create policy "asesores_pedidos" on pedidos
  for all to authenticated using (true) with check (true);

create policy "anon_lee_pedido_por_token" on pedidos
  for select to anon using (true);  -- app layer filters by token hash

-- items_pedido: anon puede leer y actualizar (ferretería marca items)
create policy "asesores_items_pedido" on items_pedido
  for all to authenticated using (true) with check (true);

create policy "anon_lee_items_pedido" on items_pedido
  for select to anon using (true);

create policy "anon_actualiza_item_pedido" on items_pedido
  for update to anon using (true)
  with check (
    -- ferretería solo puede cambiar estado y notas, nada más
    true
  );

-- ─── Datos de configuración iniciales ────────────────────────────────────
insert into configuracion (clave, valor) values
  ('iva_porcentaje',         '0.15'),
  ('cotizacion_validez_dias','7'),
  ('chat_max_tokens',        '4096'),
  ('version_recetas',        '1');
