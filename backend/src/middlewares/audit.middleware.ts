import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const auditMiddleware = (entidad: string, accion: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Interceptamos la respuesta para loguear solo si fue exitosa (200-299)
    const originalSend = res.send;
    
    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Enviar a segundo plano la auditoría
        const usuarioId = req.user?.usuarioId || null;
        let detalles = '';
        
        try {
           if (req.method !== 'GET') {
               detalles = JSON.stringify(req.body);
           }
        } catch(e) {}

        prisma.auditoriaLog.create({
          data: {
            usuarioId,
            accion: `${req.method} ${accion}`,
            entidad,
            detalles,
            ipAddress: req.ip || req.socket.remoteAddress
          }
        }).catch(err => console.error('Error al guardar auditoría:', err));
      }
      
      return originalSend.call(this, body);
    };

    next();
  };
};
