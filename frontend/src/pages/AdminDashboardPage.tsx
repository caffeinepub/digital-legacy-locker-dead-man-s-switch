import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useIsAdmin,
  useGetDeathVerificationRequests,
  useAdminDocuments,
} from '../hooks/useQueries';
import {
  Shield,
  ArrowRight,
  Loader2,
  FileText,
  UserCheck,
  FileCheck,
  Unlock,
  LayoutDashboard,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PersistentDeathVerificationStatus } from '../backend';

interface AdminNavCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  badgeColor?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: deathRequests = [], isLoading: deathLoading } = useGetDeathVerificationRequests();
  const { data: documents = [], isLoading: docsLoading } = useAdminDocuments();

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Please log in to access admin features.</p>
          <Button onClick={() => router.navigate({ to: '/login' })}>Login</Button>
        </div>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-sm">
          <Shield size={48} className="text-destructive/40 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You do not have admin privileges to access this page.
          </p>
          <Button onClick={() => router.navigate({ to: '/dashboard' })}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const pendingDeathRequests = deathRequests.filter(
    (r) => r.status === PersistentDeathVerificationStatus.PendingVerification
  ).length;

  const pendingDocuments = documents.filter(
    (d) => (d.status as unknown as string) === 'pending'
  ).length;

  const statsLoading = deathLoading || docsLoading;

  const navCards: AdminNavCard[] = [
    {
      title: 'Document Review',
      description:
        'Review and verify identity documents, death certificates, and relationship proofs submitted by users.',
      icon: <FileText size={24} className="text-primary" />,
      path: '/admin/documents',
      badge: pendingDocuments,
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    {
      title: 'Death Verification',
      description:
        'Process heir death verification requests and approve or reject access to digital vaults.',
      icon: <UserCheck size={24} className="text-primary" />,
      path: '/admin/death-verification',
      badge: pendingDeathRequests,
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    {
      title: 'Legal Verification',
      description:
        'Review and approve legal verification submissions including death certificates for users.',
      icon: <FileCheck size={24} className="text-primary" />,
      path: '/admin/legal-verification',
    },
    {
      title: 'Controlled Access Release',
      description:
        'Authorize and record controlled access release events for verified deceased users.',
      icon: <Unlock size={24} className="text-primary" />,
      path: '/admin/access-release',
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 flex-shrink-0">
            <LayoutDashboard size={22} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                ADMIN
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Centralized control panel for managing verifications, documents, and access releases.
            </p>
          </div>
        </div>

        {/* Admin Notice */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Admin Access Active</p>
            <p className="text-xs text-amber-700 mt-0.5">
              All actions performed here are cryptographically signed and permanently recorded on
              the blockchain audit trail. Exercise caution with all approval and rejection
              decisions.
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))
            ) : (
              <>
                <StatCard
                  label="Total Documents"
                  value={documents.length}
                  sub="submitted"
                  color="text-foreground"
                />
                <StatCard
                  label="Pending Documents"
                  value={pendingDocuments}
                  sub="awaiting review"
                  color="text-amber-600"
                />
                <StatCard
                  label="Death Requests"
                  value={deathRequests.length}
                  sub="total submitted"
                  color="text-foreground"
                />
                <StatCard
                  label="Pending Deaths"
                  value={pendingDeathRequests}
                  sub="awaiting review"
                  color="text-amber-600"
                />
              </>
            )}
          </div>
        </div>

        {/* Navigation Cards */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Admin Sections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {navCards.map((card) => (
              <button
                key={card.path}
                onClick={() => router.navigate({ to: card.path as any })}
                className="text-left group"
              >
                <Card className="h-full border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                        {card.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        {card.badge !== undefined && card.badge > 0 && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold border ${card.badgeColor}`}
                          >
                            {card.badge} pending
                          </span>
                        )}
                        <ArrowRight
                          size={16}
                          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </div>
                    <CardTitle className="font-display text-base text-foreground mt-2">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm leading-relaxed">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>

        {/* Security Footer */}
        <div className="p-4 rounded-xl bg-navy-900 text-navy-300 text-xs flex items-start gap-2.5">
          <Shield size={14} className="flex-shrink-0 mt-0.5 text-navy-400" />
          <span>
            All admin actions are cryptographically signed and permanently recorded on the
            blockchain audit trail. No access is ever granted automatically — every release
            requires verified legal documents and explicit admin approval.
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub: string;
  color: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-5 pb-4 text-center">
        <p className={`text-3xl font-display font-bold ${color}`}>{value}</p>
        <p className="text-xs font-semibold text-foreground mt-1">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
