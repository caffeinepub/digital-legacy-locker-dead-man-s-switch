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
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminDocumentReviewPage from './pages/AdminDocumentReviewPage';
import Navbar from './components/Navbar';
import AdminRouteGuard from './components/AdminRouteGuard';
import { Toaster } from '@/components/ui/sonner';
import { Heart } from 'lucide-react';

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
  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'dead-mans-switch'
  );
  return (
    <footer className="border-t border-border/50 bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          © {year} Dead Man's Switch. All rights reserved.
        </div>
        <div className="text-sm text-muted-foreground">
          Secure Today. Protected Forever.
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          Built with{' '}
          <Heart className="h-3.5 w-3.5 text-destructive fill-destructive mx-0.5" />{' '}
          using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
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
  component: () => (
    <AdminRouteGuard>
      <AdminLegalVerificationPage />
    </AdminRouteGuard>
  ),
});

const adminAccessReleaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/access-release',
  component: () => (
    <AdminRouteGuard>
      <ControlledAccessReleasePage />
    </AdminRouteGuard>
  ),
});

const accessReleaseSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/access-release/success',
  component: () => (
    <AdminRouteGuard>
      <AccessReleaseSuccessPage />
    </AdminRouteGuard>
  ),
});

const deathVerificationRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/death-verification-request',
  component: DeathVerificationRequestPage,
});

const adminDeathVerificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/death-verification',
  component: () => (
    <AdminRouteGuard>
      <AdminDeathVerificationPage />
    </AdminRouteGuard>
  ),
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  component: () => (
    <AdminRouteGuard>
      <AdminDashboardPage />
    </AdminRouteGuard>
  ),
});

const adminDocumentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/documents',
  component: () => (
    <AdminRouteGuard>
      <AdminDocumentReviewPage />
    </AdminRouteGuard>
  ),
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
  adminDashboardRoute,
  adminDocumentsRoute,
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
