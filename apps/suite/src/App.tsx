import { Routes, Route, Navigate } from 'react-router-dom';
import { DemoRibbon } from './components/SuiteShell';
import SuiteHome from './pages/SuiteHome';
import DispatchPage from './pages/DispatchPage';
import ComplyPage from './pages/ComplyPage';
import HvacPage from './pages/HvacPage';
import DepotPage from './pages/DepotPage';

export default function App() {
  return (
    <div className="min-h-screen bg-neu-base font-sans text-ink antialiased">
      <DemoRibbon />
      <Routes>
        <Route path="/" element={<SuiteHome />} />
        <Route path="/dispatch" element={<DispatchPage />} />
        <Route path="/comply" element={<ComplyPage />} />
        <Route path="/hvac" element={<HvacPage />} />
        <Route path="/depot" element={<DepotPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
