import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import Dashboard from './pages/Dashboard';
import AddAssetPage from './pages/AddAssetPage';
import NomineeManagementPage from './pages/NomineeManagementPage';
import AdminLegalVerificationPage from './pages/AdminLegalVerificationPage';
import ControlledAccessReleasePage from './pages/ControlledAccessReleasePage';
import AccessReleaseSuccessPage from './pages/AccessReleaseSuccessPage';
import DeathVerificationRequestPage from './pages/DeathVerificationRequestPage';
import AdminDeathVerificationPage from './pages/AdminDeathVerificationPage';
import Navbar from './components/Navbar';
import { Toaster } from '@/components/ui/sonner';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'digital-legacy-locker');
  return (
    <footer className="bg-navy-900 text-navy-300 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-navy-400">© {year} Digital Legacy Locker. All rights reserved.</span>
        </div>
        <div className="text-sm text-navy-400">
          Built with{' '}
          <span className="text-red-400">♥</span>{' '}
          using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-navy-200 hover:text-white transition-colors font-medium"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegistrationPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

const addAssetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assets/add',
  component: AddAssetPage,
});

const nomineesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nominees',
  component: NomineeManagementPage,
});

const adminLegalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/legal-verification',
  component: AdminLegalVerificationPage,
});

const adminAccessReleaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/access-release',
  component: ControlledAccessReleasePage,
});

const accessReleaseSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/access-release/success',
  component: AccessReleaseSuccessPage,
});

const deathVerificationRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/death-verification-request',
  component: DeathVerificationRequestPage,
});

const adminDeathVerificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/death-verification',
  component: AdminDeathVerificationPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
  addAssetRoute,
  nomineesRoute,
  adminLegalRoute,
  adminAccessReleaseRoute,
  accessReleaseSuccessRoute,
  deathVerificationRequestRoute,
  adminDeathVerificationRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
