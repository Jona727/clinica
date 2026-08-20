import { useState } from 'react';
import { Search, Lock, Edit3, Calendar } from 'lucide-react';
import { usePacientes } from '../hooks/usePacientes';
import { useHistoriasClinicas } from '../hooks/useHistoriasClinicas';

export const HistoriasClinicas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { pacientes, isLoading: isLoadingPacientes } = usePacientes();
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | undefined>(undefined);
  
  const { evoluciones, isLoading: isLoadingEvoluciones } = useHistoriasClinicas(selectedPacienteId);

  const pacientesFiltrados = pacientes?.filter((p: any) => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const selectedPaciente = pacientes?.find((p: any) => p.id === selectedPacienteId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-serif font-bold text-warm-900">Historias Clínicas</h2>
          <p className="text-warm-600 mt-1">Gestión confidencial de notas y evoluciones de pacientes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Columna Izquierda: Buscador de Pacientes */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-warm-200 flex flex-col min-h-0">
          <div className="p-4 border-b border-warm-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border-gray-200 rounded-lg text-sm focus:ring-warm-500 focus:border-warm-500"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {isLoadingPacientes ? (
              <p className="text-center p-4 text-gray-500 text-sm">Cargando pacientes...</p>
            ) : pacientesFiltrados.map((p: any) => (
              <button 
                key={p.id}
                onClick={() => setSelectedPacienteId(p.id)}
                className={`w-full text-left p-3 rounded-xl transition-colors focus:outline-none flex justify-between items-center ${selectedPacienteId === p.id ? 'bg-warm-100 border border-warm-200' : 'hover:bg-warm-50 border border-transparent'}`}
              >
                <div>
                  <p className="font-bold text-gray-900">{p.apellido}, {p.nombre}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    DNI: {p.dni}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Columna Derecha: Evoluciones del Paciente Seleccionado */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-warm-200 flex flex-col min-h-0">
          {selectedPaciente ? (
            <>
              <div className="p-6 border-b border-warm-100 flex justify-between items-center shrink-0">
                 <div>
                   <h3 className="text-xl font-bold text-gray-900">{selectedPaciente.apellido}, {selectedPaciente.nombre}</h3>
                   <p className="text-sm text-gray-500">DNI: {selectedPaciente.dni}</p>
                 </div>
                 <button className="bg-warm-600 hover:bg-warm-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 text-sm">
                   <Edit3 className="w-4 h-4" /> Nueva Evolución
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                 {isLoadingEvoluciones ? (
                    <p className="text-center text-gray-500 mt-10">Cargando historia clínica...</p>
                 ) : evoluciones.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">No hay evoluciones registradas para este paciente.</p>
                 ) : (
                   <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-warm-200 before:to-transparent">
                      {evoluciones.map((ev: any) => (
                        <div key={ev.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-warm-200 text-warm-700 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white border border-warm-100 shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <time className="text-xs font-semibold text-warm-500">{new Date(ev.fecha).toLocaleString()}</time>
                              {ev.estaFirmada && <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Firmada</span>}
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">{ev.motivo || 'Sesión'}</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{ev.notaEvolucion}</p>
                            {ev.diagnosticoIds && ev.diagnosticoIds.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-500">Diagnósticos adjuntos</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Selecciona un paciente a la izquierda para ver su historia clínica.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
