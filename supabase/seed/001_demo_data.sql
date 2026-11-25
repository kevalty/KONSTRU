-- DEMO data — marked for easy removal before production
-- All prices in USD, approximate Ecuadorian market prices 2024

-- ─── Proveedores DEMO ─────────────────────────────────────────────────────
insert into proveedores (id, nombre, telefono, email, ciudad) values
  ('11111111-1111-1111-1111-111111111111', 'Ferretería El Tornillo DEMO', '+593987654321', 'eltornillo@demo.ec', 'Guayaquil'),
  ('22222222-2222-2222-2222-222222222222', 'Distribuidora Los Andes DEMO', '+593912345678', 'losandes@demo.ec', 'Quito'),
  ('33333333-3333-3333-3333-333333333333', 'Materiales del Oriente DEMO', '+593956781234', 'oriente@demo.ec', 'Puyo');

-- ─── Productos DEMO ──────────────────────────────────────────────────────
-- ceramica_piso
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Cerámica piso básica 33x33 DEMO', 'm2', 6.50, 'economica', 'ceramica_piso'),
  ('11111111-1111-1111-1111-111111111111', 'Porcelanato 60x60 mate DEMO', 'm2', 14.00, 'media', 'ceramica_piso'),
  ('22222222-2222-2222-2222-222222222222', 'Porcelanato gran formato 90x90 DEMO', 'm2', 28.00, 'premium', 'ceramica_piso');

-- pegante_ceramica
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Pegante cerámico estándar 20kg DEMO', 'bolsa', 8.50, 'economica', 'pegante_ceramica'),
  ('11111111-1111-1111-1111-111111111111', 'Pegante cerámico flex 20kg DEMO', 'bolsa', 12.00, 'media', 'pegante_ceramica'),
  ('22222222-2222-2222-2222-222222222222', 'Pegante cerámico plus 20kg DEMO', 'bolsa', 16.50, 'premium', 'pegante_ceramica');

-- fragua
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Fragua cerámica 1kg DEMO', 'kg', 2.50, 'economica', 'fragua'),
  ('11111111-1111-1111-1111-111111111111', 'Fragua flexible 1kg DEMO', 'kg', 3.80, 'media', 'fragua'),
  ('22222222-2222-2222-2222-222222222222', 'Fragua epóxica 1kg DEMO', 'kg', 8.00, 'premium', 'fragua');

-- ceramica_pared
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Cerámica pared 20x30 DEMO', 'm2', 7.00, 'economica', 'ceramica_pared'),
  ('11111111-1111-1111-1111-111111111111', 'Cerámica pared 30x60 DEMO', 'm2', 15.50, 'media', 'ceramica_pared'),
  ('22222222-2222-2222-2222-222222222222', 'Porcelanato pared gran formato DEMO', 'm2', 32.00, 'premium', 'ceramica_pared');

-- pintura_interior
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Pintura látex interior galon DEMO', 'galon', 12.00, 'economica', 'pintura_interior'),
  ('22222222-2222-2222-2222-222222222222', 'Pintura lavable premium galon DEMO', 'galon', 22.00, 'media', 'pintura_interior'),
  ('22222222-2222-2222-2222-222222222222', 'Pintura texturizada galon DEMO', 'galon', 38.00, 'premium', 'pintura_interior');

-- pintura_exterior
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Pintura exterior económica galon DEMO', 'galon', 14.00, 'economica', 'pintura_exterior'),
  ('22222222-2222-2222-2222-222222222222', 'Pintura elastomérica galon DEMO', 'galon', 28.00, 'media', 'pintura_exterior'),
  ('22222222-2222-2222-2222-222222222222', 'Pintura fluoropolímero galon DEMO', 'galon', 55.00, 'premium', 'pintura_exterior');

-- sellador_pared
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Sellador interior galon DEMO', 'galon', 9.00, 'economica', 'sellador_pared'),
  ('11111111-1111-1111-1111-111111111111', 'Sellador interior premium galon DEMO', 'galon', 15.00, 'media', 'sellador_pared'),
  ('22222222-2222-2222-2222-222222222222', 'Sellador multiuso galon DEMO', 'galon', 22.00, 'premium', 'sellador_pared');

-- impermeabilizante
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Impermeabilizante elastomérico galon DEMO', 'galon', 18.00, 'economica', 'impermeabilizante'),
  ('22222222-2222-2222-2222-222222222222', 'Impermeabilizante poliuretano galon DEMO', 'galon', 32.00, 'media', 'impermeabilizante'),
  ('22222222-2222-2222-2222-222222222222', 'Impermeabilizante cristalino kg DEMO', 'kg', 45.00, 'premium', 'impermeabilizante');

-- inodoro
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Inodoro básico blanco DEMO', 'unidad', 85.00, 'economica', 'inodoro'),
  ('22222222-2222-2222-2222-222222222222', 'Inodoro semi-pedestal DEMO', 'unidad', 165.00, 'media', 'inodoro'),
  ('22222222-2222-2222-2222-222222222222', 'Inodoro smart dual-flush DEMO', 'unidad', 380.00, 'premium', 'inodoro');

-- lavabo
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Lavabo empotrar básico DEMO', 'unidad', 45.00, 'economica', 'lavabo'),
  ('22222222-2222-2222-2222-222222222222', 'Lavabo semi-pedestal oval DEMO', 'unidad', 95.00, 'media', 'lavabo'),
  ('22222222-2222-2222-2222-222222222222', 'Lavabo sobre mueble vessel DEMO', 'unidad', 220.00, 'premium', 'lavabo');

-- griferia_lavabo
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Grifería mezcladora básica DEMO', 'unidad', 28.00, 'economica', 'griferia_lavabo'),
  ('22222222-2222-2222-2222-222222222222', 'Grifería mezcladora media DEMO', 'unidad', 65.00, 'media', 'griferia_lavabo'),
  ('22222222-2222-2222-2222-222222222222', 'Grifería termostática premium DEMO', 'unidad', 185.00, 'premium', 'griferia_lavabo');

-- ducha_set
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Set ducha básico DEMO', 'unidad', 35.00, 'economica', 'ducha_set'),
  ('22222222-2222-2222-2222-222222222222', 'Set ducha con barra DEMO', 'unidad', 85.00, 'media', 'ducha_set');

-- cabina_ducha
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('22222222-2222-2222-2222-222222222222', 'Cabina ducha vidrio templado DEMO', 'unidad', 450.00, 'premium', 'cabina_ducha');

-- accesorios_bano
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Set accesorios baño básico DEMO', 'juego', 22.00, 'economica', 'accesorios_bano'),
  ('22222222-2222-2222-2222-222222222222', 'Set accesorios baño acero inox DEMO', 'juego', 55.00, 'media', 'accesorios_bano'),
  ('22222222-2222-2222-2222-222222222222', 'Set accesorios baño premium DEMO', 'juego', 120.00, 'premium', 'accesorios_bano');

-- parquet_madera
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('22222222-2222-2222-2222-222222222222', 'Parquet eucalipto 10mm DEMO', 'm2', 18.00, 'media', 'parquet_madera'),
  ('22222222-2222-2222-2222-222222222222', 'Parquet roble 12mm flotante DEMO', 'm2', 35.00, 'premium', 'parquet_madera');

-- pintura_techo
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Pintura techo blanca galon DEMO', 'galon', 11.00, 'economica', 'pintura_techo'),
  ('22222222-2222-2222-2222-222222222222', 'Pintura techo lavable galon DEMO', 'galon', 20.00, 'media', 'pintura_techo'),
  ('22222222-2222-2222-2222-222222222222', 'Pintura techo anti-hongos galon DEMO', 'galon', 32.00, 'premium', 'pintura_techo');

-- impermeabilizante_cubierta
insert into productos (proveedor_id, nombre, unidad, precio, gama, categoria) values
  ('11111111-1111-1111-1111-111111111111', 'Impermeabilizante cubierta elastomérico galon DEMO', 'galon', 20.00, 'economica', 'impermeabilizante_cubierta'),
  ('22222222-2222-2222-2222-222222222222', 'Impermeabilizante poliuretano galon DEMO', 'galon', 38.00, 'media', 'impermeabilizante_cubierta'),
  ('22222222-2222-2222-2222-222222222222', 'Impermeabilizante cristalino premium kg DEMO', 'kg', 50.00, 'premium', 'impermeabilizante_cubierta');
