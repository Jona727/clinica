import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Pacientes } from './pages/Pacientes';
import { HistoriasClinicas } from './pages/HistoriasClinicas';
import { Pagos } from './pages/Pagos';
import { Turnos } from './pages/Turnos';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/turnos" element={<Turnos />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/historias-clinicas" element={<HistoriasClinicas />} />
        <Route path="/pagos" element={<Pagos />} />
        {/* Futuras rutas irán aquí */}
      </Route>
    </Routes>
  );
}

export default App;
