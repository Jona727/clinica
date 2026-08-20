import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { EstadoTurno } from '@prisma/client';

export const getTurnos = async (req: Request, res: Response) => {
  try {
    const { profesionalId, fechaInicio, fechaFin } = req.query;
    
    // Si es PROFESIONAL, forzar que solo vea los suyos
    const filterProfesionalId = req.user?.rol === 'PROFESIONAL' ? req.user.profesionalId : profesionalId;

    const turnos = await prisma.turno.findMany({
      where: {
        paciente: { centroMedicoId: req.user?.centroMedicoId },
        ...(filterProfesionalId ? { profesionalId: String(filterProfesionalId) } : {}),
        ...(fechaInicio && fechaFin ? {
          fechaHoraInicio: {
            gte: new Date(String(fechaInicio)),
            lte: new Date(String(fechaFin))
          }
        } : {})
      },
      include: {
        paciente: { select: { id: true, nombre: true, apellido: true, dni: true } },
        profesional: { select: { id: true, nombre: true, apellido: true } }
      },
      orderBy: { fechaHoraInicio: 'asc' }
    });

    res.json(turnos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener turnos' });
  }
};

export const createTurno = async (req: Request, res: Response) => {
  try {
    const { pacienteId, profesionalId, fechaHoraInicio, fechaHoraFin, esSobreturno, motivoConsulta } = req.body;

    // Validación básica de solapamiento si no es sobreturno
    if (!esSobreturno) {
      const solapamiento = await prisma.turno.findFirst({
        where: {
          profesionalId,
          estado: { notIn: ['CANCELADO', 'AUSENTE'] },
          AND: [
            { fechaHoraInicio: { lt: new Date(fechaHoraFin) } },
            { fechaHoraFin: { gt: new Date(fechaHoraInicio) } }
          ]
        }
      });

      if (solapamiento) {
        return res.status(400).json({ message: 'El horario seleccionado se solapa con otro turno existente.' });
      }
    }

    const turno = await prisma.turno.create({
      data: {
        pacienteId,
        profesionalId,
        fechaHoraInicio: new Date(fechaHoraInicio),
        fechaHoraFin: new Date(fechaHoraFin),
        esSobreturno: esSobreturno || false,
        motivoConsulta
      }
    });

    res.status(201).json(turno);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear turno' });
  }
};

export const updateEstadoTurno = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; // EstadoTurno

    const turno = await prisma.turno.update({
      where: { id },
      data: { estado: estado as EstadoTurno }
    });

    res.json(turno);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado del turno' });
  }
};
