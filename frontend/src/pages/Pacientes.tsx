import { useState } from 'react';
import { Search, FileText, UserPlus, FileEdit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePacientes } from '../hooks/usePacientes';
import toast from 'react-hot-toast';
import { promptSudo } from '../utils/sudoPrompt';

export const Pacientes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { pacientes, isLoading, error, createPaciente, updatePaciente, deletePaciente } = usePacientes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    dni: '', nombre: '', apellido: '', fechaNacimiento: '', 
    telefono: '', email: '', direccion: '', 
    coberturaMedica: '', numeroAfiliado: '', antecedentes: ''
  });

  const pacientesFiltrados = pacientes.filter((p: any) => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni.includes(searchTerm)
  );

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedPacienteId(null);
    setFormData({ dni: '', nombre: '', apellido: '', fechaNacimiento: '', telefono: '', email: '', direccion: '', coberturaMedica: '', numeroAfiliado: '', antecedentes: '' });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (paciente: any) => {
    setModalMode('edit');
    setSelectedPacienteId(paciente.id);
    setFormData({
      dni: paciente.dni || '', nombre: paciente.nombre || '', apellido: paciente.apellido || '', 
      fechaNacimiento: paciente.fechaNacimiento ? paciente.fechaNacimiento.split('T')[0] : '', 
      telefono: paciente.telefono || '', email: paciente.email || '', direccion: paciente.direccion || '', 
      coberturaMedica: paciente.coberturaMedica || '', numeroAfiliado: paciente.numeroAfiliado || '', 
      antecedentes: paciente.antecedentes || ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        ...formData,
        fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString() : null,
      };

      if (modalMode === 'create') {
        await createPaciente(payload);
      } else if (modalMode === 'edit' && selectedPacienteId) {
        await updatePaciente({ id: selectedPacienteId, ...payload });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar el paciente');
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre}? Esta acción borrará todas sus historias clínicas, turnos y pagos.`)) {
      try {
        await deletePaciente({ id });
        toast.success('Paciente eliminado exitosamente');
      } catch (err: any) {
        if (err.response?.data?.message === 'SUDO_REQUIRED' || err.response?.data?.message === 'SUDO_INVALID') {
          const pwd = await promptSudo(err.response.data.detail);
          if (pwd) {
            try {
              await deletePaciente({ id, sudoPassword: pwd });
              toast.success('Paciente eliminado por Sudo');
            } catch (error: any) {
              toast.error(error.response?.data?.detail || 'Contraseña incorrecta');
            }
          }
        } else {
          toast.error(err.response?.data?.message || 'Error al eliminar');
        }
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-warm-900">Directorio de Pacientes</h2>
          <p className="text-warm-600 mt-1">Gestiona los datos personales y coberturas médicas de tus pacientes.</p>
        </div>
        <button onClick={openCreateModal} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Nuevo Paciente
        </button>
      </div>

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
                      <div className="w-10 h-10 rounded-full bg-warm-200 text-warm-700 flex items-center justify-center font-bold font-serif uppercase">
                        {p.nombre[0]}{p.apellido[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{p.apellido}, {p.nombre}</p>
                        {p.coberturaMedica && <p className="text-xs text-brand-600 font-semibold">{p.coberturaMedica}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{p.dni}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                     {p.telefono && <div>{p.telefono}</div>}
                     {p.email && <div>{p.email}</div>}
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button onClick={() => navigate('/historias-clinicas', { state: { pacienteId: p.id } })} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Ver Historia Clínica">
                      <FileText className="w-5 h-5" />
                    </button>
                    <button onClick={() => openEditModal(p)} className="p-2 text-gray-400 hover:text-warm-600 hover:bg-warm-50 rounded-lg transition-colors" title="Editar Paciente">
                      <FileEdit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(p.id, `${p.nombre} ${p.apellido}`)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Paciente">
                      <Trash2 className="w-5 h-5" />
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-warm-50 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 font-serif">
                {modalMode === 'create' ? 'Registrar Nuevo Paciente' : 'Editar Ficha del Paciente'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">{errorMsg}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                    <input type="text" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido *</label>
                    <input type="text" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">DNI *</label>
                    <input type="text" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Nacimiento</label>
                    <input type="date" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.fechaNacimiento} onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                    <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                    <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
                  </div>
                </div>

                <div className="bg-warm-50 p-4 rounded-xl border border-warm-100 space-y-4">
                  <h4 className="font-bold text-warm-900 text-sm">Datos de Cobertura (Opcional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Obra Social / Prepaga</label>
                      <input type="text" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none" value={formData.coberturaMedica} onChange={e => setFormData({...formData, coberturaMedica: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nro de Afiliado</label>
                      <input type="text" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none" value={formData.numeroAfiliado} onChange={e => setFormData({...formData, numeroAfiliado: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Antecedentes Clínicos / Notas</label>
                  <textarea rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-brand-500" value={formData.antecedentes} onChange={e => setFormData({...formData, antecedentes: e.target.value})} />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-2 rounded-xl font-bold shadow-md transition-all">
                  {modalMode === 'create' ? 'Guardar Paciente' : 'Actualizar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
