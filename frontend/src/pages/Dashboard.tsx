import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Shield,
  Lock,
  Users,
  FileCheck,
  Activity,
  Plus,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetCallerUserProfile,
  useGetAssets,
  useGetNominees,
  useGetLegalVerification,
  useGetCallerActivityLogs,
} from '../hooks/useQueries';
import { PersistentCategory, PersistentVerificationStatus, Variant_pending_approved_rejected } from '../backend';

const categoryLabels: Record<PersistentCategory, string> = {
  [PersistentCategory.banking]: 'Banking',
  [PersistentCategory.socialMedia]: 'Social Media',
  [PersistentCategory.crypto]: 'Crypto',
  [PersistentCategory.cloud]: 'Cloud',
  [PersistentCategory.other]: 'Other',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: assets, isLoading: assetsLoading } = useGetAssets();
  const { data: nominees, isLoading: nomineesLoading } = useGetNominees();
  const { data: legalVerification, isLoading: legalLoading } = useGetLegalVerification();
  const { data: activityLogs, isLoading: logsLoading } = useGetCallerActivityLogs();

  const verifiedNominees = nominees?.filter(
    (n) => n.verificationStatus === PersistentVerificationStatus.verified
  ).length ?? 0;

  const legalStatus = legalVerification?.status ?? null;

  const getLegalStatusBadge = () => {
    if (!legalStatus) return <Badge variant="outline">Not Initiated</Badge>;
    switch (legalStatus) {
      case Variant_pending_approved_rejected.approved:
        return <Badge className="bg-accent/20 text-accent border-accent/30">Approved</Badge>;
      case Variant_pending_approved_rejected.rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-gold border-gold/30">Pending</Badge>;
    }
  };

  const formatTimestamp = (ts: bigint) => {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              {profileLoading ? (
                <Skeleton className="h-7 w-48" />
              ) : (
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back, {userProfile?.name ?? 'User'}
                </h1>
              )}
              <p className="text-sm text-muted-foreground">Dead Man's Switch — Your Digital Legacy Vault</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">Assets</Badge>
              </div>
              {assetsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-foreground">{assets?.length ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Encrypted digital assets</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <Badge variant="outline" className="text-xs">Nominees</Badge>
              </div>
              {nomineesLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-foreground">{nominees?.length ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {verifiedNominees} verified
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10">
                  <FileCheck className="h-4 w-4 text-gold" />
                </div>
                <Badge variant="outline" className="text-xs">Legal</Badge>
              </div>
              {legalLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                getLegalStatusBadge()
              )}
              <p className="text-xs text-muted-foreground mt-1">Legal verification status</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <Badge variant="outline" className="text-xs">Activity</Badge>
              </div>
              {logsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-foreground">{activityLogs?.length ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Total actions logged</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assets Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg">Digital Assets</CardTitle>
                  <CardDescription>Your encrypted digital accounts and credentials</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate({ to: '/assets/add' })}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Asset
                </Button>
              </CardHeader>
              <CardContent>
                {assetsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : assets && assets.length > 0 ? (
                  <div className="space-y-2">
                    {assets.slice(0, 5).map((asset, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                            <Database className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{asset.platform}</p>
                            <p className="text-xs text-muted-foreground">{asset.username}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[asset.category]}
                        </Badge>
                      </div>
                    ))}
                    {assets.length > 5 && (
                      <button
                        onClick={() => navigate({ to: '/assets/add' })}
                        className="w-full text-center text-sm text-primary hover:underline py-2"
                      >
                        View all {assets.length} assets
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">No assets added yet</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate({ to: '/assets/add' })}
                    >
                      Add Your First Asset
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nominees Panel */}
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg">Nominees</CardTitle>
                  <CardDescription>Trusted individuals designated to receive your legacy</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate({ to: '/nominees' })}
                  className="gap-1.5"
                >
                  Manage
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                {nomineesLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : nominees && nominees.length > 0 ? (
                  <div className="space-y-2">
                    {nominees.map((nominee, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold text-sm">
                            {nominee.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{nominee.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {nominee.relationship.toString()}
                            </p>
                          </div>
                        </div>
                        {nominee.verificationStatus === PersistentVerificationStatus.verified ? (
                          <CheckCircle className="h-4 w-4 text-accent" />
                        ) : nominee.verificationStatus === PersistentVerificationStatus.rejected ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Clock className="h-4 w-4 text-gold" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">No nominees added yet</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate({ to: '/nominees' })}
                    >
                      Add a Nominee
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Legal Verification */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Legal Status</CardTitle>
                <CardDescription>Your legal verification progress</CardDescription>
              </CardHeader>
              <CardContent>
                {legalLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {getLegalStatusBadge()}
                    </div>
                    {legalVerification?.auditTrail && legalVerification.auditTrail.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Recent Activity</p>
                        {legalVerification.auditTrail.slice(-2).map((entry, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground bg-secondary/50 rounded p-2">
                            {entry}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Your latest actions on Dead Man's Switch</CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : activityLogs && activityLogs.length > 0 ? (
                  <div className="space-y-2">
                    {[...activityLogs].reverse().slice(0, 5).map((log, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-secondary/50">
                        <p className="text-xs text-foreground">{log.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTimestamp(log.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No activity yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
