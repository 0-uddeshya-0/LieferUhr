import { Navigate, Outlet, Route, Routes, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, FileText, LogOut } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { isDemoMode } from './demo/config';
import { DemoBanner } from './demo/DemoBanner';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { DispatchPage } from './pages/DispatchPage';
import { NewLoadPage } from './pages/NewLoadPage';
import { LoadDetailPage } from './pages/LoadDetailPage';
import { FleetPage } from './pages/FleetPage';
import { CustomersPage } from './pages/CustomersPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { ImportPage } from './pages/ImportPage';
import { DriverPage } from './pages/DriverPage';
import { TrackPage } from './pages/TrackPage';
import { useI18n } from './i18n';
import { LanguageToggle } from './i18n/LanguageToggle';
import { BrandMark } from './components/BrandMark';

function ProtectedLayout() {
  const { isAuthenticated, isLoading, logout, organization } = useAuth();
  const location = useLocation();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neu-muted">
        {t('common.loading')}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen">
      {isDemoMode && <DemoBanner />}
      <header className="bg-neu-bg/85 backdrop-blur-md shadow-neu-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link to="/dispatch" className="flex items-center gap-2 shrink-0">
              <BrandMark />
              <span className="text-lg font-bold text-brand-900">FrachtRadar<span className="ml-1.5 text-xs font-medium text-neu-muted align-middle">von Lieferuhr</span></span>
            </Link>
            <nav className="flex items-center gap-1">
              <NavLink to="/dispatch" icon={<LayoutDashboard className="w-4 h-4" />}>
                {t('nav.dispatch')}
              </NavLink>
              <NavLink to="/fleet" icon={<Truck className="w-4 h-4" />}>
                {t('nav.fleet')}
              </NavLink>
              <NavLink to="/customers" icon={<Users className="w-4 h-4" />}>
                {t('nav.customers')}
              </NavLink>
              <NavLink to="/invoices" icon={<FileText className="w-4 h-4" />}>
                {t('nav.invoices')}
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {organization && (
              <span className="hidden md:block text-sm text-neu-muted truncate max-w-[180px]">
                {organization.name}
              </span>
            )}
            <LanguageToggle />
            {!isDemoMode && (
              <button
                type="button"
                onClick={() => logout().then(() => { window.location.href = '/login'; })}
                className="neu-btn flex items-center gap-2 text-sm text-neu-muted hover:text-neu-text px-3 py-1.5 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                {t('nav.logout')}
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        active ? 'neu-pressed text-brand-700' : 'text-neu-muted hover:text-neu-text hover:bg-neu-sunken/60'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/t/:token" element={<DriverPage />} />
      <Route path="/l/:token" element={<TrackPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dispatch" element={<DispatchPage />} />
        <Route path="/loads/new" element={<NewLoadPage />} />
        <Route path="/loads/:id" element={<LoadDetailPage />} />
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/import" element={<ImportPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
