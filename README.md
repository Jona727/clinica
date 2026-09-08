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

Se despliega en **Render** (corre tanto el backend en Node.js como el frontend) + **Neon** (base de datos PostgreSQL). Los dos tienen plan gratis permanente y no piden tarjeta. Se descartó InfinityFree porque ese hosting solo sirve PHP + MySQL — no puede ejecutar un backend en Node.js.

El repo incluye `render.yaml`: un "Blueprint" que le dice a Render cómo levantar el backend y el frontend juntos, con un solo clic.

### Primera vez: crear todo

1. **Base de datos en Neon:**
   - Crear cuenta gratis en [neon.com](https://neon.com) (no pide tarjeta).
   - Crear un proyecto nuevo. Copiar la *connection string* que te da (empieza con `postgresql://...`).

2. **Backend + Frontend en Render:**
   - Crear cuenta gratis en [render.com](https://render.com) (no pide tarjeta).
   - *New → Blueprint*, conectar este repositorio de GitHub. Render lee `render.yaml` y propone crear los dos servicios (`emuna-clinica-backend` y `emuna-clinica-frontend`).
   - Antes de confirmar, en el servicio `emuna-clinica-backend` cargar la variable `DATABASE_URL` con la connection string de Neon del paso 1 (el resto de las variables —`JWT_SECRET`, `PORT`— las completa Render solo).
   - Confirmar y esperar a que terminen los dos despliegues.

3. **Cargar los datos iniciales (una sola vez):** desde la pestaña *Shell* del servicio `emuna-clinica-backend` en Render, correr:
   ```bash
   npx tsx prisma/seed.ts
   ```
   Esto crea el centro médico y el usuario administrador de prueba (ver credenciales más arriba). **No lo corras de nuevo** en despliegues futuros — fallaría porque esos datos ya existen (no hace falta: `render.yaml` solo corre `prisma migrate deploy`, que sí es seguro correr en cada deploy).

4. **Revisar la URL real del backend:** Render arma la URL como `https://<nombre-del-servicio>.onrender.com`, pero si ese nombre ya lo usa otra cuenta, Render le agrega un sufijo random al tuyo. Fijate la URL real del backend en su panel de Render; si no coincide con `https://emuna-clinica-backend.onrender.com`, actualizá la variable `VITE_API_URL` del servicio `emuna-clinica-frontend` (agregándole `/api` al final) y volvé a desplegarlo.

### Después de la primera vez

Cada push a `main` redespliega solo (Render está conectado al repo). No hace falta ningún paso manual — salvo, claro, si algún día se agrega una migración nueva de Prisma: `render.yaml` ya corre `prisma migrate deploy` en cada arranque del backend, así que se aplica sola.

### Limitaciones a tener en cuenta (plan gratis)

- **Se "duermen" con la inactividad:** tanto el backend de Render como la base de Neon entran en reposo si nadie los usa por un rato. La primera carga después de estar inactivo puede tardar 30-50 segundos en responder mientras "despiertan". Es normal, no es un error.
- **El disco del backend en Render no es permanente:** los archivos que hoy se guardan en `backend/uploads/` (los adjuntos de Historias Clínicas) se pierden en cada redeploy o reinicio, porque el plan gratis no incluye disco persistente. Todavía no está resuelto — antes de depender de esta función en producción, hay que cambiar dónde se guardan esos archivos (por ejemplo, directo en la base de datos, o en un servicio de almacenamiento aparte).
