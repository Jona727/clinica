import { useState, useRef, useEffect } from 'react';
import { Search, Lock, Unlock, Edit3, FileDown, X, Paperclip, FileImage, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { usePacientes } from '../hooks/usePacientes';
import { useHistoriasClinicas } from '../hooks/useHistoriasClinicas';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';

export const HistoriasClinicas = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const { pacientes, isLoading: isLoadingPacientes } = usePacientes();
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | undefined>(undefined);
  
  const { evoluciones, isLoading: isLoadingEvoluciones, createEvolucion, firmarEvolucion, isCreating } = useHistoriasClinicas(selectedPacienteId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    motivoConsulta: '', notaClinica: '', diagnostico: '', planTratamiento: '', esConfidencial: true, turnoId: ''
  });
  
  useEffect(() => {
    if (location.state && pacientes?.length) {
      if (location.state.pacienteId) {
        setSelectedPacienteId(location.state.pacienteId);
      }
      if (location.state.openNew) {
        setIsModalOpen(true);
        if (location.state.motivoConsulta) {
          setFormData(prev => ({ ...prev, motivoConsulta: location.state.motivoConsulta }));
        }
        if (location.state.turnoId) {
          setFormData(prev => ({ ...prev, turnoId: location.state.turnoId }));
        }
      }
      // Limpiamos el state para que no se reabra al refrescar
      window.history.replaceState({}, document.title);
    }
  }, [location.state, pacientes]);
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pacientesFiltrados = pacientes?.filter((p: any) => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni.includes(searchTerm)
  ) || [];

  const selectedPaciente = pacientes?.find((p: any) => p.id === selectedPacienteId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setArchivosAdjuntos(prev => [...prev, ...filesArray]);
    }
  };

  const removeArchivo = (index: number) => {
    setArchivosAdjuntos(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPacienteId) return;
    setErrorMsg('');
    try {
      const payload = new FormData();
      payload.append('pacienteId', selectedPacienteId);
      payload.append('motivoConsulta', formData.motivoConsulta);
      payload.append('notaClinica', formData.notaClinica);
      payload.append('diagnostico', formData.diagnostico);
      payload.append('planTratamiento', formData.planTratamiento);
      payload.append('esConfidencial', String(formData.esConfidencial));
      
      if (formData.turnoId) {
        payload.append('turnoId', formData.turnoId);
      }

      archivosAdjuntos.forEach(file => {
        payload.append('archivos', file);
      });

      await createEvolucion(payload);
      
      setIsModalOpen(false);
      setFormData({ motivoConsulta: '', notaClinica: '', diagnostico: '', planTratamiento: '', esConfidencial: true, turnoId: '' });
      setArchivosAdjuntos([]);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Error al guardar evolución');
    }
  };

  const handleFirmar = async (id: string) => {
    if (window.confirm("¿Estás seguro de firmar esta evolución? Una vez firmada será inmutable y no podrá ser modificada o eliminada.")) {
      try {
        await firmarEvolucion(id);
        toast.success('Evolución firmada correctamente');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Error al firmar');
      }
    }
  };

  const exportToPDF = () => {
    if (!selectedPaciente) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Historia Clínica', 14, 22);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Paciente: ${selectedPaciente.apellido}, ${selectedPaciente.nombre}`, 14, 32);
    doc.text(`DNI: ${selectedPaciente.dni}`, 14, 39);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 46);
    
    const tableData = evoluciones.map((ev: any) => [
      new Date(ev.fecha).toLocaleDateString(),
      ev.motivoConsulta || 'Sesión General',
      ev.notaClinica,
      ev.estaFirmada ? 'Firmada' : 'Abierta'
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['Fecha', 'Motivo', 'Evolución / Nota', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [64, 143, 144] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 2: { cellWidth: 90 } }
    });

    doc.save(`Historia_Clinica_${selectedPaciente.dni}.pdf`);
  };

  const getFullUrl = (path: string) => `http://localhost:3000${path}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-serif font-bold text-warm-900">Historias Clínicas</h2>
          <p className="text-warm-600 mt-1">Gestión confidencial de notas y evoluciones de pacientes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-warm-200 flex flex-col min-h-0">
          <div className="p-4 border-b border-warm-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input type="text" className="block w-full pl-10 pr-3 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-warm-500 outline-none transition-all" placeholder="Buscar por nombre o DNI..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {isLoadingPacientes ? (
              <p className="text-center p-4 text-gray-500 text-sm">Cargando pacientes...</p>
            ) : pacientesFiltrados.map((p: any) => (
              <button key={p.id} onClick={() => setSelectedPacienteId(p.id)} className={`w-full text-left p-4 rounded-xl transition-all focus:outline-none flex justify-between items-center ${selectedPacienteId === p.id ? 'bg-warm-100 border border-warm-200 shadow-sm' : 'hover:bg-warm-50 border border-transparent'}`}>
                <div>
                  <p className="font-bold text-gray-900">{p.apellido}, {p.nombre}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-mono">DNI: {p.dni}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-warm-200 flex flex-col min-h-0">
          {selectedPaciente ? (
            <>
              <div className="p-6 border-b border-warm-100 flex justify-between items-center shrink-0 bg-warm-50/50 rounded-t-2xl">
                 <div>
                   <h3 className="text-2xl font-bold text-gray-900 font-serif">{selectedPaciente.apellido}, {selectedPaciente.nombre}</h3>
                   <p className="text-sm text-gray-500 font-medium">DNI: {selectedPaciente.dni} {selectedPaciente.coberturaMedica ? `• ${selectedPaciente.coberturaMedica}` : ''}</p>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={exportToPDF} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2 text-sm">
                     <FileDown className="w-4 h-4" /> Exportar PDF
                   </button>
                   <button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2 text-sm">
                     <Edit3 className="w-4 h-4" /> Nueva Nota
                   </button>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                 {isLoadingEvoluciones ? (
                    <p className="text-center text-gray-500 mt-10">Cargando historia clínica...</p>
                 ) : evoluciones.length === 0 ? (
                    <div className="text-center text-gray-400 mt-20 space-y-3">
                       <Edit3 className="w-12 h-12 mx-auto text-gray-300" />
                       <p>No hay evoluciones registradas para este paciente.</p>
                    </div>
                 ) : (
                   <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-warm-200 before:to-transparent">
                      {evoluciones.map((ev: any) => (
                        <div key={ev.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${ev.estaFirmada ? 'bg-green-100 text-green-600' : 'bg-warm-200 text-warm-600'}`}>
                            {ev.estaFirmada ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </div>
                          <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-white border shadow-sm ${ev.estaFirmada ? 'border-green-100' : 'border-warm-100'}`}>
                            <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                              <div>
                                 <h4 className="font-bold text-gray-900">{ev.motivoConsulta || 'Consulta General'}</h4>
                                 <time className="text-xs font-semibold text-gray-400">{new Date(ev.fecha).toLocaleString()}</time>
                              </div>
                              {ev.estaFirmada ? (
                                <span className="text-[10px] uppercase font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-100">Sello Digital</span>
                              ) : (
                                <button onClick={() => handleFirmar(ev.id)} className="text-[10px] uppercase font-bold text-brand-600 hover:bg-brand-50 bg-white border border-brand-200 px-3 py-1 rounded-md transition-colors flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Firmar
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ev.notaClinica}</p>
                            
                            {(ev.diagnostico || ev.planTratamiento) && (
                              <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-1 gap-3">
                                {ev.diagnostico && (
                                  <div><span className="text-xs font-bold text-gray-500 uppercase">Diagnóstico:</span><p className="text-sm text-gray-800 mt-1">{ev.diagnostico}</p></div>
                                )}
                                {ev.planTratamiento && (
                                  <div><span className="text-xs font-bold text-gray-500 uppercase">Plan de Tratamiento:</span><p className="text-sm text-gray-800 mt-1">{ev.planTratamiento}</p></div>
                                )}
                              </div>
                            )}

                            {ev.adjuntos && ev.adjuntos.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-50">
                                <span className="text-xs font-bold text-gray-500 uppercase mb-2 block">Archivos Adjuntos:</span>
                                <div className="flex flex-wrap gap-2">
                                  {ev.adjuntos.map((url: string, i: number) => {
                                    const isPdf = url.toLowerCase().endsWith('.pdf');
                                    return (
                                      <a key={i} href={getFullUrl(url)} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-sm font-medium text-brand-700">
                                        {isPdf ? <FileText className="w-4 h-4 text-red-500" /> : <FileImage className="w-4 h-4 text-brand-500" />}
                                        {isPdf ? 'Documento PDF' : 'Imagen Adjunta'}
                                      </a>
                                    );
                                  })}
                                </div>
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
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
              <Lock className="w-12 h-12 mb-4 text-gray-300" />
              <p>Selecciona un paciente para acceder a su historia clínica confidencial.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-warm-50 shrink-0">
              <div>
                 <h3 className="text-xl font-bold text-gray-900 font-serif">Redactar Evolución Clínica</h3>
                 <p className="text-sm text-gray-500">Paciente: {selectedPaciente?.nombre} {selectedPaciente?.apellido}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-5">
                {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">{errorMsg}</div>}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo de Consulta</label>
                  <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.motivoConsulta} onChange={e => setFormData({...formData, motivoConsulta: e.target.value})} placeholder="Ej: Ansiedad, Control mensual..." />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nota Clínica (Evolución) *</label>
                  <textarea required rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none" value={formData.notaClinica} onChange={e => setFormData({...formData, notaClinica: e.target.value})} placeholder="Detalle de la sesión..." />
                </div>

                {/* Subida de Archivos */}
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 transition-colors hover:border-brand-400 relative">
                  <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" ref={fileInputRef} onChange={handleFileChange} />
                  <div className="flex flex-col items-center justify-center text-gray-500 pointer-events-none">
                    <Paperclip className="w-6 h-6 mb-2 text-brand-500" />
                    <p className="text-sm font-medium">Click o arrastra fotos/archivos aquí para adjuntar</p>
                    <p className="text-xs text-gray-400 mt-1">Soporta JPG, PNG, PDF (Máx 10MB)</p>
                  </div>
                </div>
                
                {archivosAdjuntos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {archivosAdjuntos.map((file, i) => (
                      <div key={i} className="bg-brand-50 border border-brand-100 text-brand-700 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium">
                        <span className="truncate max-w-[120px]">{file.name}</span>
                        <button type="button" onClick={() => removeArchivo(i)} className="text-brand-500 hover:text-brand-900"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnóstico (Opcional)</label>
                    <textarea rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none" value={formData.diagnostico} onChange={e => setFormData({...formData, diagnostico: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Plan de Tratamiento (Opcional)</label>
                    <textarea rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none" value={formData.planTratamiento} onChange={e => setFormData({...formData, planTratamiento: e.target.value})} />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-warm-50 p-4 rounded-xl border border-warm-100">
                  <input type="checkbox" id="confidencial" checked={formData.esConfidencial} onChange={e => setFormData({...formData, esConfidencial: e.target.checked})} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer" />
                  <label htmlFor="confidencial" className="text-sm font-semibold text-gray-700 cursor-pointer">Nota estrictamente confidencial (solo visible por mí)</label>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-all">Cancelar</button>
                <button type="submit" disabled={isCreating} className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-2 rounded-xl font-bold shadow-md transition-all disabled:opacity-50">
                  {isCreating ? 'Guardando...' : 'Guardar Evolución'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
