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

**Importante:** InfinityFree (y la mayoría de los hostings gratuitos tipo "PHP + MySQL") solo sirve archivos estáticos y PHP — **no puede correr el backend** (Node.js/Express) ni una base de datos PostgreSQL. Ahí solo puede alojarse el **frontend**, ya compilado como HTML/CSS/JS estático. El backend necesita un hosting que corra Node.js con una base PostgreSQL (por ejemplo Railway, Render o Fly.io — todos tienen planes gratuitos o muy económicos que alcanzan para este proyecto).

### Frontend → InfinityFree (automático)

El repo incluye `.github/workflows/deploy-frontend.yml`: cada push a `main` que toque `frontend/` compila el sitio y lo sube por FTP a InfinityFree automáticamente.

Para activarlo, en GitHub → *Settings → Secrets and variables → Actions* de este repositorio, cargar:

**Secrets** (datos sensibles, no se ven en los logs):
- `FTP_SERVER`: el host FTP que te dio InfinityFree (algo como `ftpupload.net`).
- `FTP_USERNAME`: tu usuario FTP de InfinityFree.
- `FTP_PASSWORD`: tu contraseña FTP de InfinityFree.

**Variables** (no sensibles):
- `VITE_API_URL`: la URL pública de tu backend ya desplegado, terminada en `/api` (ej. `https://tu-backend.onrender.com/api`). Sin esto, el sitio se compila apuntando a `http://localhost:3000/api` y no va a poder hablar con ningún backend real.
- `FTP_SERVER_DIR` (opcional): la carpeta remota donde subir el sitio. Por defecto usa `/htdocs/`, que es la raíz web estándar de InfinityFree — pero si el sitio vive en un subdominio o dominio adicional, puede ser otra carpeta (se ve en el File Manager de InfinityFree).

También se puede disparar a mano desde la pestaña *Actions* del repo (botón "Run workflow"), sin esperar a un push.

### Backend → un hosting con Node.js

Todavía sin definir/automatizar. Una vez que se elija dónde va a vivir (Railway, Render, Fly.io, etc.), hay que:
1. Desplegar `backend/` ahí, con las mismas variables de entorno que en local (`DATABASE_URL` apuntando a una base Postgres real, `JWT_SECRET`, `PORT`).
2. Correr `npx prisma migrate deploy` contra esa base para crear las tablas.
3. Cargar esa URL pública como `VITE_API_URL` (ver arriba) para que el frontend en InfinityFree le hable a ese backend.
