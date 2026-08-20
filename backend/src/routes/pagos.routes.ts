import { Router } from 'express';
import { registrarCobro, getPagos } from '../controllers/pagos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rbacMiddleware } from '../middlewares/rbac.middleware';
import { RolUsuario } from '@prisma/client';

const router = Router();
router.use(authMiddleware);

// Recepción y Admin manejan la caja
router.post('/', rbacMiddleware([RolUsuario.ADMIN, RolUsuario.RECEPCION]), registrarCobro);
router.get('/', rbacMiddleware([RolUsuario.ADMIN, RolUsuario.RECEPCION]), getPagos);

export default router;
