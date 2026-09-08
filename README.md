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
