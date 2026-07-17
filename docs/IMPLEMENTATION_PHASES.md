# Quicksol Global - Implementation Phases

## Fase 1 - Fundamentos

Objetivo: corregir la base publica sin e-commerce.

- Archivos: `src/app/[locale]/**`, `src/messages/*.json`, `src/lib/seo.ts`, `src/lib/constants.ts`.
- Dependencias: ninguna nueva obligatoria.
- Riesgos: romper URLs localizadas o sitemap.
- Criterios de aceptacion: todas las rutas publicadas existen y no devuelven 404.
- Pruebas: `npm run lint`, `npm run build`, smoke test por locale.
- Rollback: revertir route files nuevos y cambios de sitemap.

## Fase 2 - Supabase

Objetivo: instalar Supabase client/server y preparar conexion.

- Archivos: `src/lib/supabase/**`, `.env.example`, docs de deploy.
- Dependencias: `@supabase/supabase-js`, helpers SSR si se decide usarlos.
- Riesgos: exponer service role o mezclar anon/service clients.
- Criterios: cliente anon solo navegador, service role solo servidor.
- Pruebas: typecheck/build y prueba de conexion server-only.
- Rollback: remover dependencia y clientes.

## Fase 3 - Autenticacion

Objetivo: login customer/admin con Supabase Auth.

- Archivos: middleware/auth helpers, rutas login/account/admin.
- Dependencias: Supabase Auth.
- Riesgos: UI-only auth, sesiones mal protegidas.
- Criterios: rutas privadas protegidas en servidor.
- Pruebas: E2E anon/customer/admin.
- Rollback: feature flag para ocultar portal/admin.

## Fase 4 - Base de datos

Objetivo: schema inicial de catalogo, clientes, RFQ, roles y audit logs.

- Archivos: `supabase/migrations/**`, SQL docs.
- Dependencias: Supabase Postgres.
- Riesgos: RLS incompleta o migraciones destructivas.
- Criterios: RLS probada por rol.
- Pruebas: SQL tests y queries con roles simulados.
- Rollback: migraciones reversibles y backup.

## Fase 5 - Catalogo

Objetivo: listado, busqueda y detalle de productos publicados.

- Archivos: `src/app/[locale]/products/**`, componentes catalogo, servicios server.
- Dependencias: DB y storage.
- Riesgos: mostrar productos no publicados o precios privados.
- Criterios: busqueda exacta SKU/MPN y filtros basicos.
- Pruebas: unit, integration, responsive.
- Rollback: ocultar nav de catalogo y desactivar rutas.

## Fase 6 - Administracion

Objetivo: panel admin para productos, categorias, marcas, assets y traducciones.

- Archivos: `src/app/[locale]/admin/**`, server actions, audit logs.
- Dependencias: auth admin, storage.
- Riesgos: endpoints admin sin auth, escalamiento de rol.
- Criterios: CRUD protegido y auditado.
- Pruebas: E2E admin y RLS.
- Rollback: feature flag admin.

## Fase 7 - Clientes

Objetivo: portal de cliente con perfil, empresa, favoritos e historial.

- Archivos: `src/app/[locale]/portal/**`, services customer.
- Dependencias: auth customer, companies.
- Riesgos: acceso entre empresas.
- Criterios: customer solo ve sus datos.
- Pruebas: RLS multi-company.
- Rollback: ocultar portal y conservar datos.

## Fase 8 - Carrito y RFQ

Objetivo: carrito B2B y solicitudes de cotizacion persistentes.

- Archivos: cart components, `rfq` pages, server actions/API.
- Dependencias: catalogo, clientes.
- Riesgos: cantidades/precios manipulados desde cliente.
- Criterios: validacion server-side y RFQ por empresa.
- Pruebas: E2E carrito/RFQ.
- Rollback: desactivar checkout/RFQ persistente, mantener formulario legacy.

## Fase 9 - IA

Objetivo: asistente conectado al catalogo mediante herramientas server-only.

- Archivos: `src/app/api/ai/**`, `src/lib/ai/**`, tools catalogo.
- Dependencias: OpenAI, busqueda catalogo, opcional pgvector.
- Riesgos: SQL libre, inventar datos, filtrar precios.
- Criterios: tool calls auditables y respuestas con productos reales.
- Pruebas: evals de SKU/MPN, permisos customer/public.
- Rollback: feature flag `AI_ASSISTANT_ENABLED=false`.

## Fase 10 - LinkedIn

Objetivo: integrar publicaciones con modo API oficial y modo manual.

- Archivos: `src/lib/linkedin/**`, admin content, storage.
- Dependencias: OAuth LinkedIn si se aprueba.
- Riesgos: scraping, tokens sin cifrar, callback inseguro.
- Criterios: modo manual funciona sin aprobacion API.
- Pruebas: OAuth callback en staging y CRUD manual.
- Rollback: usar solo modo manual.

## Fase 11 - Videos y archivos

Objetivo: buckets, carga segura, posters y datasheets.

- Archivos: storage policies, upload server actions, asset components.
- Dependencias: Supabase Storage, procesamiento opcional.
- Riesgos: archivos maliciosos o huerfanos.
- Criterios: MIME/tamano/ruta seguros y politicas por rol.
- Pruebas: upload valid/invalid, permisos y responsive.
- Rollback: desactivar uploads y conservar lectura.

## Fase 12 - Responsive

Objetivo: pulir home, paginas corporativas, catalogo, portal y admin.

- Archivos: componentes UI, CSS global, pages.
- Dependencias: paginas completas.
- Riesgos: cambios visuales grandes.
- Criterios: sin overflow en 320/375/390/768/1024/1280/1440.
- Pruebas: screenshots y smoke manual por idioma.
- Rollback: revertir componente por componente.

## Fase 13 - SEO

Objetivo: metadata por pagina/producto, sitemap real y schema.

- Archivos: `src/lib/seo.ts`, page metadata, sitemap.
- Dependencias: catalogo publicado.
- Riesgos: indexar drafts o URLs 404.
- Criterios: sitemap solo rutas reales/publicadas.
- Pruebas: build, inspeccion de metadata, crawling local.
- Rollback: sitemap corporativo minimo.

## Fase 14 - Pruebas

Objetivo: suite minima confiable.

- Archivos: config test, unit/integration/e2e.
- Dependencias: seleccion de runner.
- Riesgos: tests lentos o dependientes de produccion.
- Criterios: unit + integration + smoke e2e en CI/local.
- Pruebas: la fase es la suite.
- Rollback: mantener lint/build como baseline si un runner bloquea.

## Fase 15 - Produccion

Objetivo: deploy seguro en Render.

- Archivos: `render.yaml`, docs ops, env vars Render.
- Dependencias: secretos reales provisionados fuera del repo.
- Riesgos: cold start, migraciones, secrets faltantes.
- Criterios: build OK, health OK, logs limpios, rollback documentado.
- Pruebas: staging smoke, production smoke post-deploy.
- Rollback: redeploy version anterior y desactivar flags.

## Avance implementado

- Fase 1: rutas publicas reparadas y smoke HTTP verificado.
- Fase 2: clientes Supabase separados implementados.
- Fase 4: migracion SQL inicial creada.
- Fase 5: catalogo publico y detalle de producto implementados contra Supabase.
- Fase 6/7/8: shells protegidos de portal, admin, carrito, favoritos, cotizaciones y pedidos creados; mutaciones completas quedan pendientes de credenciales/RLS aplicada.
- Fase 9: endpoint de IA implementado con fallback seguro sin OpenAI.
- Fase 10/11/20/21: documentacion y tablas base para LinkedIn/manual media/corporate videos creadas.
