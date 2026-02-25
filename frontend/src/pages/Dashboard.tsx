import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetAssets,
  useGetNominees,
  useGetLegalVerification,
  useGetCallerActivityLogs,
  useGetCallerUserProfile,
  getCategoryLabel,
  formatTimestamp,
} from '../hooks/useQueries';
import { PersistentCategory, PersistentVerificationStatus, Variant_pending_approved_rejected } from '../backend';
import {
  Shield, Lock, Users, FileCheck, Activity, Plus, ArrowRight,
  ShieldCheck, AlertTriangle, Cpu, CheckCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import SecurityBadge from '../components/SecurityBadge';

export default function Dashboard() {
  const router = useRouter();
  const { identity } = useInternetIdentity();

  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: assets = [], isLoading: assetsLoading } = useGetAssets();
  const { data: nominees = [], isLoading: nomineesLoading } = useGetNominees();
  const { data: legalVerification, isLoading: legalLoading } = useGetLegalVerification();
  const { data: activityLogs = [], isLoading: logsLoading } = useGetCallerActivityLogs();

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center">
          <Shield size={48} className="text-navy-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Authentication Required</h2>
          <p className="text-navy-500 mb-6">Please log in to access your dashboard.</p>
          <Button onClick={() => router.navigate({ to: '/login' })}>Login</Button>
        </div>
      </div>
    );
  }

  // Category breakdown
  const categoryBreakdown = Object.values(PersistentCategory).map((cat) => ({
    category: cat,
    count: assets.filter((a) => a.category === cat).length,
  })).filter((c) => c.count > 0);

  const legalStatus = legalVerification?.status ?? null;

  const verifiedNominees = nominees.filter((n) => n.verificationStatus === PersistentVerificationStatus.verified).length;

  return (
    <div className="min-h-screen bg-navy-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy-900">
              {profileLoading ? 'Loading...' : `Welcome, ${profile?.name ?? 'User'}`}
            </h1>
            <p className="text-navy-500 mt-1">Your digital legacy is secure and protected.</p>
          </div>
          <div className="flex items-center gap-3">
            <SecurityBadge type="noAccess" />
            <SecurityBadge type="aes256" />
          </div>
        </div>

        {/* Security Status Bar */}
        <div className="bg-navy-900 rounded-2xl p-5 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-400" />
            <span className="text-white font-semibold text-sm">Security Status</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle size={13} /> Encryption Active
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle size={13} /> MFA Enabled
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle size={13} /> Blockchain Secured
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertTriangle size={13} /> No Access During Lifetime
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Digital Assets',
              value: assetsLoading ? '—' : assets.length,
              icon: <Lock size={20} className="text-primary" />,
              sub: `${categoryBreakdown.length} categories`,
              action: () => router.navigate({ to: '/assets/add' }),
            },
            {
              label: 'Nominees',
              value: nomineesLoading ? '—' : nominees.length,
              icon: <Users size={20} className="text-purple-500" />,
              sub: `${verifiedNominees} verified`,
              action: () => router.navigate({ to: '/nominees' }),
            },
            {
              label: 'Legal Status',
              value: legalLoading ? '—' : (legalStatus === Variant_pending_approved_rejected.approved ? 'Approved' : legalStatus === Variant_pending_approved_rejected.rejected ? 'Rejected' : legalStatus === Variant_pending_approved_rejected.pending ? 'Pending' : 'Not Filed'),
              icon: <FileCheck size={20} className="text-amber-500" />,
              sub: 'Verification status',
              action: undefined,
            },
            {
              label: 'Activity Logs',
              value: logsLoading ? '—' : activityLogs.length,
              icon: <Activity size={20} className="text-emerald-500" />,
              sub: 'Total events',
              action: undefined,
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className={`shadow-card hover:shadow-card-hover transition-smooth ${stat.action ? 'cursor-pointer' : ''}`}
              onClick={stat.action}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-navy-50 rounded-lg">{stat.icon}</div>
                  {stat.action && <ArrowRight size={16} className="text-navy-300" />}
                </div>
                <div className="text-2xl font-display font-bold text-navy-900">{stat.value}</div>
                <div className="text-sm font-medium text-navy-700 mt-0.5">{stat.label}</div>
                <div className="text-xs text-navy-400 mt-0.5">{stat.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Asset Overview */}
          <Card className="shadow-card lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="font-display text-lg text-navy-900 flex items-center gap-2">
                <Lock size={18} className="text-primary" /> Digital Assets
              </CardTitle>
              <Button size="sm" onClick={() => router.navigate({ to: '/assets/add' })} className="gap-1.5">
                <Plus size={14} /> Add Asset
              </Button>
            </CardHeader>
            <CardContent>
              {assetsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : assets.length === 0 ? (
                <div className="text-center py-10">
                  <Lock size={36} className="text-navy-200 mx-auto mb-3" />
                  <p className="text-navy-500 text-sm">No assets stored yet.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => router.navigate({ to: '/assets/add' })}>
                    Add Your First Asset
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {assets.slice(0, 5).map((asset, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-navy-50 hover:bg-navy-100 transition-smooth">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Lock size={14} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-navy-900 text-sm">{asset.platform}</p>
                          <p className="text-xs text-navy-400">{asset.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {getCategoryLabel(asset.category)}
                        </span>
                        <SecurityBadge type="aes256" />
                      </div>
                    </div>
                  ))}
                  {assets.length > 5 && (
                    <p className="text-xs text-navy-400 text-center pt-2">
                      +{assets.length - 5} more assets
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nominees & Legal */}
          <div className="space-y-4">
            {/* Nominees */}
            <Card className="shadow-card cursor-pointer hover:shadow-card-hover transition-smooth" onClick={() => router.navigate({ to: '/nominees' })}>
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base text-navy-900 flex items-center gap-2">
                  <Users size={16} className="text-purple-500" /> Nominees
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nomineesLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : nominees.length === 0 ? (
                  <p className="text-navy-400 text-sm">No nominees added.</p>
                ) : (
                  <div className="space-y-2">
                    {nominees.slice(0, 3).map((n, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-bold text-xs">{n.name.charAt(0)}</span>
                          </div>
                          <span className="text-sm text-navy-800 font-medium">{n.name}</span>
                        </div>
                        <SecurityBadge
                          type={
                            n.verificationStatus === PersistentVerificationStatus.verified
                              ? 'verified'
                              : n.verificationStatus === PersistentVerificationStatus.rejected
                              ? 'rejected'
                              : 'pending'
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legal Verification */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base text-navy-900 flex items-center gap-2">
                  <FileCheck size={16} className="text-amber-500" /> Legal Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {legalLoading ? (
                  <Skeleton className="h-8 w-full" />
                ) : (
                  <div className="space-y-2">
                    {legalStatus === Variant_pending_approved_rejected.approved ? (
                      <SecurityBadge type="approved" />
                    ) : legalStatus === Variant_pending_approved_rejected.rejected ? (
                      <SecurityBadge type="rejected" />
                    ) : legalStatus === Variant_pending_approved_rejected.pending ? (
                      <SecurityBadge type="pending" />
                    ) : (
                      <p className="text-navy-400 text-sm">No verification filed.</p>
                    )}
                    <p className="text-xs text-navy-400 mt-1">
                      Death certificate verification status
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Encryption Badge */}
            <div className="p-4 rounded-xl bg-navy-900 text-center">
              <Cpu size={20} className="text-navy-300 mx-auto mb-2" />
              <p className="text-white text-xs font-semibold">AES-256 Military-Grade</p>
              <p className="text-navy-400 text-xs mt-0.5">All data encrypted at rest</p>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg text-navy-900 flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : activityLogs.length === 0 ? (
              <p className="text-navy-400 text-sm text-center py-6">No activity recorded yet.</p>
            ) : (
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-4">
                  {[...activityLogs].reverse().slice(0, 10).map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-navy-50">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock size={11} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-navy-800">{log.action}</p>
                        <p className="text-xs text-navy-400 mt-0.5">{formatTimestamp(log.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
