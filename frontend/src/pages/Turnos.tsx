import { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, ChevronLeft, ChevronRight, X, Trash2, Clock, CalendarDays, User, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTurnos } from '../hooks/useTurnos';
import { usePacientes } from '../hooks/usePacientes';
import { promptSudo } from '../utils/sudoPrompt';

export const Turnos = () => {
  const navigate = useNavigate();
  const calendarRef = useRef<FullCalendar>(null);
  const [currentView, setCurrentView] = useState('timeGridWeek');
  
  const { turnos, isLoading, createTurno, updateTurno, deleteTurno, updateEstadoTurno } = useTurnos();
  const { pacientes } = usePacientes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');
  const [selectedTurnoId, setSelectedTurnoId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState<any>({
    pacienteId: '',
    profesionalId: '',
    fechaInicio: '',
    horaInicio: '',
    fechaFin: '',
    horaFin: '',
    motivoConsulta: '',
    esSobreturno: false,
    estado: 'PROGRAMADO',
    turnoId: '',
    evolucion: null
  });

  const turnosEventos = turnos?.map((t: any) => {
    let bgColor = '#b78564'; 
    if (t.estado === 'FINALIZADO') bgColor = '#408f90'; 
    if (t.estado === 'CANCELADO') bgColor = '#f87171';
    
    return {
      id: t.id,
      title: `${t.paciente?.nombre} ${t.paciente?.apellido}`,
      start: t.fechaHoraInicio,
      end: t.fechaHoraFin,
      backgroundColor: bgColor,
      borderColor: 'transparent',
      extendedProps: { ...t }
    };
  }) || [];

  const changeView = (view: string) => {
    setCurrentView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();
  const handleToday = () => calendarRef.current?.getApi().today();

  const handleDateClick = (arg: any) => {
    setModalMode('create');
    setErrorMsg('');
    const startDate = new Date(arg.date);
    const endDate = new Date(startDate.getTime() + 45 * 60000); 

    setFormData({
      pacienteId: '',
      profesionalId: '',
      fechaInicio: startDate.toISOString().split('T')[0],
      horaInicio: startDate.toTimeString().slice(0, 5),
      fechaFin: endDate.toISOString().split('T')[0],
      horaFin: endDate.toTimeString().slice(0, 5),
      motivoConsulta: '',
      esSobreturno: false,
      estado: 'PROGRAMADO',
      turnoId: '',
      evolucion: null
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: any) => {
    const turno = arg.event.extendedProps;
    setModalMode('view');
    setSelectedTurnoId(turno.id);
    setErrorMsg('');

    const startDate = new Date(turno.fechaHoraInicio);
    const endDate = new Date(turno.fechaHoraFin);

    setFormData({
      pacienteId: turno.pacienteId,
      profesionalId: turno.profesionalId,
      fechaInicio: startDate.toISOString().split('T')[0],
      horaInicio: startDate.toTimeString().slice(0, 5),
      fechaFin: endDate.toISOString().split('T')[0],
      horaFin: endDate.toTimeString().slice(0, 5),
      motivoConsulta: turno.motivoConsulta || '',
      esSobreturno: turno.esSobreturno,
      estado: turno.estado,
      turnoId: turno.id,
      evolucion: turno.evolucion
    });
    setIsModalOpen(true);
  };

  const handleEventDrop = async (arg: any) => {
    const turnoId = arg.event.id;
    const newStart = arg.event.start;
    const newEnd = arg.event.end || new Date(newStart.getTime() + 45 * 60000);
    try {
      await updateTurno({
        id: turnoId,
        fechaHoraInicio: newStart.toISOString(),
        fechaHoraFin: newEnd.toISOString()
      });
      toast.success('Turno reprogramado exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al reprogramar turno');
      arg.revert();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const startDate = new Date(`${formData.fechaInicio}T${formData.horaInicio}`);
      const endDate = new Date(startDate.getTime() + 60 * 60000); 

      const payload = {
        pacienteId: formData.pacienteId,
        profesionalId: formData.profesionalId,
        fechaHoraInicio: startDate.toISOString(),
        fechaHoraFin: endDate.toISOString(),
        esSobreturno: formData.esSobreturno,
        motivoConsulta: formData.motivoConsulta
      };

      if (modalMode === 'create') {
        await createTurno(payload);
        toast.success('Turno agendado exitosamente');
      } else if (modalMode === 'edit' && selectedTurnoId) {
        await updateTurno({ id: selectedTurnoId, ...payload });
        toast.success('Turno actualizado');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Error al guardar turno');
      toast.error(error.response?.data?.message || 'Error al guardar turno');
    }
  };

  const handleDelete = async () => {
    if (selectedTurnoId && window.confirm('¿Estás seguro de eliminar este turno?')) {
      try {
        await deleteTurno({ id: selectedTurnoId });
        setIsModalOpen(false);
        toast.success('Turno eliminado');
      } catch (error: any) {
        if (error.response?.data?.message === 'SUDO_REQUIRED' || error.response?.data?.message === 'SUDO_INVALID') {
          const pwd = await promptSudo(error.response.data.detail);
          if (pwd) {
            try {
              await deleteTurno({ id: selectedTurnoId, sudoPassword: pwd });
              setIsModalOpen(false);
              toast.success('Turno eliminado por Sudo');
            } catch (err: any) {
              toast.error(err.response?.data?.detail || 'Contraseña incorrecta');
            }
          }
        } else {
          toast.error('Error al eliminar turno');
        }
      }
    }
  };

  const handleEstadoChange = async (nuevoEstado: string) => {
    if (selectedTurnoId) {
      try {
        await updateEstadoTurno({ id: selectedTurnoId, estado: nuevoEstado });
        setIsModalOpen(false);
        toast.success('Estado actualizado a ' + nuevoEstado);
      } catch (error: any) {
        if (error.response?.data?.message === 'SUDO_REQUIRED' || error.response?.data?.message === 'SUDO_INVALID') {
          const pwd = window.prompt(`🔒 ACCIÓN CRÍTICA\n\n${error.response.data.detail}\n\nIngresa tu contraseña para autorizar:`);
          if (pwd) {
            try {
              await updateEstadoTurno({ id: selectedTurnoId, estado: nuevoEstado, sudoPassword: pwd });
              setIsModalOpen(false);
              toast.success('Estado actualizado a ' + nuevoEstado);
            } catch (err: any) {
              toast.error(err.response?.data?.detail || 'Contraseña incorrecta');
            }
          }
        } else {
          toast.error(error.response?.data?.message || 'Error al cambiar estado');
        }
      }
    }
  };

  const isTurnoFuturo = new Date(`${formData.fechaInicio}T${formData.horaInicio}`) > new Date();

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 shrink-0 gap-4">
        <div>
           <h2 className="text-3xl font-serif font-bold text-warm-900">Mi Agenda</h2>
           <p className="text-warm-500 text-sm mt-1">Gestión de turnos y pacientes</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-1.5 rounded-full shadow-sm border border-warm-100">
          <button onClick={() => changeView('timeGridDay')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${currentView === 'timeGridDay' ? 'bg-warm-900 text-white shadow-md' : 'text-warm-600 hover:bg-warm-50'}`}>Diario</button>
          <button onClick={() => changeView('timeGridWeek')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${currentView === 'timeGridWeek' ? 'bg-warm-900 text-white shadow-md' : 'text-warm-600 hover:bg-warm-50'}`}>Semanal</button>
          <button onClick={() => changeView('dayGridMonth')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${currentView === 'dayGridMonth' ? 'bg-warm-900 text-white shadow-md' : 'text-warm-600 hover:bg-warm-50'}`}>Mensual</button>
        </div>

        <button onClick={() => {
          setModalMode('create');
          setFormData({ pacienteId: '', profesionalId: '', fechaInicio: '', horaInicio: '', fechaFin: '', horaFin: '', estado: 'PROGRAMADO', esSobreturno: false, motivoConsulta: '', turnoId: '', evolucion: null });
          setIsModalOpen(true);
        }} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-full font-bold shadow-md transition-all flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Nuevo Turno
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex-1 min-h-0 overflow-hidden custom-calendar-wrapper">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-400">Cargando agenda...</div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={currentView}
            headerToolbar={false}
            events={turnosEventos}
            locale="es"
            editable={true}
            droppable={true}
            eventDrop={handleEventDrop}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            height="100%"
          />
        )}
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 max-h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-warm-50 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 font-serif">
                {modalMode === 'create' ? 'Nuevo Turno' : modalMode === 'edit' ? 'Editar Turno' : 'Detalles del Turno'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>

            <div className="overflow-y-auto p-6">
              {errorMsg && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">{errorMsg}</div>}
              
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><User className="w-4 h-4 text-brand-500"/> Paciente</label>
                    <select required disabled={modalMode === 'view'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.pacienteId} onChange={e => setFormData({...formData, pacienteId: e.target.value})}>
                      <option value="">Seleccione un paciente...</option>
                      {pacientes?.map((p: any) => (<option key={p.id} value={p.id}>{p.nombre} {p.apellido} - DNI: {p.dni}</option>))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-brand-500"/> Fecha</label>
                      <input type="date" required disabled={modalMode === 'view'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-brand-500"/> Hora</label>
                      <input type="time" required disabled={modalMode === 'view'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" value={formData.horaInicio} onChange={e => setFormData({...formData, horaInicio: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-warm-50 p-4 rounded-xl border border-warm-100">
                    <input type="checkbox" id="sobreturno" disabled={modalMode === 'view'} checked={formData.esSobreturno} onChange={e => setFormData({...formData, esSobreturno: e.target.checked})} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer" />
                    <label htmlFor="sobreturno" className="text-sm font-semibold text-gray-700 cursor-pointer">Permitir solapamiento (Es Sobreturno)</label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo de Consulta (Opcional)</label>
                    <textarea rows={2} disabled={modalMode === 'view'} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-brand-500" value={formData.motivoConsulta} onChange={e => setFormData({...formData, motivoConsulta: e.target.value})} />
                  </div>
                </div>

                {modalMode === 'view' && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Estado Actual: <span className="text-brand-600">{formData.estado}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {formData.estado !== 'FINALIZADO' && (
                        <button 
                          type="button" 
                          onClick={() => handleEstadoChange('FINALIZADO')} 
                          disabled={isTurnoFuturo}
                          title={isTurnoFuturo ? 'No se puede finalizar un turno futuro' : ''}
                          className="bg-[#408f90] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold flex-1"
                        >
                          Marcar Completado
                        </button>
                      )}
                      {formData.estado !== 'CANCELADO' && <button type="button" onClick={() => handleEstadoChange('CANCELADO')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex-1">Cancelar Turno</button>}
                    </div>
                    
                    {formData.estado === 'FINALIZADO' && !formData.evolucion && (
                      <button type="button" onClick={() => navigate('/historias-clinicas', { state: { pacienteId: formData.pacienteId, turnoId: formData.turnoId, openNew: true, motivoConsulta: formData.motivoConsulta } })} className="w-full mt-3 bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all">
                        <Edit3 className="w-4 h-4" /> Cargar Historia Clínica
                      </button>
                    )}
                    {formData.estado === 'FINALIZADO' && formData.evolucion && (
                      <div className="w-full mt-3 bg-gray-100 text-gray-500 px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border border-gray-200">
                        <Edit3 className="w-4 h-4" /> Historia Clínica ya cargada
                      </div>
                    )}

                    <div className="flex justify-between gap-4 mt-4">
                      <button type="button" onClick={handleDelete} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold text-sm"><Trash2 className="w-4 h-4" /> Eliminar</button>
                      <button type="button" onClick={() => setModalMode('edit')} className="bg-warm-100 hover:bg-warm-200 text-warm-800 px-6 py-2 rounded-lg font-bold text-sm">Editar Detalles</button>
                    </div>
                  </div>
                )}

                {modalMode !== 'view' && (
                  <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all">Cancelar</button>
                    <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-md shadow-brand-200 transition-all">
                      {modalMode === 'create' ? 'Crear Turno' : 'Guardar Cambios'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
