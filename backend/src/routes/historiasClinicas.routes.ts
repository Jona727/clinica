import { Router } from 'express';
import { getHistorialPaciente, createEvolucion, firmarEvolucion, getAdjunto } from '../controllers/historiasClinicas.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/paciente/:pacienteId', getHistorialPaciente);
router.get('/adjuntos/:filename', getAdjunto);
router.post('/', uploadMiddleware.array('archivos', 5), createEvolucion);
router.post('/:id/firmar', firmarEvolucion);

export default router;
