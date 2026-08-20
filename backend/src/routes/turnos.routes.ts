import { Router } from 'express';
import { getTurnos, createTurno, updateEstadoTurno } from '../controllers/turnos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', getTurnos);
router.post('/', createTurno);
router.patch('/:id/estado', updateEstadoTurno);

export default router;
