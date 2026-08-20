import { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { useTurnos } from '../hooks/useTurnos';

export const Turnos = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentView, setCurrentView] = useState('timeGridWeek');
  
  const { turnos, isLoading } = useTurnos();

  // Mapear el backend al formato de FullCalendar
  const turnosEventos = turnos?.map((t: any) => ({
    id: t.id,
    title: `Turno de ${t.duracionMinutos} min`, // Deberíamos hacer un join con paciente si backend no lo manda anidado
    start: new Date(t.fechaHoraInicio),
    end: new Date(new Date(t.fechaHoraInicio).getTime() + t.duracionMinutos * 60000),
    backgroundColor: t.estado === 'COMPLETADO' ? '#408f90' : '#b78564',
    borderColor: 'transparent',
  })) || [];

  const changeView = (view: string) => {
    setCurrentView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();
  const handleToday = () => calendarRef.current?.getApi().today();

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      
      {/* Custom Header Superior */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 shrink-0 gap-4">
        <div>
           <h2 className="text-3xl font-serif font-bold text-warm-900">Mi Agenda</h2>
           <p className="text-warm-500 text-sm mt-1">Información organizada para insights precisos</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-1.5 rounded-full shadow-sm border border-warm-100">
          <button onClick={() => changeView('timeGridDay')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${currentView === 'timeGridDay' ? 'bg-warm-900 text-white shadow-md' : 'text-warm-600 hover:bg-warm-50'}`}>Diario</button>
          <button onClick={() => changeView('timeGridWeek')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${currentView === 'timeGridWeek' ? 'bg-warm-900 text-white shadow-md' : 'text-warm-600 hover:bg-warm-50'}`}>Semanal</button>
          <button onClick={() => changeView('dayGridMonth')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${currentView === 'dayGridMonth' ? 'bg-warm-900 text-white shadow-md' : 'text-warm-600 hover:bg-warm-50'}`}>Mensual</button>
        </div>

        <button className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-full font-bold shadow-md transition-all flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Nuevo Turno
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Columna Izquierda: Mini Calendario y Filtros */}
        <div className="xl:col-span-1 space-y-6 flex flex-col">
           {/* Widget de Mini Calendario (Placeholder decorativo estilo al mockup) */}
           <div className="bg-warm-800 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-warm-600 rounded-full mix-blend-overlay filter blur-2xl opacity-50"></div>
             <div className="flex justify-between items-center mb-4 relative z-10">
                <span className="font-bold text-lg">Octubre 2023</span>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-warm-700 rounded-full"><ChevronLeft className="w-4 h-4"/></button>
                  <button className="p-1 hover:bg-warm-700 rounded-full"><ChevronRight className="w-4 h-4"/></button>
                </div>
             </div>
             {/* Grilla visual decorativa */}
             <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-warm-200 mb-2 relative z-10">
               <div>Do</div><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div>
             </div>
             <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold relative z-10">
                <div className="p-1 text-warm-500">29</div><div className="p-1 text-warm-500">30</div>
                <div className="p-1">1</div><div className="p-1">2</div><div className="p-1">3</div>
                <div className="p-1 bg-brand-400 text-white rounded-full shadow-sm">4</div><div className="p-1">5</div>
                <div className="p-1">6</div><div className="p-1">7</div><div className="p-1">8</div><div className="p-1">9</div>
                <div className="p-1">10</div><div className="p-1">11</div><div className="p-1">12</div>
             </div>
           </div>

           {/* Filtros de Calendarios */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-warm-100 flex-1">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Mis Agendas</h3>
             </div>
             <ul className="space-y-3">
               <li className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer group">
                  <CheckCircle2 className="w-5 h-5 text-warm-500" /> Presencial (Consultorio)
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer group">
                  <CheckCircle2 className="w-5 h-5 text-brand-500" /> Online (Telemedicina)
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-gray-500 cursor-pointer group">
                  <Circle className="w-5 h-5 text-gray-300 group-hover:text-gray-400" /> Sobreturnos
               </li>
             </ul>
           </div>
        </div>

        {/* Columna Derecha: FullCalendar */}
        <div className="xl:col-span-3 bg-white rounded-3xl shadow-sm border border-warm-100 p-6 flex-1 flex flex-col min-h-0 custom-calendar-theme">
           
           {/* Custom header para el calendario principal */}
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-4">
                 Semana Actual
                 <button onClick={handleToday} className="text-xs px-3 py-1 bg-warm-100 text-warm-700 rounded-full hover:bg-warm-200">Hoy</button>
              </h3>
              <div className="flex gap-2">
                 <button onClick={handlePrev} className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100"><ChevronLeft className="w-5 h-5"/></button>
                 <button onClick={handleNext} className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100"><ChevronRight className="w-5 h-5"/></button>
              </div>
           </div>

           <div className="flex-1 min-h-0 relative">
             <FullCalendar
                ref={calendarRef}
                plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
                initialView={currentView}
                headerToolbar={false} /* Escondemos el toolbar nativo */
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                events={turnosEventos}
                height="100%"
                expandRows={true}
                dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
                slotLabelFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
              />
           </div>
        </div>

      </div>

    </div>
  );
};
