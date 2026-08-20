import { DollarSign, Receipt, CreditCard, Banknote, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Pagos = () => {
  const pagosMock = [
    { id: '1', fecha: '24 Oct 2023', paciente: 'Juan Pérez', metodo: 'Mercado Pago', montoTotal: 15000, copago: 5000, estado: 'PAGADO' },
    { id: '2', fecha: '24 Oct 2023', paciente: 'María González', metodo: 'Efectivo', montoTotal: 12000, copago: null, estado: 'PAGADO' },
    { id: '3', fecha: '23 Oct 2023', paciente: 'Carlos López', metodo: 'Transferencia', montoTotal: 15000, copago: 0, estado: 'PENDIENTE' },
  ];

  const MetodoIcon = ({ metodo }: { metodo: string }) => {
    switch(metodo) {
      case 'Efectivo': return <Banknote className="w-4 h-4 text-green-600" />;
      case 'Mercado Pago': return <DollarSign className="w-4 h-4 text-blue-500" />;
      default: return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-brand-900">Pagos y Caja</h2>
          <p className="text-gray-500 mt-1">Registra cobros y supervisa los ingresos diarios.</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all flex items-center gap-2">
          <Receipt className="w-5 h-5" /> Registrar Cobro
        </button>
      </div>

      {/* Resumen Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-semibold text-gray-500 mb-1">Ingresos de Hoy</p>
               <h3 className="text-3xl font-bold text-gray-900">$27,000</h3>
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
               <h3 className="text-3xl font-bold text-orange-500">$15,000</h3>
             </div>
             <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
               <ArrowDownRight className="w-6 h-6" />
             </div>
           </div>
        </div>
      </div>

      {/* Tabla de Pagos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">Últimos Movimientos</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b border-gray-200 text-sm">
                <th className="px-6 py-3 font-semibold">Fecha</th>
                <th className="px-6 py-3 font-semibold">Paciente</th>
                <th className="px-6 py-3 font-semibold">Método</th>
                <th className="px-6 py-3 font-semibold text-right">Monto Total</th>
                <th className="px-6 py-3 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagosMock.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 text-sm">{pago.fecha}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{pago.paciente}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MetodoIcon metodo={pago.metodo} />
                      {pago.metodo}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    ${pago.montoTotal.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${pago.estado === 'PAGADO' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {pago.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
