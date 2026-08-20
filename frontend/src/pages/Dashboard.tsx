import { Calendar as CalendarIcon, Clock, Users, ArrowRight } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Section - Inspirado en Imagen 1 (Psicología) */}
      <div className="bg-warm-100 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-warm-200">
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-warm-900 leading-tight">
            Fuerte no es el que nunca se quiebra, fuerte es el que se quiebra, llora, se arma y sigue eligiendo vivir...
          </h1>
          
          <button className="bg-warm-700 hover:bg-warm-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all flex items-center gap-2 mt-4">
            Ver Agenda Completa <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-white shadow-xl overflow-hidden shrink-0 relative">
          <img src="/images/profesional.jpg" alt="Foto Profesional" className="w-full h-full object-cover" />
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-warm-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-warm-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-4 bg-warm-50 rounded-2xl text-warm-600">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">Total Pacientes Activos</h3>
            <p className="text-3xl font-serif font-bold text-warm-900">124</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-warm-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-4 bg-brand-50 rounded-2xl text-brand-600">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">Turnos Programados Hoy</h3>
            <p className="text-3xl font-serif font-bold text-brand-800">5</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-warm-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">Próximo Turno</h3>
            <p className="text-xl font-serif font-bold text-gray-800">15:00 hs</p>
            <p className="text-sm text-gray-500">María González</p>
          </div>
        </div>

      </div>
    </div>
  );
};
