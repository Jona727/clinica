import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { EstadoPago, MetodoPago } from '@prisma/client';

export const registrarCobro = async (req: Request, res: Response) => {
  try {
    const { pacienteId, turnoId, montoTotal, montoCopago, montoCobertura, metodoPago, comprobanteNro, observaciones } = req.body;

    const pago = await prisma.pago.create({
      data: {
        pacienteId,
        turnoId,
        montoTotal,
        montoCopago,
        montoCobertura,
        metodoPago: metodoPago as MetodoPago,
        comprobanteNro,
        observaciones,
        estado: EstadoPago.PAGADO
      }
    });

    // Si está asociado a un turno, opcionalmente marcamos el turno como pagado o finalizado
    if (turnoId) {
      // Logica adicional si es necesario
    }

    res.status(201).json(pago);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar cobro' });
  }
};

export const getPagos = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const pagos = await prisma.pago.findMany({
      where: {
        paciente: { centroMedicoId: req.user?.centroMedicoId },
        ...(fechaInicio && fechaFin ? {
          createdAt: {
            gte: new Date(String(fechaInicio)),
            lte: new Date(String(fechaFin))
          }
        } : {})
      },
      include: {
        paciente: { select: { nombre: true, apellido: true, dni: true } },
        turno: { select: { fechaHoraInicio: true, profesional: { select: { nombre: true, apellido: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(pagos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pagos' });
  }
};
