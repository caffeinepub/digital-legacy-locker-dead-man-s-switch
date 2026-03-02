import React, { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Shield, Menu, X, Lock, ShieldCheck } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsAdmin } from '../hooks/useQueries';

type AppRoute =
  | '/'
  | '/login'
  | '/register'
  | '/dashboard'
  | '/assets/add'
  | '/nominees'
  | '/admin/dashboard'
  | '/admin/legal-verification'
  | '/admin/access-release'
  | '/admin/access-release/success'
  | '/admin/death-verification'
  | '/admin/documents'
  | '/death-verification-request';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  // Only show admin links when authenticated AND admin check is complete AND user is admin
  const showAdminLinks = isAuthenticated && !adminLoading && isAdmin === true;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const userNavLinks: { label: string; path: AppRoute }[] = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Assets', path: '/assets/add' },
    { label: 'Nominees', path: '/nominees' },
  ];

  const adminNavLinks: { label: string; path: AppRoute }[] = [
    { label: 'Document Review', path: '/admin/documents' },
    { label: 'Admin Dashboard', path: '/admin/dashboard' },
    { label: 'Legal Verification', path: '/admin/legal-verification' },
    { label: 'Access Release', path: '/admin/access-release' },
    { label: 'Death Verifications', path: '/admin/death-verification' },
  ];

  const guestNavLinks: { label: string; path: AppRoute }[] = [
    { label: 'Home', path: '/' },
    { label: 'Heir Verification', path: '/death-verification-request' },
  ];

  const navLinks: { label: string; path: AppRoute; isAdmin?: boolean }[] = isAuthenticated
    ? [
        ...userNavLinks,
        ...(showAdminLinks ? adminNavLinks.map(l => ({ ...l, isAdmin: true })) : []),
      ]
    : guestNavLinks;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: isAuthenticated ? '/dashboard' : '/' })}
            className="flex items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-colors">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-foreground tracking-tight">
                Dead Man's Switch
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wider">
                Secure Today. Protected Forever.
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate({ to: link.path })}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  link.isAdmin
                    ? isActive(link.path)
                      ? 'bg-amber-500/20 text-amber-600'
                      : 'text-amber-600/80 hover:text-amber-600 hover:bg-amber-500/10'
                    : isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Auth Button + Admin Badge */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && showAdminLinks && (
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                <Badge className="text-xs bg-amber-500/20 text-amber-600 border-amber-500/30 hover:bg-amber-500/30 px-2 py-0">
                  Admin
                </Badge>
              </div>
            )}
            {isAuthenticated && !showAdminLinks && !adminLoading && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3 text-accent" />
                <span>Secured</span>
              </div>
            )}
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
            >
              {isLoggingIn ? 'Connecting...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate({ to: link.path });
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  link.isAdmin
                    ? isActive(link.path)
                      ? 'bg-amber-500/20 text-amber-600'
                      : 'text-amber-600/80 hover:text-amber-600 hover:bg-amber-500/10'
                    : isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t border-border/50">
              {isAuthenticated && showAdminLinks && (
                <div className="flex items-center gap-1.5 px-3 py-1 mb-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                  <Badge className="text-xs bg-amber-500/20 text-amber-600 border-amber-500/30 px-2 py-0">
                    Admin
                  </Badge>
                </div>
              )}
              <Button
                onClick={() => {
                  handleAuth();
                  setMobileMenuOpen(false);
                }}
                disabled={isLoggingIn}
                variant={isAuthenticated ? 'outline' : 'default'}
                size="sm"
                className="w-full"
              >
                {isLoggingIn ? 'Connecting...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
