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

    const evoluciones = await prisma.evolucionClinica.findMany({
      where: {
        pacienteId,
        // Si es profesional y la nota es confidencial, solo la ve si él es el autor
        // (Simplificado: si es profesional, ve las propias, si no son confidenciales las ven todos)
        OR: [
          { esConfidencial: false },
          ...(rol === 'PROFESIONAL' ? [{ profesionalId }] : []),
          ...(rol === 'ADMIN' ? [{}] : []) // Admin ve todo
        ]
      },
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
    
    // Solo profesionales pueden crear evoluciones
    if (req.user?.rol !== 'PROFESIONAL') {
      return res.status(403).json({ message: 'Solo los profesionales pueden crear evoluciones' });
    }

    const evolucion = await prisma.evolucionClinica.create({
      data: {
        pacienteId,
        profesionalId: req.user.profesionalId!,
        turnoId,
        motivoConsulta,
        notaClinica,
        diagnostico,
        planTratamiento,
        esConfidencial: esConfidencial ?? true
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
