import { useState } from 'react';
import { Search, FileText, UserPlus, FileEdit } from 'lucide-react';
import { usePacientes } from '../hooks/usePacientes';

export const Pacientes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { pacientes, isLoading, error } = usePacientes();

  const pacientesFiltrados = pacientes.filter((p: any) => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-warm-900">Directorio de Pacientes</h2>
          <p className="text-warm-600 mt-1">Gestiona los datos personales y coberturas médicas de tus pacientes.</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Nuevo Paciente
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-warm-200 flex items-center gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-brand-500 focus:border-brand-500 transition-colors"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Pacientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-warm-50 text-warm-800 border-b border-warm-200 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Paciente</th>
                <th className="px-6 py-4 font-semibold">DNI</th>
                <th className="px-6 py-4 font-semibold">Contacto</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center p-8">Cargando pacientes...</td></tr>
              ) : error ? (
                <tr><td colSpan={4} className="text-center p-8 text-red-500">Error al cargar pacientes</td></tr>
              ) : pacientesFiltrados.map((p: any) => (
                <tr key={p.id} className="hover:bg-warm-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warm-200 text-warm-700 flex items-center justify-center font-bold font-serif">
                        {p.nombre[0]}{p.apellido[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{p.apellido}, {p.nombre}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{p.dni}</td>
                  <td className="px-6 py-4 text-gray-600">{p.telefono || p.email}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Ver Historia Clínica">
                      <FileText className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-warm-600 hover:bg-warm-50 rounded-lg transition-colors" title="Editar">
                      <FileEdit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && pacientesFiltrados.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No se encontraron pacientes.
          </div>
        )}
      </div>

    </div>
  );
};
