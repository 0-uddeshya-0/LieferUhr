import { Routes, Route, Navigate } from 'react-router-dom';
import { DemoRibbon } from './components/SuiteShell';
import { SideNav, TopBar } from './components/SuiteNav';
import SuiteHome from './pages/SuiteHome';
import DispatchPage from './pages/DispatchPage';
import ComplyPage from './pages/ComplyPage';
import HvacPage from './pages/HvacPage';
import DepotPage from './pages/DepotPage';

export default function App() {
  return (
    <div className="min-h-screen bg-neu-base font-sans text-ink antialiased">
      <DemoRibbon />
      <div className="flex">
        <SideNav />
        <div className="min-w-0 flex-1">
          <TopBar />
          <Routes>
            <Route path="/" element={<SuiteHome />} />
            <Route path="/frachtamt" element={<DispatchPage />} />
            <Route path="/pruefamt" element={<ComplyPage />} />
            <Route path="/postamt" element={<DepotPage />} />
            <Route path="/einsatzamt" element={<HvacPage />} />
            {/* Legacy slugs from the first suite build */}
            <Route path="/dispatch" element={<Navigate to="/frachtamt" replace />} />
            <Route path="/comply" element={<Navigate to="/pruefamt" replace />} />
            <Route path="/depot" element={<Navigate to="/postamt" replace />} />
            <Route path="/hvac" element={<Navigate to="/einsatzamt" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
