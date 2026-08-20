import { Router } from 'express';
import { getPacientes, getPacienteById, createPaciente, updatePaciente } from '../controllers/pacientes.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rbacMiddleware } from '../middlewares/rbac.middleware';
import { RolUsuario } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// Todos los roles pueden ver pacientes
router.get('/', getPacientes);
router.get('/:id', getPacienteById);

// Recepcion y Admin pueden crear/editar
router.post('/', rbacMiddleware([RolUsuario.ADMIN, RolUsuario.RECEPCION]), createPaciente);
router.put('/:id', rbacMiddleware([RolUsuario.ADMIN, RolUsuario.RECEPCION]), updatePaciente);

export default router;
