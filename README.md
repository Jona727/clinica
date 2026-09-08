# Sistema de Gestión Clínica

Aplicación web para la gestión de un consultorio/centro de salud: turnos, pacientes, historias clínicas y pagos, con control de acceso por roles.

Nació como una solución a medida para una profesional en particular, pensada desde el modelo de datos para poder crecer más adelante a un centro médico con varios profesionales y personal de recepción.

## Funcionalidades

- **Autenticación y roles**: Administrador, Profesional y Recepción, cada uno con permisos distintos.
- **Turnos**: agenda semanal/diaria/mensual, cambio de estado (programado, confirmado, en espera, finalizado, cancelado, etc.) y validaciones de horario.
- **Pacientes**: alta, edición, búsqueda y ficha con historial.
- **Historias Clínicas**: notas de evolución por consulta, con adjuntos y firma digital.
- **Pagos y Caja**: registro de cobros vinculados a turnos, con protección contra pagos duplicados o inconsistentes.
- **Equipo**: el Administrador puede dar de alta, editar y desactivar profesionales y personal de recepción.
- **Auditoría**: queda registro de las acciones importantes que hace cada usuario.

## Tecnologías

- **Backend**: Node.js, Express, Prisma (PostgreSQL), JWT.
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Query.

## Estructura del repositorio

```
backend/    API REST (Express + Prisma)
frontend/   Aplicación web (React + Vite)
```

## Cómo levantar el proyecto en tu máquina

### Requisitos

- Node.js 20 o superior
- PostgreSQL corriendo localmente (o accesible por red)

### 1. Backend

```bash
cd backend
npm install
```

Crear un archivo `.env` dentro de `backend/` con:

```
DATABASE_URL="postgresql://usuario:password@localhost:5432/clinica_db?schema=public"
JWT_SECRET="una-clave-secreta-larga-y-unica"
PORT=3000
```

Crear la base de datos y aplicar el esquema:

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts   # crea un centro médico y un usuario administrador de prueba
```

Levantar el servidor:

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Por defecto el frontend corre en `http://localhost:5173` y espera a la API en `http://localhost:3000/api`.

### Usuario de prueba (después de correr el seed)

- Usuario: `psicologa`
- Contraseña: `admin123`

## Despliegue en producción

Hay dos caminos armados en el repo. **Se descartó InfinityFree y el hosting compartido básico de Hostinger**: ninguno de los dos ejecuta Node.js, solo sirven PHP/HTML estático.

### Opción A: VPS propio con Docker (recomendado)

Todo el proyecto (backend, base de datos y frontend) corre junto en un mismo servidor, con `docker-compose.yml`. Sin límites de tiempo de inactividad, con disco persistente de verdad (los adjuntos de Historias Clínicas no se pierden).

**Qué VPS elegir** (precios de referencia, confirmar al momento de contratar):
- **Hetzner Cloud** — la mejor relación precio/recursos del mercado, desde ~€5.49/mes (CX23: 2 vCPU, 4GB RAM). Es la opción más económica para lo que este proyecto necesita.
- **Hostinger VPS** — si preferís mantener todo en una sola cuenta/facturación ya que sos cliente de Hostinger. Sus planes de VPS (no confundir con el hosting compartido) sí corren Node.js sin restricciones.
- **DigitalOcean** — desde $4/mes, muy buena documentación y tutoriales para quien recién empieza con VPS.

Cualquiera alcanza de sobra para el uso de un consultorio: el plan más chico de cualquiera de los tres sirve.

**Primera vez, en el VPS (Ubuntu):**

1. Instalar Docker: seguir la [guía oficial](https://docs.docker.com/engine/install/ubuntu/) (o el instalador rápido: `curl -fsSL https://get.docker.com | sh`).
2. Clonar el repo: `git clone <url-del-repo> && cd clinica`.
3. Copiar `.env.example` a `.env` en la raíz y completar `DB_PASSWORD` y `JWT_SECRET` con valores propios (`openssl rand -base64 48` genera uno bueno para el segundo).
4. Levantar todo: `docker compose up -d --build`.
5. Cargar los datos iniciales (**solo la primera vez**): `docker compose exec backend npx tsx prisma/seed.ts`.
6. Apuntar el dominio/subdominio (registro DNS tipo A) a la IP del VPS. El sitio queda escuchando en el puerto 80.

**Después de la primera vez:** para actualizar tras un cambio en el código, en el VPS: `git pull && docker compose up -d --build`. Las migraciones de Prisma se aplican solas en cada arranque del backend.

**Pendiente, no automatizado todavía:** HTTPS (certificado SSL). Con dominio propio apuntando al VPS, se agrega fácil con [Certbot](https://certbot.eff.org/) corriendo delante de Nginx — avisame cuando llegues a ese paso y lo dejamos armado.

Se probó localmente el `docker-compose.yml` completo (los tres contenedores levantados juntos, con login, migraciones automáticas y el proxy de Nginx hacia la API) antes de dejarlo documentado acá.

### Opción B: Render (backend + frontend) + Neon (base de datos) — gratis, sin VPS

Alternativa sin costo si preferís no administrar un servidor. El repo incluye `render.yaml` (Blueprint de Render) para levantar los dos servicios con un clic.

1. **Base de datos en Neon:** cuenta gratis en [neon.com](https://neon.com) (sin tarjeta), crear un proyecto, copiar la *connection string*.
2. **Backend + Frontend en Render:** cuenta gratis en [render.com](https://render.com) (sin tarjeta), *New → Blueprint*, conectar el repo. Antes de confirmar, cargar `DATABASE_URL` en el servicio `emuna-clinica-backend` con la connection string de Neon.
3. Cargar los datos iniciales una sola vez desde la *Shell* del servicio backend en Render: `npx tsx prisma/seed.ts`.
4. Revisar la URL real que Render le asignó al backend (puede llevar un sufijo si el nombre ya estaba tomado) y, si no coincide con lo que espera `render.yaml`, actualizar `VITE_API_URL` en el servicio frontend.

Después del primer despliegue, cada push a `main` redespliega solo.

**Limitaciones del plan gratis:** tanto Render como Neon "duermen" con la inactividad (la primera carga después de un rato sin uso tarda 30-50 segundos en responder), y el disco del backend en Render **no es persistente** — los adjuntos de Historias Clínicas se perderían en cada redeploy. La Opción A (VPS) no tiene ninguna de estas dos limitaciones.
