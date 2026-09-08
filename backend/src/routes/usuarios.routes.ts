import { Router } from 'express';
import { RolUsuario } from '@prisma/client';
import { getUsuarios, createUsuario, updateUsuario, toggleEstadoUsuario } from '../controllers/usuarios.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rbacMiddleware } from '../middlewares/rbac.middleware';
import { sudoMiddleware } from '../middlewares/sudo.middleware';

const router = Router();

router.use(authMiddleware);

// Solo ADMIN gestiona el equipo del centro médico
const soloAdmin = rbacMiddleware([RolUsuario.ADMIN]);

router.get('/', soloAdmin, getUsuarios);
router.post('/', soloAdmin, createUsuario);
router.put('/:id', soloAdmin, updateUsuario);
router.patch('/:id/estado', soloAdmin, sudoMiddleware, toggleEstadoUsuario);

export default router;
