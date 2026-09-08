import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserPlus, FileEdit, Power, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUsuarios } from '../hooks/useUsuarios';
import { promptSudo } from '../utils/sudoPrompt';
import api from '../services/api';

const ROLES_LABEL: Record<string, string> = {
  ADMIN: 'Administrador/a',
  PROFESIONAL: 'Profesional',
  RECEPCION: 'Recepción',
};

const FORM_INICIAL = {
  username: '', password: '', email: '', rol: 'PROFESIONAL',
  nombre: '', apellido: '', especialidad: '', matricula: '',
  duracionTurnoMin: '45', porcentajeComision: '100', nuevaPassword: '',
};

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

type DiaHorario = { activo: boolean; horaInicio: string; horaFin: string };

const horariosVacios = (): DiaHorario[] =>
  Array.from({ length: 7 }, () => ({ activo: false, horaInicio: '09:00', horaFin: '18:00' }));

export const Usuarios = () => {
  const { usuarios, isLoading, error, createUsuario, updateUsuario, toggleEstadoUsuario } = useUsuarios();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedProfesionalId, setSelectedProfesionalId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [horarios, setHorarios] = useState<DiaHorario[]>(horariosVacios());
  const [isSavingHorarios, setIsSavingHorarios] = useState(false);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedId(null);
    setFormData(FORM_INICIAL);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (u: any) => {
    setModalMode('edit');
    setSelectedId(u.id);
    setSelectedProfesionalId(u.profesional?.id || null);
    setFormData({
      username: u.username, password: '', email: u.email || '', rol: u.rol,
      nombre: u.profesional?.nombre || u.nombre || '', apellido: u.profesional?.apellido || u.apellido || '',
      especialidad: u.profesional?.especialidad || '', matricula: u.profesional?.matricula || '',
      duracionTurnoMin: String(u.profesional?.duracionTurnoMin ?? 45),
      porcentajeComision: String(u.profesional?.porcentajeComision ?? 100),
      nuevaPassword: '',
    });

    const base = horariosVacios();
    (u.profesional?.disponibilidades || []).forEach((d: any) => {
      base[d.diaSemana] = { activo: true, horaInicio: d.horaInicio, horaFin: d.horaFin };
    });
    setHorarios(base);

    setErrorMsg('');
    setIsModalOpen(true);
  };

  const guardarHorarios = async () => {
    if (!selectedProfesionalId) return;
    setIsSavingHorarios(true);
    try {
      const disponibilidades = horarios
        .map((h, diaSemana) => ({ diaSemana, ...h }))
        .filter(h => h.activo)
        .map(({ diaSemana, horaInicio, horaFin }) => ({ diaSemana, horaInicio, horaFin }));

      await api.put(`/profesionales/${selectedProfesionalId}/disponibilidad`, { disponibilidades });
      toast.success('Horarios de atención actualizados');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar los horarios');
    } finally {
      setIsSavingHorarios(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (modalMode === 'create') {
        await createUsuario({
          username: formData.username, password: formData.password, email: formData.email || undefined,
          rol: formData.rol, nombre: formData.nombre, apellido: formData.apellido,
          especialidad: formData.especialidad, matricula: formData.matricula || undefined,
          duracionTurnoMin: formData.duracionTurnoMin, porcentajeComision: formData.porcentajeComision,
        });
        toast.success('Usuario creado exitosamente');
      } else if (selectedId) {
        await updateUsuario({
          id: selectedId, email: formData.email || undefined, nombre: formData.nombre, apellido: formData.apellido,
          especialidad: formData.especialidad, matricula: formData.matricula || undefined,
          duracionTurnoMin: formData.duracionTurnoMin, porcentajeComision: formData.porcentajeComision,
          nuevaPassword: formData.nuevaPassword || undefined,
        });
        toast.success('Usuario actualizado');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar el usuario');
    }
  };

  const handleToggleEstado = async (u: any) => {
    const accion = u.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Seguro que querés ${accion} a ${u.nombre || u.username}?`)) return;
    try {
      await toggleEstadoUsuario({ id: u.id });
      toast.success(`Usuario ${u.activo ? 'desactivado' : 'activado'}`);
    } catch (err: any) {
      if (err.response?.data?.message === 'SUDO_REQUIRED' || err.response?.data?.message === 'SUDO_INVALID') {
        const pwd = await promptSudo(err.response.data.detail);
        if (pwd) {
          try {
            await toggleEstadoUsuario({ id: u.id, sudoPassword: pwd });
            toast.success(`Usuario ${u.activo ? 'desactivado' : 'activado'}`);
          } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Contraseña incorrecta');
          }
        }
      } else {
        toast.error(err.response?.data?.message || `Error al ${accion} usuario`);
      }
    }
  };

  // Al editar, un ADMIN con perfil de profesional vinculado (caso típico: la
  // única profesional del centro también es la administradora) también debe
  // poder tocar sus datos profesionales y horarios, aunque su rol de usuario
  // no sea literalmente "PROFESIONAL".
  const mostrarDatosProfesional = formData.rol === 'PROFESIONAL' || (modalMode === 'edit' && !!selectedProfesionalId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-warm-900">Equipo del Centro</h2>
          <p className="text-warm-600 mt-1">Gestiona los profesionales y el personal de recepción con acceso al sistema.</p>
        </div>
        <button onClick={openCreateModal} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-warm-50 text-warm-800 border-b border-warm-200 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center p-8">Cargando equipo...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="text-center p-8 text-red-500">Error al cargar usuarios</td></tr>
              ) : usuarios.map((u: any) => (
                <tr key={u.id} className="hover:bg-warm-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{u.profesional?.nombre || u.nombre} {u.profesional?.apellido || u.apellido}</p>
                    {u.profesional?.especialidad && <p className="text-xs text-brand-600 font-semibold">{u.profesional.especialidad}</p>}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div>{u.username}</div>
                    {u.email && <div className="text-xs text-gray-400">{u.email}</div>}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{ROLES_LABEL[u.rol] || u.rol}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button onClick={() => openEditModal(u)} className="p-2 text-gray-400 hover:text-warm-600 hover:bg-warm-50 rounded-lg transition-colors" title="Editar Usuario">
                      <FileEdit className="w-5 h-5" />
                    </button>
                    {u.rol !== 'ADMIN' && (
                      <button onClick={() => handleToggleEstado(u)} className={`p-2 rounded-lg transition-colors ${u.activo ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`} title={u.activo ? 'Desactivar' : 'Activar'}>
                        <Power className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && usuarios.length === 0 && (
          <div className="p-12 text-center text-gray-500">No hay usuarios registrados.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-warm-50 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 font-serif">
                {modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">{errorMsg}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                    <input type="text" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido *</label>
                    <input type="text" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.apellido} onChange={e => setFormData({ ...formData, apellido: e.target.value })} />
                  </div>

                  {modalMode === 'create' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de Usuario *</label>
                        <input type="text" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña *</label>
                        <input type="password" required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Rol *</label>
                        <select required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.rol} onChange={e => setFormData({ ...formData, rol: e.target.value })}>
                          <option value="PROFESIONAL">Profesional</option>
                          <option value="RECEPCION">Recepción</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>

                  {modalMode === 'edit' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva Contraseña</label>
                      <input type="password" placeholder="Dejar en blanco para no cambiar" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" value={formData.nuevaPassword} onChange={e => setFormData({ ...formData, nuevaPassword: e.target.value })} />
                    </div>
                  )}
                </div>

                {mostrarDatosProfesional && (
                  <div className="bg-warm-50 p-4 rounded-xl border border-warm-100 space-y-4">
                    <h4 className="font-bold text-warm-900 text-sm">Datos Profesionales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Especialidad *</label>
                        <input type="text" required className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none" value={formData.especialidad} onChange={e => setFormData({ ...formData, especialidad: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Matrícula</label>
                        <input type="text" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none" value={formData.matricula} onChange={e => setFormData({ ...formData, matricula: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Duración del Turno (min)</label>
                        <input type="number" min={5} step={5} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none" value={formData.duracionTurnoMin} onChange={e => setFormData({ ...formData, duracionTurnoMin: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Comisión (%)</label>
                        <input type="number" min={0} max={100} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none" value={formData.porcentajeComision} onChange={e => setFormData({ ...formData, porcentajeComision: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {modalMode === 'edit' && mostrarDatosProfesional && selectedProfesionalId && (
                  <div className="bg-warm-50 p-4 rounded-xl border border-warm-100 space-y-3">
                    <h4 className="font-bold text-warm-900 text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Horarios de Atención</h4>
                    <p className="text-xs text-gray-500">Los turnos solo se van a poder agendar dentro de estos horarios (salvo que se marquen como sobreturno).</p>
                    <div className="space-y-2">
                      {DIAS_SEMANA.map((dia, i) => (
                        <div key={dia} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-200">
                          <label className="flex items-center gap-2 w-32 shrink-0 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={horarios[i].activo}
                              onChange={e => setHorarios(prev => prev.map((h, idx) => idx === i ? { ...h, activo: e.target.checked } : h))}
                              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                            />
                            <span className="text-sm font-semibold text-gray-700">{dia}</span>
                          </label>
                          {horarios[i].activo && (
                            <div className="flex items-center gap-2 text-sm">
                              <input type="time" value={horarios[i].horaInicio} onChange={e => setHorarios(prev => prev.map((h, idx) => idx === i ? { ...h, horaInicio: e.target.value } : h))} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                              <span className="text-gray-400">a</span>
                              <input type="time" value={horarios[i].horaFin} onChange={e => setHorarios(prev => prev.map((h, idx) => idx === i ? { ...h, horaFin: e.target.value } : h))} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={guardarHorarios} disabled={isSavingHorarios} className="w-full bg-warm-700 hover:bg-warm-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all">
                      {isSavingHorarios ? 'Guardando...' : 'Guardar Horarios'}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-2 rounded-xl font-bold shadow-md transition-all">
                  {modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
