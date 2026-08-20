import { useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [username, setUsername] = useState('psicologa');
  const [password, setPassword] = useState('123'); 
  const { login, isLoading, error: authError } = useAuth();
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ username, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header (Mismo color que Navbar) */}
        <div className="flex justify-center mb-8">
           <div className="flex items-center gap-2 text-brand-800">
             <Stethoscope className="w-10 h-10" />
             <h1 className="text-3xl font-bold font-serif">Clínica</h1>
           </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Bienvenido de vuelta</h2>
        <p className="text-gray-500 text-center mb-8">Ingresa tus credenciales para acceder al sistema.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de Usuario</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-gray-800"
              placeholder="Ej: psicologa"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-gray-800"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button disabled={isLoading} type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-brand-200 transition-all active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? 'Ingresando...' : 'Ingresar a mi cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};
