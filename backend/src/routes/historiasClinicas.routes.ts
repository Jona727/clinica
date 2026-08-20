import { Router } from 'express';
import { getHistorialPaciente, createEvolucion, firmarEvolucion } from '../controllers/historiasClinicas.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/paciente/:pacienteId', getHistorialPaciente);
router.post('/', createEvolucion);
router.post('/:id/firmar', firmarEvolucion);

export default router;
