import React, { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Shield, Loader2, Lock } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';

interface AdminRouteGuardProps {
  children: ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  const isAuthenticated = !!identity;

  // Not authenticated — redirect to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 mb-2">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Authentication Required</h2>
          <p className="text-muted-foreground text-sm">
            You must be logged in to access this page.
          </p>
          <Button onClick={() => navigate({ to: '/login' })} className="w-full">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated but still checking admin status
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Authenticated but not an admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/30 mb-2">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground text-sm">
            You do not have administrator privileges to access this page.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/dashboard' })}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated admin — render the protected content
  return <>{children}</>;
}
