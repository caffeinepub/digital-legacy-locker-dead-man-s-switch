import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsAdmin } from '../hooks/useQueries';
import { Shield, Menu, X, Lock, LogOut, LayoutDashboard, Users, FileCheck, Key, FileText, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const router = useRouter();
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: isAdmin } = useIsAdmin();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    router.navigate({ to: '/' });
    setMobileOpen(false);
  };

  const handleLogin = () => {
    router.navigate({ to: '/login' });
    setMobileOpen(false);
  };

  const navLinks = [
    ...(isAuthenticated ? [
      { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={15} /> },
      { label: 'Assets', to: '/assets/add', icon: <Lock size={15} /> },
      { label: 'Nominees', to: '/nominees', icon: <Users size={15} /> },
    ] : [
      { label: 'Heir Verification', to: '/death-verification-request', icon: <FileText size={15} /> },
    ]),
    ...(isAdmin ? [
      { label: 'Legal Verification', to: '/admin/legal-verification', icon: <FileCheck size={15} /> },
      { label: 'Access Release', to: '/admin/access-release', icon: <Key size={15} /> },
      { label: 'Death Verifications', to: '/admin/death-verification', icon: <ClipboardCheck size={15} /> },
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-navy-900 border-b border-navy-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => router.navigate({ to: isAuthenticated ? '/dashboard' : '/' })}
            className="flex items-center gap-2.5 group"
          >
            <img
              src="/assets/generated/logo-icon.dim_128x128.png"
              alt="Digital Legacy Locker"
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-display font-bold text-white text-lg hidden sm:block">
              Legacy<span className="text-navy-300">Locker</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.to}
                onClick={() => router.navigate({ to: link.to })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-navy-200 hover:text-white hover:bg-navy-700 transition-smooth font-medium"
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </nav>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-navy-200 hover:text-white hover:bg-navy-700 gap-1.5"
              >
                <LogOut size={15} />
                Logout
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleLogin}
                disabled={loginStatus === 'logging-in'}
                className="bg-primary hover:bg-primary/90 text-white gap-1.5"
              >
                <Shield size={15} />
                {loginStatus === 'logging-in' ? 'Connecting...' : 'Login'}
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-navy-200 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-800 border-t border-navy-700 px-4 py-3 space-y-1 animate-fade-in">
          {navLinks.map((link) => (
            <button
              key={link.to}
              onClick={() => { router.navigate({ to: link.to }); setMobileOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm text-navy-200 hover:text-white hover:bg-navy-700 transition-smooth font-medium"
            >
              {link.icon}
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-navy-700">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm text-red-400 hover:bg-navy-700 transition-smooth font-medium"
              >
                <LogOut size={15} />
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm text-white bg-primary hover:bg-primary/90 transition-smooth font-medium"
              >
                <Shield size={15} />
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
