import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, FileText, CreditCard, LogOut } from 'lucide-react';

export const MainLayout = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-warm-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-warm-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-warm-100 text-center flex flex-col items-center">
          <h2 className="text-3xl font-serif font-bold text-brand-800 tracking-tight">EMUNÁ</h2>
          <p className="text-[10px] text-brand-600 mt-1 uppercase tracking-widest font-bold">Salud Integral</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-warm-700 hover:bg-warm-100 hover:text-warm-900 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link to="/turnos" className="flex items-center gap-3 px-4 py-3 text-warm-700 hover:bg-warm-100 hover:text-warm-900 rounded-xl transition-all">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Turnos</span>
          </Link>
          <Link to="/pacientes" className="flex items-center gap-3 px-4 py-3 text-warm-700 hover:bg-warm-100 hover:text-warm-900 rounded-xl transition-all">
            <Users className="w-5 h-5" />
            <span className="font-medium">Pacientes</span>
          </Link>
          <Link to="/historias-clinicas" className="flex items-center gap-3 px-4 py-3 text-warm-700 hover:bg-warm-100 hover:text-warm-900 rounded-xl transition-all">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Historias Clínicas</span>
          </Link>
          <Link to="/pagos" className="flex items-center gap-3 px-4 py-3 text-warm-700 hover:bg-warm-100 hover:text-warm-900 rounded-xl transition-all">
            <CreditCard className="w-5 h-5" />
            <span className="font-medium">Pagos y Caja</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-warm-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 w-full rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white px-8 py-4 border-b border-warm-200 flex justify-end shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warm-200 flex items-center justify-center text-warm-700 font-bold">
                 SC
              </div>
              <div>
                <p className="text-sm font-bold text-warm-900">Lic. Chajud Sheila</p>
                <p className="text-xs text-warm-500">Psicóloga</p>
              </div>
           </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
