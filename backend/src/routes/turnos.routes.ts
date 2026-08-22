import { Router } from 'express';
import { getTurnos, createTurno, updateEstadoTurno, updateTurno, deleteTurno } from '../controllers/turnos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', getTurnos);
router.post('/', createTurno);
router.patch('/:id/estado', updateEstadoTurno);
router.put('/:id', updateTurno);
router.delete('/:id', deleteTurno);

export default router;
