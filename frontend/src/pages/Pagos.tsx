import { useState } from 'react';
import { DollarSign, Receipt, CreditCard, Banknote, ArrowUpRight, ArrowDownRight, X, User } from 'lucide-react';
import { usePagos } from '../hooks/usePagos';
import { usePacientes } from '../hooks/usePacientes';
import { useTurnos } from '../hooks/useTurnos';
import toast from 'react-hot-toast';

export const Pagos = () => {
  const { pagos, isLoading, createPago, isCreating } = usePagos();
  const { pacientes } = usePacientes();
  const { turnos } = useTurnos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pacienteId: '',
    turnoId: '',
    montoTotal: '',
    metodoPago: 'EFECTIVO',
    observaciones: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Cálculos dinámicos
  const turnosPendientes = turnos?.filter((t: any) => 
    t.pacienteId === formData.pacienteId && !t.pago && new Date(t.fechaHoraInicio) <= new Date()
  ) || [];

  const hoy = new Date().setHours(0, 0, 0, 0);
  const ingresosHoy = pagos?.filter((p: any) => 
    new Date(p.createdAt).setHours(0, 0, 0, 0) === hoy && p.estado === 'PAGADO'
  ).reduce((acc: number, p: any) => acc + Number(p.montoTotal), 0) || 0;

  const pendienteCobro = pagos?.filter((p: any) => 
    p.estado === 'PENDIENTE'
  ).reduce((acc: number, p: any) => acc + Number(p.montoTotal), 0) || 0;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pacienteId || !formData.turnoId || !formData.montoTotal) {
      setErrorMsg('Debe seleccionar paciente, turno pendiente y monto.');
      return;
    }
    setErrorMsg('');
    try {
      await createPago({
        ...formData,
        montoTotal: Number(formData.montoTotal)
      });
      setIsModalOpen(false);
      setFormData({ pacienteId: '', turnoId: '', montoTotal: '', metodoPago: 'EFECTIVO', observaciones: '' });
      toast.success('Cobro registrado exitosamente');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al registrar cobro');
      toast.error(err.response?.data?.message || 'Error al registrar cobro');
    }
  };

  const MetodoIcon = ({ metodo }: { metodo: string }) => {
    switch(metodo) {
      case 'EFECTIVO': return <Banknote className="w-4 h-4 text-green-600" />;
      case 'MERCADO_PAGO': return <DollarSign className="w-4 h-4 text-blue-500" />;
      default: return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatMetodo = (m: string) => m.replace('_', ' ');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative h-full">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-serif font-bold text-brand-900">Pagos y Caja</h2>
          <p className="text-gray-500 mt-1">Registra cobros y supervisa los ingresos diarios.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all flex items-center gap-2">
          <Receipt className="w-5 h-5" /> Registrar Cobro
        </button>
      </div>

      {/* Resumen Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 shrink-0">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-semibold text-gray-500 mb-1">Ingresos de Hoy</p>
               <h3 className="text-3xl font-bold text-gray-900">${ingresosHoy.toLocaleString()}</h3>
             </div>
             <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
               <ArrowUpRight className="w-6 h-6" />
             </div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-semibold text-gray-500 mb-1">Pendiente de Cobro</p>
               <h3 className="text-3xl font-bold text-orange-500">${pendienteCobro.toLocaleString()}</h3>
             </div>
             <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
               <ArrowDownRight className="w-6 h-6" />
             </div>
           </div>
        </div>
      </div>

      {/* Tabla de Pagos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-700 shrink-0">Últimos Movimientos</div>
        <div className="overflow-auto flex-1 p-0">
          {isLoading ? (
             <p className="text-center p-10 text-gray-400">Cargando pagos...</p>
          ) : !pagos || pagos.length === 0 ? (
             <p className="text-center p-10 text-gray-400">No hay pagos registrados aún.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b border-gray-200 text-sm sticky top-0">
                  <th className="px-6 py-3 font-semibold">Fecha</th>
                  <th className="px-6 py-3 font-semibold">Paciente</th>
                  <th className="px-6 py-3 font-semibold">Método</th>
                  <th className="px-6 py-3 font-semibold text-right">Monto Total</th>
                  <th className="px-6 py-3 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagos.map((pago: any) => (
                  <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(pago.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{pago.paciente?.nombre} {pago.paciente?.apellido}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MetodoIcon metodo={pago.metodoPago} />
                        <span className="capitalize">{formatMetodo(pago.metodoPago).toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      ${Number(pago.montoTotal).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${pago.estado === 'PAGADO' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {pago.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-warm-50 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 font-serif">Registrar Cobro</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4">
                {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">{errorMsg}</div>}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><User className="w-4 h-4 text-brand-500"/> Paciente</label>
                  <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.pacienteId} onChange={e => setFormData({...formData, pacienteId: e.target.value, turnoId: ''})}>
                    <option value="">Seleccione un paciente...</option>
                    {pacientes?.map((p: any) => (<option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>))}
                  </select>
                </div>

                {formData.pacienteId && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Turno a Abonar</label>
                    <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.turnoId} onChange={e => setFormData({...formData, turnoId: e.target.value})}>
                      <option value="">Seleccione un turno pendiente...</option>
                      {turnosPendientes.map((t: any) => (
                        <option key={t.id} value={t.id}>{new Date(t.fechaHoraInicio).toLocaleString()} - {t.motivoConsulta || 'Consulta General'}</option>
                      ))}
                    </select>
                    {turnosPendientes.length === 0 && <p className="text-xs text-red-500 mt-2">El paciente no tiene turnos impagos que ya hayan ocurrido.</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monto Total ($)</label>
                  <input type="number" required min="0" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.montoTotal} onChange={e => setFormData({...formData, montoTotal: e.target.value})} placeholder="Ej: 15000" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Método de Pago</label>
                  <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.metodoPago} onChange={e => setFormData({...formData, metodoPago: e.target.value})}>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                    <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="MERCADO_PAGO">Mercado Pago</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
                  <textarea rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none" value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} placeholder="Detalles extra (opcional)..." />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-all">Cancelar</button>
                <button type="submit" disabled={isCreating} className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-2 rounded-xl font-bold shadow-md transition-all disabled:opacity-50">
                  {isCreating ? 'Guardando...' : 'Registrar Cobro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
