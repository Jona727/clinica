import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getHistorialPaciente = async (req: Request, res: Response) => {
  try {
    const { pacienteId } = req.params;
    const { rol, profesionalId } = req.user!;

    // Regla de Negocio: Recepción no puede ver historias clínicas
    if (rol === 'RECEPCION') {
      return res.status(403).json({ message: 'Acceso denegado: Confidencialidad médica' });
    }

    let whereClause: any = { pacienteId };

    if (rol === 'PROFESIONAL') {
      whereClause.OR = [
        { esConfidencial: false },
        { profesionalId }
      ];
    } else if (rol !== 'ADMIN') {
      // Si no es ADMIN ni PROFESIONAL, solo ve las no confidenciales
      whereClause.esConfidencial = false;
    }
    // Si es ADMIN, no añadimos filtros adicionales, ve todas.

    const evoluciones = await prisma.evolucionClinica.findMany({
      where: whereClause,
      include: {
        profesional: { select: { nombre: true, apellido: true, especialidad: true } },
        turno: { select: { fechaHoraInicio: true } }
      },
      orderBy: { fecha: 'desc' }
    });

    res.json(evoluciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial' });
  }
};

export const createEvolucion = async (req: Request, res: Response) => {
  try {
    const { pacienteId, turnoId, motivoConsulta, notaClinica, diagnostico, planTratamiento, esConfidencial } = req.body;
    
    const rol = req.user?.rol;
    const profesionalId = req.user?.profesionalId;

    if (!profesionalId || (rol !== 'PROFESIONAL' && rol !== 'ADMIN')) {
      return res.status(403).json({ message: 'Solo los perfiles profesionales autorizados pueden crear evoluciones' });
    }

    let adjuntosPaths: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      adjuntosPaths = req.files.map((file: Express.Multer.File) => `/uploads/${file.filename}`);
    }

    // Validación anti-duplicados por turno
    if (turnoId) {
      const turnoExistente = await prisma.evolucionClinica.findUnique({
        where: { turnoId }
      });
      if (turnoExistente) {
        return res.status(400).json({ message: 'Este turno ya tiene una Historia Clínica cargada. No se pueden duplicar las notas de una misma consulta.' });
      }
    }

    const evolucion = await prisma.evolucionClinica.create({
      data: {
        pacienteId,
        profesionalId: profesionalId,
        turnoId: turnoId || null,
        motivoConsulta,
        notaClinica,
        diagnostico,
        planTratamiento,
        adjuntos: adjuntosPaths,
        esConfidencial: esConfidencial === 'true' || esConfidencial === true
      }
    });

    res.status(201).json(evolucion);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear evolución clínica' });
  }
};

export const firmarEvolucion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profesionalId = req.user?.profesionalId;

    const evolucion = await prisma.evolucionClinica.findUnique({ where: { id } });

    if (!evolucion || evolucion.profesionalId !== profesionalId) {
      return res.status(403).json({ message: 'No autorizado para firmar esta evolución' });
    }

    if (evolucion.estaFirmada) {
      return res.status(400).json({ message: 'La evolución ya se encuentra firmada (inmutable)' });
    }

    const firmada = await prisma.evolucionClinica.update({
      where: { id },
      data: {
        estaFirmada: true,
        firmadaAt: new Date()
      }
    });

    res.json(firmada);
  } catch (error) {
    res.status(500).json({ message: 'Error al firmar evolución' });
  }
};
