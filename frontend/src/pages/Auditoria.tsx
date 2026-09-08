import { Fragment, useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuditoria } from '../hooks/useAuditoria';

export const Auditoria = () => {
  const { logs, isLoading, error } = useAuditoria();
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  const nombreUsuario = (log: any) => {
    if (!log.usuario) return 'Usuario eliminado';
    if (log.usuario.profesional) return `${log.usuario.profesional.nombre} ${log.usuario.profesional.apellido}`;
    if (log.usuario.nombre) return `${log.usuario.nombre} ${log.usuario.apellido || ''}`.trim();
    return log.usuario.username;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-serif font-bold text-warm-900 flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-warm-600" /> Auditoría
        </h2>
        <p className="text-warm-600 mt-1">Registro de las últimas 200 acciones realizadas en el sistema.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-warm-50 text-warm-800 border-b border-warm-200 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Acción</th>
                <th className="px-6 py-4 font-semibold">Entidad</th>
                <th className="px-6 py-4 font-semibold">IP</th>
                <th className="px-6 py-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-8">Cargando auditoría...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="text-center p-8 text-red-500">Error al cargar la auditoría</td></tr>
              ) : logs.map((log: any) => (
                <Fragment key={log.id}>
                  <tr className="hover:bg-warm-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{nombreUsuario(log)}</td>
                    <td className="px-6 py-4 text-gray-700">{log.accion}</td>
                    <td className="px-6 py-4 text-gray-500">{log.entidad}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs font-mono">{log.ipAddress || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      {log.detalles && (
                        <button onClick={() => setExpandidoId(expandidoId === log.id ? null : log.id)} className="p-1 text-gray-400 hover:text-warm-700">
                          {expandidoId === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandidoId === log.id && log.detalles && (
                    <tr>
                      <td colSpan={6} className="px-6 py-3 bg-warm-50/50">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all font-mono">{log.detalles}</pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && logs.length === 0 && (
          <div className="p-12 text-center text-gray-500">Todavía no hay actividad registrada.</div>
        )}
      </div>
    </div>
  );
};
