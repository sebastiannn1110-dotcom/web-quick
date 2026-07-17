# Acceso Administrativo Quicksol

Base local: `http://localhost:3000`
Produccion: `https://web-quick.onrender.com`

| Nombre | URL local | URL produccion | Rol requerido | Funcion | Estado |
| --- | --- | --- | --- | --- | --- |
| Login | `http://localhost:3000/es/login` | `https://web-quick.onrender.com/es/login` | Publico | Inicio de sesion Supabase | Implementado |
| Registro | `http://localhost:3000/es/register` | `https://web-quick.onrender.com/es/register` | Publico | Registro con rol inicial `customer` | Implementado |
| Admin | `http://localhost:3000/es/admin` | `https://web-quick.onrender.com/es/admin` | `admin`, `super_admin` | Dashboard y enlaces operativos | Implementado |
| Productos | `http://localhost:3000/es/admin/products` | `https://web-quick.onrender.com/es/admin/products` | `admin`, `super_admin` | Lista, filtros y estados de producto | Implementado |
| Nuevo producto | `http://localhost:3000/es/admin/products/new` | `https://web-quick.onrender.com/es/admin/products/new` | `admin`, `super_admin` | Crear SKU, MPN, precio, stock y datos tecnicos | Implementado |
| Editar producto | `http://localhost:3000/es/admin/products/{id}` | `https://web-quick.onrender.com/es/admin/products/{id}` | `admin`, `super_admin` | Editar producto existente | Implementado |
| Categorias | `http://localhost:3000/es/admin/categories` | `https://web-quick.onrender.com/es/admin/categories` | `admin`, `super_admin` | Lectura administrativa de categorias | Preparado |
| Marcas | `http://localhost:3000/es/admin/brands` | `https://web-quick.onrender.com/es/admin/brands` | `admin`, `super_admin` | Lectura administrativa de marcas | Preparado |
| Multimedia | `http://localhost:3000/es/admin/media` | `https://web-quick.onrender.com/es/admin/media` | `admin`, `super_admin` | Area protegida para Storage | Preparado |
| Cotizaciones | `http://localhost:3000/es/admin/rfqs` | `https://web-quick.onrender.com/es/admin/rfqs` | `admin`, `super_admin` | Lista de RFQ | Implementado |
| Detalle cotizacion | `http://localhost:3000/es/admin/rfqs/{id}` | `https://web-quick.onrender.com/es/admin/rfqs/{id}` | `admin`, `super_admin` | RFQ e items solicitados | Implementado |
| Contactos | `http://localhost:3000/es/admin/contacts` | `https://web-quick.onrender.com/es/admin/contacts` | `admin`, `super_admin` | Lista de solicitudes de contacto | Implementado |
| Detalle contacto | `http://localhost:3000/es/admin/contacts/{id}` | `https://web-quick.onrender.com/es/admin/contacts/{id}` | `admin`, `super_admin` | Solicitud completa | Implementado |
| Clientes | `http://localhost:3000/es/admin/customers` | `https://web-quick.onrender.com/es/admin/customers` | `admin`, `super_admin` | Lista de perfiles | Implementado |
| Detalle cliente | `http://localhost:3000/es/admin/customers/{id}` | `https://web-quick.onrender.com/es/admin/customers/{id}` | `admin`, `super_admin` | Perfil, RFQ y pedidos | Implementado |
| Pedidos | `http://localhost:3000/es/admin/orders` | `https://web-quick.onrender.com/es/admin/orders` | `admin`, `super_admin` | Lista de pedidos RFQ | Implementado |
| Detalle pedido | `http://localhost:3000/es/admin/orders/{id}` | `https://web-quick.onrender.com/es/admin/orders/{id}` | `admin`, `super_admin` | Pedido e items | Implementado |
| Diagnostico IA | `http://localhost:3000/es/admin/ai-catalog` | `https://web-quick.onrender.com/es/admin/ai-catalog` | `admin`, `super_admin` | Prueba busqueda catalogo usada por Compra con IA | Implementado |
| Configuracion | `http://localhost:3000/es/admin/settings` | `https://web-quick.onrender.com/es/admin/settings` | `admin`, `super_admin` | Variables server-managed sin mostrar secretos | Implementado |

## Crear el primer administrador

1. Configurar en Render `ADMIN_BOOTSTRAP_EMAILS` con correos separados por coma, en minusculas o normalizables.
2. Registrarse desde `/es/register`.
3. Confirmar el correo en Supabase Auth.
4. Iniciar sesion desde `/es/login`.
5. El servidor valida el correo confirmado contra `ADMIN_BOOTSTRAP_EMAILS`.
6. Si coincide, una operacion server-only asigna `super_admin` y registra `admin_audit_logs`.

El formulario de registro nunca permite seleccionar `admin` ni `super_admin`.

## Crear y publicar un producto

1. Entrar a `/es/admin/products/new`.
2. Completar `SKU`, `MPN`, `slug`, titulo, fabricante, precio, stock, MOQ, lead time, condicion, empaque, pais de origen y especificaciones JSON.
3. Elegir marca y categoria si ya existen.
4. Guardar como `draft` o `published`.
5. Si se publica, `embedding_status` queda `pending` para indexacion.
6. Verificar en `/es/catalog` que solo aparezca si esta `published`, `visibility=public` y sin `archived_at`.

## Probar Compra con IA

1. Entrar a `/es/admin/ai-catalog`.
2. Escribir un MPN, SKU o necesidad en "Search as customer".
3. Revisar resultados reales del catalogo publicado.
4. Si no hay resultados, el asistente debe indicar que no encontro la referencia publicada y no debe inventar productos.

## Pendientes operativos

- Aplicar migraciones Supabase en el proyecto correcto antes de probar escritura real.
- Confirmar que el proyecto Supabase enlazado es `ceelvqhknqsfuklijcrm`.
- Configurar variables Render sin imprimir valores: Supabase, OpenAI, `ADMIN_BOOTSTRAP_EMAILS`, `CHECKOUT_MODE=rfq`, limites de upload.
- Los uploads de media tienen area protegida y buckets/policies SQL; falta validar el flujo end-to-end con credenciales reales.
