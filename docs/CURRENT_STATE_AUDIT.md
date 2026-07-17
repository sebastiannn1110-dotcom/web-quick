# Quicksol Current State Audit

Fecha: 2026-07-17  
Repo local: `C:\Users\sebas\OneDrive\Escritorio\web quick`  
Deploy revisado: `https://web-quick.onrender.com`

## Publication Review

Estado de esta ejecucion:

- Actualizacion 2026-07-17: se agregaron flujos de auth, middleware de sesion Supabase, panel admin protegido con productos/RFQ/contactos/listados, persistencia Supabase-first para contacto/RFQ, notificaciones por Resend, boton flotante de IA y scripts `typecheck`/`test`.
- El video local `video quik/linkedify-1784271038891.mp4` pesa aproximadamente 28.6 MB y no fue copiado a `public/` ni versionado porque `ffmpeg`/`ffprobe` no estan disponibles para generar versiones optimizadas. La carpeta `video quik/` queda ignorada para evitar subir el bruto accidentalmente.
- Los cambios locales de Quicksol estan siendo revisados para publicacion segura.
- Rutas incluidas en el paquete local: `/[locale]/catalog`, `/[locale]/products/[slug]`, `/[locale]/portal`, `/[locale]/admin`, `/[locale]/cart`, `/[locale]/favorites`, `/[locale]/quotes`, `/[locale]/orders`, `/[locale]/rfq`, `/[locale]/contact`, `/[locale]/brands`, `/[locale]/market-insights`.
- La migracion Supabase `supabase/migrations/202607160001_b2b_catalog_platform.sql` se incluye como archivo versionado, pero no fue aplicada en esta ejecucion.
- Siguen pendientes: aplicar migracion en Supabase real, configurar variables en Render, uploads/storage, carrito persistente, LinkedIn manual/official, function calling completo, embeddings, video optimizado y QA con datos reales.
- Commit de publicacion: se crea en esta ejecucion; el hash exacto queda registrado en la salida final porque no puede conocerse antes de crear el commit.

## 1. Resumen ejecutivo

La web publica desplegada en Render carga la home localizada, pero el despliegue actual no contiene las rutas nuevas de catalogo, portal, RFQ ni paginas corporativas que existen en el worktree local sin commit. Esto explica los 404 observados en `/es/portal`, `/es/brands`, `/es/rfq` y `/es/market-insights`: Render esta sirviendo el ultimo commit `2ca98df`, mientras que las rutas que corrigen esos 404 estan en cambios locales sin confirmar.

El worktree local contiene una primera base de plataforma B2B: rutas, clientes Supabase, migracion SQL, catalogo Supabase-first, endpoint de IA server-only y documentacion operativa. Sin embargo, gran parte del e-commerce sigue parcial o solo documentado: no hay login/registro funcional, no hay CRUD administrativo, no hay datos reales confirmados en Supabase, no hay subida real de archivos, no hay UI de asistente flotante, no hay LinkedIn manual visible y no hay pruebas automatizadas.

Porcentaje aproximado:

- Desplegado en Render: 10-15%.
- Worktree local sin commit: 30-35%.

## 2. Stack real

| Elemento | Estado verificado |
| --- | --- |
| Framework | Next.js `16.2.10` |
| React | `19.2.4` |
| Node | `20.19.6` en `package.json`, `.node-version` y `render.yaml` |
| Package manager | npm con `package-lock.json` |
| Router | App Router en `src/app`; no existe `pages/` |
| i18n | `next-intl` con `localePrefix: "always"` y locales `en`, `es`, `zh`, `fr`, `de`, `ja`, `ko` |
| Estilos | Tailwind CSS v4 via `@tailwindcss/postcss`; no existe `tailwind.config.*` |
| Componentes | React + componentes propios + `lucide-react` |
| Animaciones | `framer-motion` |
| Validacion | `zod` |
| Supabase | Dependencias y clientes locales agregados sin commit |
| OpenAI | SDK `openai`; endpoint local server-only |
| Tests | No hay script `test`, `typecheck` ni runner configurado |
| Render | `runtime: node`, `buildCommand: npm ci && npm run build`, `startCommand: npm run start`, health check `/en` |
| Dockerfile | No existe |

## 3. Estado del repositorio

Comandos ejecutados:

- `pwd`: `C:\Users\sebas\OneDrive\Escritorio\web quick`.
- `git branch --show-current`: `main`.
- `git log --oneline -10`: ultimo commit `2ca98df Add Node runtime hints`; luego `d7a22b3 Configure Render Node deploy`; `551357b first commit`.
- `git diff --staged`: sin cambios staged.
- `git rev-parse HEAD` y `git rev-parse origin/main`: ambos `2ca98df3466cac1b676261ac42aa41c8830b48f9`.

Cambios sin confirmar:

- Modificados: `.gitignore`, `README.md`, `package-lock.json`, `package.json`, `src/app/robots.ts`, `src/lib/constants.ts`.
- Nuevos: `.env.example`, `docs/`, `src/app/[locale]/[...slug]/`, `src/app/[locale]/admin/`, `cart/`, `catalog/`, `contact/`, `favorites/`, `orders/`, `portal/`, `products/`, `quotes/`, `rfq/`, `src/app/api/ai/`, `src/components/catalog/`, `src/components/dashboard/`, `src/components/forms/`, `src/lib/ai/`, `src/lib/catalog/`, `src/lib/supabase/`, `supabase/`.

Conclusiones Git:

- El despliegue de Render probablemente corresponde a `origin/main`/`HEAD` (`2ca98df`), no al worktree local.
- Las funcionalidades nuevas no estan desplegadas porque estan sin commit.
- No hay cambios staged.

## 4. Estado de Render

`render.yaml` existe y define:

- Servicio web `web-quick`.
- Rama `main`.
- Build `npm ci && npm run build`.
- Start `npm run start`.
- Health check `/en`.
- Env vars no secretas: `NODE_VERSION=20.19.6`, `NEXT_TELEMETRY_DISABLED=1`.

Prueba HTTP contra Render:

| Ruta | Estado Render |
| --- | --- |
| `/es` | 200 |
| `/es/portal` | 404 |
| `/es/brands` | 404 |
| `/es/rfq` | 404 |
| `/es/market-insights` | 404 |
| `/es/catalog` | 404 |
| `/es/admin` | 404 |
| `/es/cart` | 404 |
| `/es/products/test` | 404 |
| `/sitemap.xml` | 200 |

Causa: rutas no existen en el ultimo commit desplegado. En local sin commit, esas rutas ya existen y devuelven 200.

## 5. Documentacion existente

| Archivo | Existe | Correspondencia con codigo real |
| --- | --- | --- |
| `docs/PROJECT_CONTEXT.md` | Si | Parcial. Incluye auditoria inicial y una seccion posterior que coincide con cambios locales no desplegados. |
| `docs/ECOMMERCE_ARCHITECTURE.md` | Si | Parcial. Describe arquitectura objetivo y estado local implementado; no todo esta funcional. |
| `docs/IMPLEMENTATION_PHASES.md` | Si | Parcial. Plan correcto, pero avances indicados dependen de cambios locales sin commit. |
| `docs/SUPABASE_SETUP.md` | Si | Solo documentado; no verifica Supabase real. |
| `docs/RENDER_ENV_SETUP.md` | Si | Parcial; lista variables, algunas no se usan aun en codigo. |
| `docs/AI_CATALOG_ASSISTANT.md` | Si | Parcial; endpoint existe local, UI/chat no. |
| `docs/LINKEDIN_INTEGRATION.md` | Si | Solo documentado; no hay provider ni UI. |
| `README.md` | Si | Parcial; describe rutas locales no desplegadas. |
| `.env.example` | Si | Existe con valores falsos; no todo se consume en codigo. |

## 6. Variables esperadas por el codigo

| Variable | Usada en codigo | Archivo donde se usa | Cliente/servidor | Obligatoria | Riesgo si falta | Nombre recomendado |
| --- | --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Si | `src/lib/constants.ts` | Cliente/servidor por ser public | Opcional con fallback | Sitemap/canonical pueden apuntar a dominio por defecto | `NEXT_PUBLIC_SITE_URL` |
| `NEXT_PUBLIC_SUPABASE_URL` | Si | `src/lib/supabase/config.ts` | Cliente/servidor | Obligatoria para Supabase | Catalogo, auth y portal quedan en estado setup | `NEXT_PUBLIC_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | No | No encontrado | N/A | No | Si Render usa este nombre, la app no lo lee | Mantener o migrar a `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Si | `src/lib/supabase/config.ts` | Cliente/servidor | Obligatoria para Supabase | Supabase no inicializa | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | Si | `src/lib/supabase/config.ts`, `src/lib/supabase/admin.ts` | Servidor | Obligatoria solo admin server-side | Admin service client no funciona | `SUPABASE_SERVICE_ROLE_KEY` |
| `OPENAI_API_KEY` | Si | `src/app/api/ai/catalog/route.ts` | Servidor | Opcional; activa modo OpenAI | Endpoint cae a `search_only` | `OPENAI_API_KEY` |
| `OPENAI_MODEL` | Si | `src/app/api/ai/catalog/route.ts` | Servidor | Opcional | Usa fallback hardcoded `gpt-5-mini` | `OPENAI_MODEL` |
| `OPENAI_EMBEDDING_MODEL` | No | Solo docs/env example | N/A | Futuro | No hay embeddings funcionales | `OPENAI_EMBEDDING_MODEL` |
| `LINKEDIN_SYNC_MODE` | No | Solo docs/env example | N/A | Futuro | No hay LinkedIn provider | `LINKEDIN_SYNC_MODE` |
| `LINKEDIN_CLIENT_ID` | No | Solo docs/env example | N/A | Futuro | OAuth no existe | `LINKEDIN_CLIENT_ID` |
| `LINKEDIN_CLIENT_SECRET` | No | Solo docs/env example | N/A | Futuro | OAuth no existe | `LINKEDIN_CLIENT_SECRET` |
| `LINKEDIN_REDIRECT_URI` | No | Solo docs/env example | N/A | Futuro | OAuth no existe | `LINKEDIN_REDIRECT_URI` |
| `LINKEDIN_ORGANIZATION_ID` | No | Solo docs/env example | N/A | Futuro | Sync no existe | `LINKEDIN_ORGANIZATION_ID` |
| `LINKEDIN_TOKEN_ENCRYPTION_KEY` | No | Solo docs/env example | N/A | Futuro | Token encryption no existe | `LINKEDIN_TOKEN_ENCRYPTION_KEY` |
| `CHECKOUT_MODE` | No como env | Texto en paginas/docs | N/A | Futuro | Checkout no esta controlado por config real | `CHECKOUT_MODE` |
| `CRON_SECRET` | No | Solo docs/env example | N/A | Futuro | No hay cron endpoints | `CRON_SECRET` |
| `ADMIN_BOOTSTRAP_EMAILS` | No | Solo docs/env example | N/A | Futuro | No hay bootstrap de admin | `ADMIN_BOOTSTRAP_EMAILS` |
| `MAX_IMAGE_UPLOAD_MB` | No | Solo docs/env example | N/A | Futuro | Upload real no existe | `MAX_IMAGE_UPLOAD_MB` |
| `MAX_VIDEO_UPLOAD_MB` | No | Solo docs/env example | N/A | Futuro | Upload real no existe | `MAX_VIDEO_UPLOAD_MB` |

Variable adicional usada por el codigo:

| Variable | Uso |
| --- | --- |
| `CRM_WEBHOOK_URL` | `src/lib/submissions.ts`; reenvio opcional de contacto/RFQ actual. |
| `RESEND_API_KEY` | `src/lib/email/provider.ts`; envio server-side de notificaciones por email. |
| `EMAIL_FROM` | `src/lib/email/provider.ts`; remitente de Resend. |
| `ADMIN_NOTIFICATION_EMAILS` | `src/lib/email/provider.ts`; destinatarios internos separados por coma. |

Inconsistencia clave:

- El proyecto espera realmente `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- No usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Si Render solo tiene `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, la integracion local de Supabase quedara no configurada.

## 7. Estado de Supabase

| Elemento | Estado | Evidencia |
| --- | --- | --- |
| Cliente navegador | PARCIAL | `src/lib/supabase/browser.ts` existe local sin commit. |
| Cliente servidor | PARCIAL | `src/lib/supabase/server.ts` existe local sin commit. |
| Cliente administrativo | PARCIAL | `src/lib/supabase/admin.ts` usa `server-only`, pero no hay flujos admin reales. |
| Middleware de sesiones | NO INICIADO | `middleware.ts` solo usa `next-intl`; no refresca sesiones Supabase. |
| Supabase Auth | PARCIAL | `getCurrentUser()` existe, pero no hay login/registro. |
| Login | NO INICIADO | No existe `/[locale]/login`. |
| Registro | NO INICIADO | No existe `/[locale]/register`. |
| Recuperacion de contrasena | NO INICIADO | No hay rutas ni acciones. |
| Cierre de sesion | NO INICIADO | No hay accion/endpoint. |
| Proteccion de rutas | PARCIAL | Admin/portal muestran estados server-side; no hay redirects ni middleware auth. |
| Migraciones SQL | PARCIAL | Existe `supabase/migrations/202607160001_b2b_catalog_platform.sql`; no consta aplicada. |
| Tablas productos/perfiles/categorias/marcas | SOLO DOCUMENTADO/PARCIAL | Definidas en SQL local, no verificadas en Supabase real. |
| Imagenes/videos/documentos | SOLO DOCUMENTADO/PARCIAL | Tablas y buckets en SQL; no hay upload UI/server action. |
| Carritos/RFQ/pedidos | PARCIAL | Tablas SQL y shells UI; no hay persistencia funcional. |
| Conversaciones de IA | NO INICIADO | Docs mencionan, SQL actual no crea `ai_conversations` ni `ai_messages`. |
| Logs administrativos | PARCIAL | Tabla `admin_audit_logs` en SQL; no se escribe desde app. |
| RLS | SOLO DOCUMENTADO/PARCIAL | Politicas en SQL; no verificadas aplicadas. |
| Buckets Storage | SOLO DOCUMENTADO/PARCIAL | Insert en `storage.buckets`; no verificado aplicado. |

## 8. Estado de autenticacion

Estado: PARCIAL.

Existe:

- Dependencias Supabase.
- `getCurrentUser()` server-side.
- Estados protegidos en `/portal` y `/admin`.

Falta:

- `/login`.
- `/register`.
- Recuperacion de password.
- Verificacion email.
- Logout.
- Session refresh en middleware.
- Formularios auth.
- Server actions o route handlers auth.
- Proteccion real de subrutas de portal/admin.

## 9. Estado del catalogo

Estado local: PARCIAL.  
Estado desplegado: NO INICIADO.

Existe local:

- `/[locale]/catalog/page.tsx`.
- Filtros por query, brand, category, availability, condition, sort.
- Lectura desde `public_catalog_products`.
- Estado setup cuando faltan env vars.
- `ProductCard`.

Falta:

- Datos reales publicados verificados.
- Paginacion UI completa.
- Busqueda semantica.
- Categorias y marcas con paginas propias reales.
- CRUD admin.
- Productos similares/relacionados.
- Botones visibles de catalogo como "Catalogo" en espanol; aparece usando key `brands` como "Brands & Categories" traducido por diccionario.

## 10. Estado del portal de clientes

Estado: PARCIAL local, NO INICIADO desplegado.

Existe local:

- `/[locale]/portal/page.tsx`.
- Estado de Supabase no configurado o sesion requerida.

Falta:

- Login/registro.
- Perfil editable.
- Empresa.
- Favoritos reales.
- Carrito persistente.
- Cotizaciones reales.
- Pedidos reales.
- Subrutas `/portal/profile`, `/portal/favorites`, `/portal/cart`, `/portal/quotes`, `/portal/orders`.

## 11. Estado del panel administrativo

Estado: PARCIAL local, NO INICIADO desplegado.

Existe local:

- `/[locale]/admin/page.tsx`.
- Validacion server-side de rol en `profiles`.
- Cards de modulos.

Falta:

- `/admin/products`, `/admin/categories`, `/admin/brands`, `/admin/customers`, `/admin/quotes`, `/admin/orders`.
- CRUD real.
- Import CSV/XLSX.
- Carga de imagen/video/documentos.
- Audit logging desde acciones.
- Bootstrap super admin.

## 12. Estado del carrito y RFQ

Carrito: PARCIAL local. Existe `/cart` como shell, no hay persistencia ni acciones.

RFQ:

- Formulario publico `/rfq` local usa `ContactForm` y `POST /api/rfq`.
- Endpoint legacy valida Zod, honeypot, rate limit, BOM MIME/tamano y reenvia a `CRM_WEBHOOK_URL`.
- No persiste en Supabase `rfq_requests`.
- No crea `rfq_items`.
- No fusiona carrito anonimo/autenticado.

## 13. Estado de la IA

| Elemento | Estado | Evidencia |
| --- | --- | --- |
| Endpoint OpenAI | PARCIAL | `src/app/api/ai/catalog/route.ts` |
| Cliente OpenAI server-only | PARCIAL | Instanciado dentro de route handler server-side |
| Chat catalogo UI | NO INICIADO | No hay componente chat |
| Boton flotante | NO INICIADO | No hay componente flotante |
| Function calling | NO INICIADO | No usa tools nativas de OpenAI; pasa resultados prebuscados como contexto |
| `search_products` | PARCIAL | `searchProductsForAssistant()` |
| `get_product_details` | NO INICIADO | No existe tool dedicada |
| `find_similar_products` | NO INICIADO | No existe |
| `compare_products` | NO INICIADO | No existe |
| `create_cart_draft` | NO INICIADO | No existe |
| `create_rfq_draft` | NO INICIADO | No existe |
| Busqueda semantica | SOLO DOCUMENTADO | Columna `embedding`; no generacion/consulta |
| Embeddings | SOLO DOCUMENTADO | No jobs ni llamadas embedding |
| Rate limiting | PARCIAL | `rateLimit()` en endpoint IA |
| Prompt injection | PARCIAL | System prompt restrictivo; no evaluaciones ni sanitizacion avanzada |

`OPENAI_API_KEY` solo aparece en route handler server-side, docs y `.env.example`; no se importa en componentes cliente.

## 14. Estado de LinkedIn

Estado: SOLO DOCUMENTADO/PARCIAL SQL.

Existe:

- Documentacion `docs/LINKEDIN_INTEGRATION.md`.
- Tabla `linkedin_posts` en migracion SQL local.

Falta:

- `LinkedInProvider`.
- CRUD manual admin.
- Seccion publica de publicaciones.
- OAuth start/callback.
- Cifrado real de tokens.
- Cron protegido.
- Boton publico "Ver en LinkedIn".

## 15. Estado de imagenes y videos

Estado: SOLO DOCUMENTADO/PARCIAL SQL.

Existe:

- Tablas `product_images`, `product_videos`, `product_documents`, `corporate_videos`.
- Buckets definidos en SQL.
- `ProductCard` y producto detalle pueden renderizar `primary_image_url`.

Falta:

- Upload UI.
- Server actions de upload.
- Validacion de extension/MIME para media real.
- Signed URLs para documentos privados.
- Limpieza de huerfanos.
- Reproductor de videos corporativos.
- Seccion publica de videos.

## 16. Rutas existentes

Locales soportados por arquitectura: `en`, `es`, `zh`, `fr`, `de`, `ja`, `ko`.

| URL | Archivo | Publica/privada | Estado local | Estado Render | Fuente de datos | Enlazada header/footer |
| --- | --- | --- | --- | --- | --- | --- |
| `/[locale]` | `src/app/[locale]/page.tsx` | Publica | OK | OK | JSON mensajes | Header/logo/footer idiomas |
| `/[locale]/catalog` | `src/app/[locale]/catalog/page.tsx` | Publica | PARCIAL | 404 | Supabase vista | Header local via `brands` |
| `/[locale]/products/[slug]` | `src/app/[locale]/products/[slug]/page.tsx` | Publica | PARCIAL | 404 | Supabase vista | Desde tarjetas producto |
| `/[locale]/contact` | `src/app/[locale]/contact/page.tsx` | Publica | PARCIAL | 404 en Render actual | Form/API legacy | Header/footer/CTA |
| `/[locale]/rfq` | `src/app/[locale]/rfq/page.tsx` | Publica | PARCIAL | 404 | Form/API legacy | Header/footer/CTA |
| `/[locale]/portal` | `src/app/[locale]/portal/page.tsx` | Privada futura | PARCIAL | 404 | Supabase Auth | Footer, no header |
| `/[locale]/admin` | `src/app/[locale]/admin/page.tsx` | Privada | PARCIAL | 404 | Supabase profiles | No |
| `/[locale]/cart` | `src/app/[locale]/cart/page.tsx` | Privada/futura | PARCIAL | 404 | Ninguna real | No |
| `/[locale]/favorites` | `src/app/[locale]/favorites/page.tsx` | Privada | PARCIAL | No desplegada | Ninguna real | No |
| `/[locale]/quotes` | `src/app/[locale]/quotes/page.tsx` | Privada | PARCIAL | No desplegada | Ninguna real | No |
| `/[locale]/orders` | `src/app/[locale]/orders/page.tsx` | Privada | PARCIAL | No desplegada | Ninguna real | No |
| `/[locale]/about` | `src/app/[locale]/[...slug]/page.tsx` | Publica | OK local | 404 Render | JSON mensajes | Header/footer |
| `/[locale]/services` | catch-all | Publica | OK local | 404 Render | JSON mensajes | Header/footer |
| `/[locale]/quality` | catch-all | Publica | OK local | 404 Render | JSON mensajes | Header/footer |
| `/[locale]/global-presence` | catch-all | Publica | OK local | 404 Render | JSON mensajes | Header/footer |
| `/[locale]/market-insights` | catch-all | Publica | OK local | 404 Render | JSON mensajes | Header/footer |
| `/[locale]/brands` | catch-all | Publica | OK local | 404 Render | JSON mensajes | Footer |
| `/[locale]/legal/terms` | catch-all | Publica | OK local | 404 Render | JSON mensajes | Footer |
| `/api/contact` | `src/app/api/contact/route.ts` | Public API | OK | OK si commit base | Zod + webhook | Form |
| `/api/rfq` | `src/app/api/rfq/route.ts` | Public API | OK | OK si commit base | Zod + webhook | Form |
| `/api/ai/catalog` | `src/app/api/ai/catalog/route.ts` | Public API rate-limited | PARCIAL local | 404 Render | Supabase/OpenAI | No UI |

Rutas solicitadas que no existen:

- `/[locale]/login`
- `/[locale]/register`
- `/[locale]/portal/profile`
- `/[locale]/portal/favorites`
- `/[locale]/portal/cart`
- `/[locale]/portal/quotes`
- `/[locale]/portal/orders`
- `/[locale]/admin/products`
- `/[locale]/admin/categories`
- `/[locale]/admin/brands`
- `/[locale]/admin/customers`
- `/[locale]/admin/quotes`
- `/[locale]/admin/orders`
- `/[locale]/products` como indice; solo existe `/catalog` y `/products/[slug]`.

## 17. Rutas 404 y causa

| Ruta | Local | Render | Causa exacta |
| --- | --- | --- | --- |
| `/es/portal` | 200 | 404 | Archivo existe local sin commit; Render usa `2ca98df` donde no existe. |
| `/es/brands` | 200 | 404 | Catch-all existe local sin commit; Render usa commit sin route file. |
| `/es/rfq` | 200 | 404 | Route local sin commit; Render usa commit sin route file. |
| `/es/market-insights` | 200 | 404 | Catch-all local sin commit; Render usa commit sin route file. |
| `/es/catalog` | 200 | 404 | Route local sin commit; Render usa commit sin route file. |
| `/es/admin` | 200 | 404 | Route local sin commit; Render usa commit sin route file. |
| `/es/cart` | 200 | 404 | Route local sin commit; Render usa commit sin route file. |
| `/es/products/test` | 200 local setup state | 404 | Dynamic product route local sin commit; Render no la tiene. |

## 18. Revision de interfaz

| Elemento visual | Existe | Archivo actual / lugar recomendado |
| --- | --- | --- |
| Header | Si | `src/components/layout/Header.tsx` |
| Menu movil | Si | `Header.tsx`, boton `Menu/X` |
| Footer | Si | `src/components/layout/Footer.tsx` |
| Home | Si | `src/app/[locale]/page.tsx` |
| CTA RFQ | Si local y en header | `Header.tsx`, `HeroSection.tsx`, `CTASection.tsx` |
| Selector idioma | Si | `LanguageSwitcher.tsx` |
| Boton "Catalogo" | Parcial | Header usa key `brands` apuntando a `/catalog`; texto no necesariamente "Catalogo". Ajustar `navItems`/messages. |
| Boton login | No | Agregar en `Header.tsx` y crear `/[locale]/login`. |
| Boton registro | No | Agregar en `Header.tsx` y crear `/[locale]/register`. |
| Boton portal cliente | Footer si, header no | Agregar acceso visible en `Header.tsx`. |
| Boton carrito | No | Agregar en `Header.tsx`, enlazar `/cart`. |
| Boton favoritos | No | Agregar en portal/header opcional. |
| Boton flotante IA | No | Crear componente cliente, montar en catalog/product layout. |
| Acceso administrativo | No visible | Mantener oculto o agregar ruta directa protegida; no en publico general salvo decision. |
| Seccion LinkedIn | No | Crear componente/seccion en pagina corporativa o insights. |
| Seccion videos | No | Crear seccion corporate videos y producto videos. |

## 19. Problemas responsive

Revision basada en codigo y smoke HTTP; no se hicieron cambios.

- Header desktop puede saturarse al sumar catalogo/login/portal/carrito, especialmente en 1024 px.
- Hero usa `text-5xl` en mobile y puede ser alto en 320/375 px.
- Muchos labels usan uppercase con tracking alto; riesgo en aleman y CJK.
- Catalog filters usan grid `lg:grid-cols-[1.4fr_repeat(5,1fr)_auto]`; en mobile cae a una columna, pero no hay drawer movil.
- Admin y portal son cards, no panel responsive real.
- No hay tablas aun; futuro admin debe convertir tablas a cards o scroll controlado.
- No existe asistente flotante; cuando se agregue, debe evitar tapar CTA/RFQ.
- Imagenes usan `object-cover`; correcto para cards, pero falta validacion visual con medios reales.

## 20. Problemas de seguridad

- Cambios de Supabase/RLS estan en migracion local sin evidencia de aplicacion real.
- Middleware no refresca ni protege sesiones Supabase.
- No hay login/register/logout; no hay rate limit de auth.
- `rateLimit()` es memoria local, no distribuido para Render multi-instancia.
- Admin page consulta `profiles.role`, pero no hay bootstrap ni flujos de rol.
- No hay CSRF strategy para futuras mutaciones.
- No hay CSP.
- No hay upload real ni escaneo/validacion profunda de archivos.
- No hay audit logs escritos desde acciones.
- Endpoint IA tiene prompt restrictivo y rate limit, pero no function calling estricto ni evals de prompt injection.
- Product detail local devuelve 200 setup state para cualquier slug cuando Supabase no esta configurado; puede confundir SEO/QA.

## 21. Resultado de validaciones

Scripts reales en `package.json`:

- `npm run lint`
- `npm run build`
- No existe `npm run typecheck`.
- No existe `npm test`.

Resultados ejecutados:

| Comando | Resultado | Observaciones |
| --- | --- | --- |
| `npm run lint` | OK | Sin errores al cierre. |
| `npm run build` | OK | Compila, TypeScript OK, genera 169 paginas. |
| `npm run typecheck` | No ejecutado | Script no existe. |
| `npm test` | No ejecutado | Script no existe. |

Build de produccion local funciona en el worktree actual.

## 22. Matriz de modulos

| Modulo | Estado | Archivos existentes | Archivos faltantes | Bloqueadores | Prioridad | Proxima accion |
| --- | --- | --- | --- | --- | --- | --- |
| Rutas publicas | PARCIAL | `src/app/[locale]/[...slug]`, `catalog`, `contact`, `rfq` | Commit/deploy | Cambios sin confirmar | Alta | Commit y deploy o reimplementar en rama limpia |
| Catalogo | PARCIAL | `catalog/page.tsx`, `ProductCard`, `CatalogFilters`, `catalog/search.ts` | Datos reales, similar products, paginacion final | Supabase env/migracion | Alta | Configurar Supabase y probar productos publicados |
| Producto detalle | PARCIAL | `products/[slug]/page.tsx` | Productos relacionados, videos reales, 404 correcto sin Supabase | Supabase | Alta | Ajustar estados y conectar media real |
| Supabase DB | SOLO DOCUMENTADO | Migracion SQL | Aplicacion/validacion remota | Credenciales/proyecto | Alta | Aplicar migracion en Supabase staging |
| RLS | SOLO DOCUMENTADO | Politicas SQL | Tests RLS | Migracion no aplicada | Alta | Ejecutar pruebas por rol |
| Auth | PARCIAL | `getCurrentUser`, shells | login/register/logout/reset | Supabase Auth | Alta | Crear flujos auth SSR |
| Portal cliente | PARCIAL | `/portal` shell | subrutas y datos reales | Auth/RLS | Alta | Implementar perfil, favoritos, RFQ |
| Admin | PARCIAL | `/admin` shell | CRUD completo/subrutas/import | Auth/RLS/storage | Alta | Crear admin products/categories/brands |
| Carrito | PARCIAL | `/cart` shell, tablas SQL | acciones persistentes | Auth/session | Media | Implementar carrito anon/auth |
| RFQ | PARCIAL | `/rfq`, `/api/rfq` | persistencia Supabase | DB/env | Alta | Guardar RFQ y RFQ items |
| IA | PARCIAL | `/api/ai/catalog`, `catalog-tools.ts` | UI, function calling, tools completas, embeddings | OpenAI/Supabase | Media | Agregar floating assistant y tools estrictas |
| LinkedIn | SOLO DOCUMENTADO | docs + tabla SQL | provider, admin UI, public UI | Credenciales/decision | Media | Implementar modo manual primero |
| Imagenes/videos | SOLO DOCUMENTADO | tablas/buckets SQL, render image URL | upload, signed URLs, video player | Storage | Media | Implementar upload admin |
| Responsive | PARCIAL | Layout mobile basico | QA visual completa | Falta UI final | Media | Test viewport y ajustar header/catalog/admin |
| SEO | PARCIAL | metadata home/catalog/product, robots/sitemap | JSON-LD product, noindex completo probado | Datos reales | Media | Revisar sitemap post-deploy |
| Pruebas | NO INICIADO | Ninguno | unit/integration/e2e runner | Seleccion de herramientas | Media | Agregar runner despues de estabilizar arquitectura |
| Render deploy | BLOQUEADO | `render.yaml` | Deploy de cambios locales | Sin commit | Alta | Commit/push tras revision |

## 23. Lista exacta de lo que falta

1. Confirmar si se debe conservar el trabajo local sin commit y publicarlo.
2. Resolver inconsistencia de nombre Supabase: proyecto usa `NEXT_PUBLIC_SUPABASE_ANON_KEY`, no `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Configurar Supabase real y aplicar migracion.
4. Verificar RLS y buckets en Supabase.
5. Crear login, registro, logout, recuperacion y middleware de sesion.
6. Crear subrutas de portal.
7. Crear panel admin real con CRUD.
8. Persistir RFQ en Supabase.
9. Implementar carrito y favoritos.
10. Implementar upload de imagenes/videos/documentos.
11. Implementar LinkedIn manual visible.
12. Implementar asistente UI flotante.
13. Completar tools IA: detalle, similares, comparador, drafts.
14. Implementar embeddings si se mantiene pgvector.
15. Agregar pruebas automatizadas.
16. Hacer QA responsive real por viewport.
17. Commit/push/deploy.

## 24. Plan de implementacion

### FASE A

- Objetivo: corregir rutas 404, unificar variables, confirmar Supabase, aplicar migraciones y RLS.
- Dependencias: decision sobre cambios locales sin commit, credenciales Supabase.
- Archivos: `src/lib/constants.ts`, rutas `src/app/[locale]`, `.env.example`, `supabase/migrations`.
- Riesgos: desplegar shells incompletos o variables mal nombradas.
- Criterios: Render devuelve 200 para rutas publicas; Supabase conecta; RLS aplicada.
- Pruebas: `npm run lint`, `npm run build`, smoke HTTP Render, prueba select anon de catalogo.
- Orden: decidir/preservar cambios locales, unificar env, aplicar migracion, deploy.

### FASE B

- Objetivo: autenticacion, registro, login, portal, proteccion de rutas.
- Dependencias: Supabase Auth y RLS.
- Archivos: `middleware.ts`, `src/lib/supabase/*`, `/login`, `/register`, `/portal/*`.
- Riesgos: proteger solo UI o exponer datos por IDOR.
- Criterios: usuario anon no ve portal; customer solo ve sus datos.
- Pruebas: login/logout/reset, RLS customer.
- Orden: auth SSR, forms, route protection, portal profile.

### FASE C

- Objetivo: catalogo, producto, categorias, marcas, busqueda, imagenes y videos.
- Dependencias: tablas y datos reales.
- Archivos: `catalog`, `products`, components catalog, storage.
- Riesgos: mostrar drafts, precios privados o productos inexistentes.
- Criterios: busqueda por MPN/SKU/brand/category y detalle real.
- Pruebas: productos publicados/no publicados, filtros y responsive.
- Orden: seed staging, listado, detalle, media, similares.

### FASE D

- Objetivo: panel administrativo.
- Dependencias: auth admin, service role server-only, RLS.
- Archivos: `/admin/*`, server actions, audit logs.
- Riesgos: role escalation, cambios sin auditoria.
- Criterios: CRUD productos, precios, inventario, traducciones y archivos con audit log.
- Pruebas: admin vs customer, validaciones Zod, upload invalido.
- Orden: admin layout, products CRUD, media, import.

### FASE E

- Objetivo: carrito, favoritos, RFQ, cotizaciones, pedidos.
- Dependencias: catalogo y auth.
- Archivos: `/cart`, `/favorites`, `/quotes`, `/orders`, APIs/actions.
- Riesgos: aceptar precio manipulado desde cliente.
- Criterios: snapshots server-side, MOQ validado, RFQ persistida.
- Pruebas: carrito anon/auth, RFQ, acceso a registros propios.
- Orden: favoritos, carrito, RFQ, quotes/orders.

### FASE F

- Objetivo: IA de catalogo.
- Dependencias: catalogo real y OpenAI.
- Archivos: `src/app/api/ai`, `src/lib/ai`, floating assistant.
- Riesgos: inventar stock/precio, prompt injection, SQL libre.
- Criterios: tools estrictas, confirmacion antes de mutaciones, respuestas con productos reales.
- Pruebas: exact match, no results, prompt injection, permisos.
- Orden: tools, structured outputs, UI, evals.

### FASE G

- Objetivo: LinkedIn manual, OAuth futuro, videos corporativos, analitica.
- Dependencias: admin y storage.
- Archivos: linkedin provider, admin content, public sections, analytics.
- Riesgos: scraping, tokens sin cifrar, PII innecesaria.
- Criterios: modo manual funcional sin API; API desactivada si faltan credenciales.
- Pruebas: CRUD manual, public section, video responsive.
- Orden: manual, public, OAuth scaffold, analytics.

### FASE H

- Objetivo: responsive, accesibilidad, SEO, rendimiento, pruebas, produccion.
- Dependencias: UI final.
- Archivos: global CSS, components, sitemap, tests.
- Riesgos: romper idiomas largos o mobile.
- Criterios: cero overflow en 320/375/390/768/1024/1440, build/test OK.
- Pruebas: viewport matrix, axe/manual keyboard, build Render.
- Orden: responsive QA, SEO, tests, deploy checklist.
