# Quicksol Global - Project Context

Fecha de auditoria: 2026-07-16
Repositorio: `C:\Users\sebas\OneDrive\Escritorio\web quick`

## Resumen ejecutivo

Este proyecto es una web corporativa multilingue de Quicksol Global construida con Next.js App Router. La implementacion actual tiene una home localizada para siete idiomas, navegacion, footer, SEO basico, sitemap, robots y dos API routes para formularios de contacto y RFQ. No existe todavia e-commerce, catalogo persistente, autenticacion, area de clientes, panel administrativo, Supabase, ORM, IA ni LinkedIn.

El riesgo mas urgente es de producto/SEO: el codigo publica enlaces y sitemap para muchas rutas, pero esas paginas no existen en `src/app/[locale]`, por lo que devuelven 404. El contenido traducido para esas secciones ya existe en `src/messages/*.json`, y tambien hay componentes preparados, pero faltan los archivos de ruta.

## Seguridad inicial del repositorio

- `pwd`: `C:\Users\sebas\OneDrive\Escritorio\web quick`.
- Rama: `main`, rastreando `origin/main`.
- `git status --short --branch`: limpio al inicio de la auditoria.
- `git diff --stat`: sin cambios al inicio.
- Archivos no rastreados al inicio: ninguno.
- Archivos `.env*` en raiz al inicio: ninguno encontrado.
- No se abrieron ni imprimieron secretos. Solo se documentan nombres de variables.

## Stack verificado

- Framework: Next.js `16.2.10`.
- React: `19.2.4`.
- React DOM: `19.2.4`.
- Lenguaje: TypeScript `^5`.
- Node: `20.19.6` en `package.json` y `.node-version`.
- Gestor de paquetes: npm, verificado por `package-lock.json`.
- Rutas: App Router bajo `src/app`.
- i18n: `next-intl` `^4.13.1`.
- Estilos: Tailwind CSS v4 via `@tailwindcss/postcss`.
- Animacion: `framer-motion` `^12.42.2`.
- Iconos: `lucide-react` `^1.23.0`.
- Validacion: `zod` `^4.4.3`.
- Linting: ESLint 9 con `eslint-config-next`.
- Tests: no hay framework ni script de pruebas configurado.
- ORM/base de datos: no encontrado.
- Supabase: no instalado ni configurado.
- OpenAI/IA: no instalado ni configurado.
- LinkedIn: no instalado ni configurado.

## Scripts reales

Scripts en `package.json`:

- `npm run dev`: `next dev`.
- `npm run build`: `next build`.
- `npm run start`: `next start`.
- `npm run lint`: `eslint`.

No existe script `typecheck` ni script `test`.

## Estructura de carpetas

- `src/app`: App Router, layout localizado, home, API routes, sitemap y robots.
- `src/app/[locale]/layout.tsx`: layout comun por idioma.
- `src/app/[locale]/page.tsx`: unica pagina publica renderizada por idioma.
- `src/app/api/contact/route.ts`: endpoint POST para contacto.
- `src/app/api/rfq/route.ts`: endpoint POST para RFQ con archivo opcional.
- `src/components/layout`: header, footer, logo y selector de idioma.
- `src/components/sections`: secciones reutilizables para home y futuras paginas.
- `src/components/ui`: componentes pequenos de UI.
- `src/i18n`: routing, request config y navigation de `next-intl`.
- `src/lib`: constantes, diccionarios, SEO, validacion, rate limit y forwarding.
- `src/messages`: traducciones JSON para `en`, `es`, `zh`, `fr`, `de`, `ja`, `ko`.
- `public`: logo SVG, imagen corporativa y assets base de Next.

## Arquitectura actual

La aplicacion usa App Router con prefijo de locale obligatorio. `middleware.ts` aplica `next-intl/middleware` a `/` y a todas las rutas excepto `api`, `_next`, `_vercel` y archivos estaticos. La home se genera estaticamente por cada locale mediante `generateStaticParams`.

El layout localizado valida el locale con `isLocale`; si no coincide, llama `notFound()`. Luego carga el diccionario y los mensajes JSON para `NextIntlClientProvider`.

Los datos de contenido son estaticos y viven en archivos JSON de mensajes. No hay consultas a base de datos ni CMS. Los formularios llaman API routes del propio Next.js y esas API routes reenvian a un webhook externo opcional.

## Sistema de idiomas

Locales verificados en `src/lib/constants.ts`:

- `en`: English, locale por defecto.
- `es`: Espanol.
- `zh`: Chino simplificado.
- `fr`: Frances.
- `de`: Aleman.
- `ja`: Japones.
- `ko`: Coreano.

Configuracion:

- `localePrefix: "always"`.
- `localeDetection: true`.
- `defaultLocale: "en"`.
- Los mensajes se cargan desde `src/messages/{locale}.json`.
- La home usa `getDictionary(locale)` y metadata localizada.
- `LanguageSwitcher` cambia el primer segmento de la URL.
- No hay persistencia explicita en cookie/localStorage.
- `hreflang` se genera con `alternates.languages` en `createPageMetadata`.
- El footer enlaza solo a la home de cada idioma, no conserva la ruta actual.

Revision de traducciones:

- Los siete JSON tienen la misma estructura de claves que `en`.
- Hay textos identicos puntuales entre idiomas, mayormente marca o titulos como `Quicksol Global`; no se detectaron claves faltantes.
- Existen textos para paginas que aun no tienen route file: `about`, `services`, `market`, `brands`, `quality`, `valueAdded`, `global`, `partners`, `careers`, `portal`, `legal`, `contact`, `rfq`.
- La fuente Google `Geist` se carga con `subsets: ["latin"]`; esto puede afectar cobertura optima para chino, japones y coreano. El navegador puede hacer fallback, pero debe verificarse visualmente.

## Rutas existentes y estado

| Ruta | Idioma | Archivo responsable | Renderizado | Layout | Datos | Estado | Auth | Conservar | Ampliar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | n/a | `middleware.ts` | Redirect/locale middleware | n/a | routing | Redirige a locale | No | Si | No |
| `/{locale}` | `en/es/zh/fr/de/ja/ko` | `src/app/[locale]/page.tsx` | Static params + metadata | `src/app/[locale]/layout.tsx` | `src/messages/*.json` | OK | No | Si | Si |
| `/api/contact` | n/a | `src/app/api/contact/route.ts` | Route handler POST | n/a | payload JSON + webhook | OK | No | Si | Si |
| `/api/rfq` | n/a | `src/app/api/rfq/route.ts` | Route handler POST | n/a | multipart form + webhook | OK | No | Si | Si |
| `/robots.txt` | n/a | `src/app/robots.ts` | Metadata route | n/a | constants | OK | No | Si | Si |
| `/sitemap.xml` | n/a | `src/app/sitemap.ts` | Metadata route | n/a | `publicPages` | Genera URLs que hoy incluyen 404 | No | Si | Corregir |

## Rutas enlazadas o publicadas que hoy no existen

Todas estas rutas se publican por locale, por ejemplo `/en/about`, `/es/about`, etc. Causa exacta: existen en `navItems`, `footerGroups` o `publicPages`, pero no hay carpetas ni `page.tsx` bajo `src/app/[locale]/...`.

| Ruta base | Fuente del enlace/sitemap | Causa de 404 |
| --- | --- | --- |
| `/about` | Header, footer, sitemap | Falta `src/app/[locale]/about/page.tsx` |
| `/services` | Header, footer, hero, sitemap | Falta `src/app/[locale]/services/page.tsx` |
| `/quality` | Header, footer, sitemap | Falta `src/app/[locale]/quality/page.tsx` |
| `/global-presence` | Header, footer, sitemap | Falta `src/app/[locale]/global-presence/page.tsx` |
| `/market-insights` | Header, footer, sitemap | Falta `src/app/[locale]/market-insights/page.tsx` |
| `/contact` | Header, footer, CTA, sitemap | Falta `src/app/[locale]/contact/page.tsx` |
| `/rfq` | Header CTA, footer, hero, CTA, sitemap | Falta `src/app/[locale]/rfq/page.tsx` |
| `/brands` | Footer, sitemap | Falta `src/app/[locale]/brands/page.tsx` |
| `/portal` | Footer, sitemap | Falta `src/app/[locale]/portal/page.tsx` |
| `/legal/terms` | Footer, sitemap | Falta `src/app/[locale]/legal/terms/page.tsx` |
| `/legal/privacy` | Footer, sitemap | Falta `src/app/[locale]/legal/privacy/page.tsx` |
| `/legal/cookies` | Footer, sitemap | Falta `src/app/[locale]/legal/cookies/page.tsx` |
| `/value-added-services` | Footer, sitemap | Falta `src/app/[locale]/value-added-services/page.tsx` |
| `/partners` | Footer, sitemap | Falta `src/app/[locale]/partners/page.tsx` |
| `/careers` | Footer, sitemap | Falta `src/app/[locale]/careers/page.tsx` |

No se encontro evidencia de rewrites, redirects, problemas de build o configuracion de Render como causa principal. La causa es ausencia de route files.

## Componentes reutilizables

- `Header`: navegacion desktop/mobile, selector de idioma, CTA RFQ.
- `Footer`: grupos de enlaces, descripcion, cambio de idioma.
- `Logo`: asset SVG de Quicksol.
- `HeroSection`: hero de home con `next/image`.
- `CTASection`: bloque CTA compartido.
- `SimpleCardGrid` y `DetailCardGrid`: tarjetas con iconos Lucide.
- `GlobalMap`: bloque visual para regiones.
- `BrandExplorer`: buscador cliente de categorias/marcas.
- `MarketInsightsExplorer`: buscador/filtro cliente de insights.
- `PageHero`, `ProcessFlow`, `QualityTimeline`, `Breadcrumbs`, `ButtonLink`, `SectionHeader`, `AnimatedWrapper`.

## Flujo de datos actual

- Contenido: JSON estatico en `src/messages`.
- Formularios: cliente futuro -> `POST /api/contact` o `POST /api/rfq`.
- Validacion: `zod` en servidor.
- Antispam: campo honeypot `website`.
- Rate limit: Map en memoria por IP aproximada (`x-forwarded-for`), no distribuido.
- Reenvio: `forwardSubmission` usa `CRM_WEBHOOK_URL` si existe.
- Archivos RFQ: no se almacenan; solo se valida nombre/tipo/tamano y se reenvian metadatos.

## Autenticacion actual

No existe autenticacion. No hay login, cookies de sesion, middleware de auth, Supabase Auth, NextAuth/Auth.js ni roles.

## Base de datos actual

No existe base de datos configurada. No se encontraron Prisma, Drizzle, Supabase client, migraciones ni modelos.

## Integraciones actuales

- CRM webhook opcional: `CRM_WEBHOOK_URL`.
- Google Fonts via `next/font/google`.
- No hay OpenAI.
- No hay LinkedIn.
- No hay analytics.

## Variables de entorno por nombre

Usadas por el codigo actual:

- `NEXT_PUBLIC_SITE_URL`
- `CRM_WEBHOOK_URL`

Usadas por Render actual:

- `NODE_VERSION`
- `NEXT_TELEMETRY_DISABLED`

Propuestas para fases futuras estan en `.env.example` y en `docs/ECOMMERCE_ARCHITECTURE.md`.

## Configuracion de Render

`render.yaml` define:

- Servicio: `web`.
- Nombre: `web-quick`.
- Runtime: `node`.
- Plan: `free`.
- Branch: `main`.
- Build command: `npm ci && npm run build`.
- Start command: `npm run start`.
- Health check: `/en`.
- Auto deploy: `commit`.
- Env vars no secretas: `NODE_VERSION=20.19.6`, `NEXT_TELEMETRY_DISABLED=1`.

No hay workers, cron jobs ni migraciones configuradas.

## SEO

- Metadata de home localizada con canonical, alternates/hreflang, Open Graph y Twitter.
- Organization JSON-LD en home.
- `robots.ts` permite todo y bloquea `/api/`.
- `sitemap.ts` genera todas las combinaciones locale + `publicPages`; actualmente incluye rutas 404.
- Faltan metadata por pagina porque faltan paginas.

## Estado responsive

Observaciones por codigo:

- `container-page` usa `calc(100% - 32px)`, correcto para 320px pero ajustado.
- Header mobile existe bajo `lg:hidden`.
- Navegacion desktop aparece desde `lg`; en tablets se usa menu mobile.
- Hero usa `text-5xl` en mobile y `min-h-[calc(100vh-80px)]`; puede ser alto en 320/375 y con aleman/frances/coreano largo.
- Varios textos usan uppercase con `tracking-[0.18em]` o `tracking-[0.22em]`, posible overflow en aleman/frances y CJK.
- `GlobalMap` tiene `min-h-[420px]` y tarjetas `min-h-48`; puede resultar pesado en 320px.
- `BrandExplorer` contiene 27 botones de letras; usa wrap, pero puede ocupar demasiado alto en mobile.
- No hay tablas hoy.
- No hay videos hoy.
- No se observan modales.
- Hover translate en tarjetas puede sentirse como movimiento no deseado en tactil.

Prioridad responsive:

1. Crear paginas faltantes y probar 320/375/390 con textos reales por idioma.
2. Reducir escala del hero mobile si hay cortes.
3. Ajustar letter spacing de eyebrows en idiomas largos/CJK.
4. Revisar menu mobile con todos los labels traducidos.
5. Convertir futuros catalogos/tablas a patrones mobile-first antes de agregar e-commerce.
6. Revisar estados loading/empty/error en formularios y busquedas.

## Riesgos y deuda tecnica

- Rutas publicadas en sitemap y navegacion devuelven 404.
- Formularios no persisten datos si `CRM_WEBHOOK_URL` no esta configurado.
- Rate limit en memoria no es suficiente para multiples instancias o reinicios.
- No hay autenticacion ni autorizacion.
- No hay almacenamiento seguro de archivos.
- No hay sanitizacion/escaneo de archivos mas alla de MIME/tamano.
- No hay tests.
- No hay script de typecheck independiente.
- `siteBaseUrl` por defecto apunta a `https://quicksolglobal.com`; debe confirmarse contra dominio final.
- Fuentes CJK dependen de fallback.
- Sitemap incluye paginas inexistentes.
- No hay manejo global de errores ni logging estructurado.
- No hay analytics.

## Validaciones ejecutadas

- `npm run lint`: OK.
- `npm run build`: fallo inicialmente por `EPERM: operation not permitted, rmdir '.next\\build\\chunks'`, un lock de artefacto generado en Windows/OneDrive. Se elimino solo `.next` tras verificar que estaba dentro del workspace y el build se repitio sin cambiar codigo.
- `npm run build`: OK despues de limpiar `.next`.
- TypeScript: ejecutado dentro de `next build`; OK.
- Tests: no ejecutados porque no existe script `test`.
- Typecheck separado: no ejecutado porque no existe script `typecheck`.
- Smoke HTTP con servidor local `npm run start -- -p 3000`: `200` para `/en`, `/es`, `/zh`, `/fr`, `/de`, `/ja`, `/ko`, `/sitemap.xml`, `/robots.txt`; `404` para rutas corporativas faltantes como `/en/about`, `/en/services`, `/en/contact`, `/en/rfq`, `/en/legal/terms`.
- Browser visual/responsive automatizado: no completado porque la herramienta local de navegador fallo por conexion del entorno; la auditoria responsive queda basada en codigo y smoke HTTP.

## Implementacion posterior

Actualizado el 2026-07-16:

- Se agregaron rutas localizadas para catalogo, detalle de producto, contacto, RFQ, portal, admin, carrito, favoritos, cotizaciones y pedidos.
- Se agrego un catch-all localizado para paginas corporativas y legales que ya estaban en `src/messages`.
- Se integro Supabase con clientes separados para navegador, servidor SSR y admin server-only.
- Se agrego migracion SQL para catalogo B2B, RLS, vista publica y buckets de Storage.
- Se agrego endpoint `POST /api/ai/catalog` con OpenAI server-only y fallback `search_only` sin credenciales.
- Se agregaron docs de Supabase, Render env, IA, LinkedIn, admin, portal, deploy y rollback.
- Validacion nueva: `npm run lint` OK, `npm run build` OK, smoke HTTP OK para rutas clave.
