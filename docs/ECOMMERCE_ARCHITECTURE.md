# Quicksol Global - E-commerce Architecture

## Objetivo

Agregar catalogo B2B, portal de clientes, panel administrativo, RFQ, carrito, archivos, LinkedIn e IA sobre la arquitectura Next.js existente sin reescribir la web corporativa ni romper los siete idiomas actuales.

## Arquitectura propuesta

Diagrama textual:

```text
Browser
  -> Next.js App Router localized pages
  -> Server Components for public catalog
  -> Client Components for filters, cart UI, RFQ forms
  -> Route Handlers / Server Actions
       -> Supabase Auth
       -> Supabase Postgres with RLS
       -> Supabase Storage
       -> OpenAI server-only tool orchestration
       -> LinkedIn official API or manual content mode
       -> CRM/email webhook where needed
```

Principios:

- Mantener `/{locale}` como prefijo obligatorio.
- Server-first para datos sensibles.
- Ninguna `service_role` en el navegador.
- Catalogo publico mediante vistas seguras.
- Mutaciones solo por server actions o API routes autenticadas.
- IA conectada a herramientas del servidor, nunca SQL libre.
- Traducciones relacionales por entidad, no duplicacion completa de producto por idioma.

## Modelo de datos propuesto

Tablas necesarias para primera version:

- `profiles`: extension segura de `auth.users`.
- `companies`: empresas cliente.
- `company_members`: relacion usuario/empresa/rol comercial.
- `admin_roles`: roles administrativos asignados por super admin.
- `categories`: jerarquia de categorias.
- `category_translations`: nombre/descripcion/slug por locale.
- `brands`: fabricantes o marcas.
- `products`: producto canonico, SKU interno, MPN, marca, categoria, estado.
- `product_translations`: nombre, descripcion, slug y SEO por locale.
- `product_variants`: variantes fisicas/comerciales si aplica.
- `product_specs`: JSONB de especificaciones variables y campos indexables.
- `product_assets`: imagenes, videos, datasheets y orden.
- `prices`: precio por producto/variante, moneda, visibilidad y empresa opcional.
- `inventory_items`: stock, estado, lead time, MOQ, condicion, empaque, pais.
- `related_products`: exactos, similares, reemplazos y accesorios.
- `carts`: carrito por usuario/empresa.
- `cart_items`: lineas de carrito.
- `rfqs`: solicitudes de cotizacion.
- `rfq_items`: lineas de RFQ.
- `orders`: pedidos cuando se active checkout.
- `order_items`: lineas de pedido.
- `status_history`: historial de RFQ/pedido.
- `favorite_products`: favoritos por usuario.
- `ai_conversations`: conversaciones.
- `ai_messages`: mensajes y tool calls resumidos.
- `analytics_events`: eventos no sensibles.
- `linkedin_posts`: modo manual y cache de modo API.
- `audit_logs`: acciones administrativas.

Tablas preparadas para fase posterior:

- `addresses`.
- `documents`.
- `customer_private_documents`.
- `linkedin_oauth_connections`.
- `embeddings_queue`.
- `product_embeddings`.
- `webhook_deliveries`.
- `media_processing_jobs`.

## Relaciones principales

- `products.brand_id -> brands.id`.
- `products.category_id -> categories.id`.
- `product_translations.product_id -> products.id` con unique `(product_id, locale)`.
- `category_translations.category_id -> categories.id` con unique `(category_id, locale)`.
- `prices.product_id -> products.id` y opcional `company_id -> companies.id`.
- `inventory_items.product_id -> products.id`.
- `rfqs.company_id -> companies.id`, `rfqs.created_by -> profiles.id`.
- `rfq_items.rfq_id -> rfqs.id`, opcional `product_id -> products.id`.
- `orders.company_id -> companies.id`, `orders.rfq_id -> rfqs.id`.
- `audit_logs.actor_id -> profiles.id`.

## Convenciones de datos

- Primary keys: `uuid` con `gen_random_uuid()`.
- Timestamps: `created_at`, `updated_at`.
- Soft delete: `deleted_at` en entidades de negocio importantes.
- Slugs: unique por locale en tablas de traduccion; no unique global.
- Estados: enums o checks (`draft`, `published`, `archived`, `pending`, `quoted`, `ordered`, `cancelled`).
- Specs variables: `jsonb` en `product_specs`, con columnas generadas o indices para filtros frecuentes.
- Busqueda por numero de parte: normalizar SKU/MPN en columnas `sku_normalized`, `mpn_normalized`.
- Text search: `tsvector` por locale cuando aplique.
- Semantica: `pgvector` para embeddings de producto publicado.
- Indices: `brand_id`, `category_id`, `published`, `sku_normalized`, `mpn_normalized`, `slug`, `locale`, GIN sobre `jsonb` y full text.

## Roles y permisos

PUBLIC:

- Puede ver categorias, marcas y productos publicados.
- Puede buscar productos publicados.
- Puede usar asistente limitado.
- Puede crear RFQ temporal si se permite.
- No puede ver precios privados, datos de clientes ni panel admin.

CUSTOMER:

- Puede gestionar su perfil.
- Puede ver precios autorizados.
- Puede guardar favoritos.
- Puede gestionar su carrito.
- Puede crear RFQ.
- Puede ver solo sus RFQ y pedidos por empresa autorizada.
- Puede mantener conversaciones propias con IA.

ADMIN:

- Puede crear/editar productos, categorias, marcas, traducciones, precios, inventario y assets.
- Puede publicar/despublicar productos.
- Puede gestionar RFQ/pedidos.
- Puede gestionar LinkedIn y estadisticas administrativas.

SUPER_ADMIN:

- Todo lo anterior.
- Puede gestionar roles administrativos.

## RLS

Politicas base:

- Public select solo para `published = true` y `deleted_at is null`.
- Customers select/update solo sobre registros asociados a su `auth.uid()` o empresa autorizada.
- Admin select/insert/update mediante funcion segura `is_admin()` que consulta tabla de roles.
- Super admin mediante `is_super_admin()`.
- Ninguna politica permite que un cliente escriba su propio rol.
- Cambios de precios e inventario solo admin/super admin.
- Audit logs insertados por triggers o funciones server-only.

Funciones auxiliares:

- `current_profile_id()`.
- `current_company_ids()`.
- `has_admin_role(role text)`.
- `normalize_part_number(text)`.
- `search_products(...)`.
- `match_product_embeddings(...)`.

Vistas seguras:

- `public_catalog_products`.
- `public_catalog_assets`.
- `customer_price_view`.
- `admin_product_dashboard`.

## Storage

Buckets:

- `product-images-public`: publico, imagenes publicadas.
- `product-videos-public`: publico, videos publicados.
- `corporate-images-public`: publico.
- `corporate-videos-public`: publico.
- `datasheets-public`: publico, PDF autorizados.
- `customer-documents-private`: privado, si se activa.

Reglas:

- Upload solo admin para assets publicos.
- Upload customer solo a carpetas privadas propias si se habilita.
- Nombres seguros: UUID + extension validada.
- Rutas: `{entity}/{entity_id}/{asset_id}.{ext}`.
- MIME permitidos: `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `video/mp4`, `video/webm`, `application/pdf`, CSV/XLSX para BOM.
- Tamano inicial: imagen 10 MB, video 200 MB, PDF 25 MB, BOM 10 MB.
- Generar poster/thumbnail de video.
- Lazy loading y dimensiones conocidas.
- Jobs para detectar archivos huerfanos.

## Catalogo

Primera version:

- Listado por categoria, marca y busqueda.
- Detalle de producto publicado.
- Variantes y especificaciones.
- Productos relacionados.
- RFQ si no hay stock/precio publico.
- Metadata SEO por locale.

Evitar:

- Mostrar stock/precio no verificado.
- Duplicar productos completos por idioma.
- Exponer productos `draft` o `archived`.

## Portal de clientes

Primer alcance:

- Login Supabase Auth.
- Perfil.
- Empresa asociada.
- Favoritos.
- Carrito.
- RFQ y estado.
- Historial basico.
- Conversaciones IA propias.

## Panel administrativo

Primer alcance:

- Guarded route server-side.
- CRUD de categorias, marcas, productos y traducciones.
- Carga de imagenes/datasheets.
- Precios e inventario.
- Gestion de RFQ.
- Audit log visible.

## IA

La IA debe operar solo mediante herramientas server-only:

- `search_products`.
- `get_product_by_sku`.
- `get_product_by_mpn`.
- `get_product_details`.
- `find_similar_products`.
- `compare_products`.
- `get_product_availability`.
- `get_customer_price`.
- `create_cart_draft`.
- `create_rfq_draft`.

Busqueda hibrida:

1. Match exacto por SKU, MPN o referencia normalizada.
2. Busqueda textual por nombre, fabricante, descripcion y specs.
3. Busqueda semantica con embeddings.
4. Ranking combinado con pesos configurables.
5. Filtros estructurados por marca, categoria, condicion, MOQ, lead time.
6. Exclusion de productos inactivos o no publicados.

Reglas:

- Responder en el idioma del usuario.
- No inventar stock, precio ni especificaciones.
- Enlazar productos reales.
- Indicar cuando no hay resultados.
- Pedir confirmacion antes de crear RFQ/carrito.
- Respetar visibilidad de precios.
- No ejecutar SQL arbitrario.

## LinkedIn

Modo API oficial:

- OAuth 2.0 con `state` validado.
- App de LinkedIn y admin autorizado de pagina.
- Organization ID configurado.
- Tokens cifrados en DB.
- Callback protegido.
- Manejo de expiracion/revocacion.
- Logs de sincronizacion.
- Boton desconectar.
- Sin scraping.

Modo manual de respaldo:

- Admin registra URL de LinkedIn, titulo, resumen, imagen, video opcional, fecha, estado y orden.
- Boton "Ver en LinkedIn".
- La web funciona aunque no exista aprobacion API.

## Videos

- Usar `next/image` para posters y carga diferida.
- Video responsive con `controls`, `preload="metadata"`, poster y subtitulos opcionales.
- Evitar autoplay con sonido.
- Registrar errores de carga.
- Mantener assets en storage y metadata en Postgres.

## Estrategia responsive

- Mobile-first para catalogo, filtros y tablas.
- Filtros como drawer o panel colapsable en 320/375/390.
- Cards con alturas flexibles y textos sin cortes.
- Tablas convertidas a cards o listas comparables en mobile.
- Botones tactiles minimo 44 px.
- Revisar textos en aleman, frances, japones, chino y coreano.
- Evitar `tracking` amplio en CJK.

## SEO

- Crear route files para todas las rutas publicadas.
- Generar metadata por locale y por producto.
- Slugs localizados en tablas de traduccion.
- Sitemap solo con rutas reales y productos publicados.
- `hreflang` para paginas y productos.
- Schema.org: Organization, Product, BreadcrumbList, FAQ si aplica.

## Rendimiento

- Server Components para catalogo publico.
- Paginacion/cursor.
- Indices Postgres desde el inicio.
- Cache control para assets publicos.
- Dynamic import de componentes pesados.
- Evitar cargar IA/chat en paginas donde no se usa.

## Analitica

- Registrar eventos de busqueda, vista de producto, RFQ, add to cart, asistente.
- No registrar PII innecesaria.
- Separar analytics publico de audit logs administrativos.

## Plan de pruebas

- Unit tests para normalizacion, validaciones y helpers.
- Integration tests para API routes/server actions.
- RLS tests con usuarios anon/customer/admin.
- E2E para rutas localizadas, login, catalogo, RFQ y admin.
- Responsive checks en 320, 375, 390, 768, 1024, 1280, 1440.
- Build y lint obligatorios antes de deploy.

## Deploy y migraciones

- Render web service mantiene `npm ci && npm run build` y `npm run start`.
- Migraciones Supabase via CLI en paso controlado, nunca destructivas automaticas.
- Separar preview/staging/production.
- Variables en Render sin valores en repo.
- Health check podria seguir `/en`, y luego sumar endpoint privado de health server-side.

## Rollback

- Mantener migraciones reversibles cuando sea posible.
- Feature flags para catalogo, portal, IA y LinkedIn.
- Deploy por fases.
- Backups antes de cambios de schema.
- Deshabilitar IA/LinkedIn por env var sin afectar web corporativa.

## Estado implementado

- `src/lib/supabase/browser.ts`, `server.ts` y `admin.ts` separan clientes y mantienen `service_role` en modulo server-only.
- `src/lib/catalog/search.ts` lee `public_catalog_products` y facets desde Supabase.
- `src/app/[locale]/catalog/page.tsx` implementa buscador, filtros, empty/error/setup states y URL sincronizada por query params.
- `src/app/[locale]/products/[slug]/page.tsx` implementa detalle publico con galeria, specs, RFQ/cart draft links y estado IA.
- `src/app/[locale]/portal`, `admin`, `cart`, `favorites`, `quotes` y `orders` existen con estados protegidos.
- `src/app/api/ai/catalog/route.ts` usa OpenAI solo desde servidor y no permite SQL libre.
- `supabase/migrations/202607160001_b2b_catalog_platform.sql` define schema, RLS, vista publica y buckets.
