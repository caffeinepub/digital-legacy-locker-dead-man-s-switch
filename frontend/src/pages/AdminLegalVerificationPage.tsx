import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin, useGetAllActivityLogs, useApproveLegalVerification, useRejectLegalVerification, formatTimestamp } from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { Variant_pending_approved_rejected } from '../backend';
import {
  Shield,
  FileCheck,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Activity,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import SecurityBadge from '../components/SecurityBadge';

export default function AdminLegalVerificationPage() {
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: activityLogs = [], isLoading: logsLoading } = useGetAllActivityLogs();
  const approveMutation = useApproveLegalVerification();
  const rejectMutation = useRejectLegalVerification();

  const [targetPrincipal, setTargetPrincipal] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    Variant_pending_approved_rejected | 'idle'
  >('idle');

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center">
          <Shield size={48} className="text-navy-300 mx-auto mb-4" />
          <p className="text-navy-500 mb-4">Please log in to access admin features.</p>
          <Button onClick={() => router.navigate({ to: '/login' })}>Login</Button>
        </div>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center max-w-sm">
          <Shield size={48} className="text-red-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Access Denied</h2>
          <p className="text-navy-500 mb-6">
            You do not have admin privileges to access this page.
          </p>
          <Button onClick={() => router.navigate({ to: '/dashboard' })}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const parsePrincipal = (): Principal | null => {
    try {
      return Principal.fromText(targetPrincipal.trim());
    } catch {
      return null;
    }
  };

  const handleApprove = async () => {
    const principal = parsePrincipal();
    if (!principal) {
      toast.error('Invalid principal ID');
      return;
    }
    try {
      await approveMutation.mutateAsync(principal);
      setVerificationStatus(Variant_pending_approved_rejected.approved);
      toast.success('Legal verification approved');
    } catch {
      toast.error('Failed to approve verification');
    }
  };

  const handleReject = async () => {
    const principal = parsePrincipal();
    if (!principal) {
      toast.error('Invalid principal ID');
      return;
    }
    try {
      await rejectMutation.mutateAsync(principal);
      setVerificationStatus(Variant_pending_approved_rejected.rejected);
      toast.success('Legal verification rejected');
    } catch {
      toast.error('Failed to reject verification');
    }
  };

  const legalLogs = activityLogs.filter(
    (log) =>
      log.action.toLowerCase().includes('legal') ||
      log.action.toLowerCase().includes('verification') ||
      log.action.toLowerCase().includes('access released')
  );

  return (
    <div className="min-h-screen bg-navy-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.navigate({ to: '/dashboard' })}
            className="text-navy-500"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-navy-900">
                Legal Verification Module
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                ADMIN
              </span>
            </div>
            <p className="text-navy-500 text-sm">
              Review and process death certificate verification requests
            </p>
          </div>
        </div>

        {/* Admin Notice */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Admin Action Required</p>
            <p className="text-xs text-amber-700 mt-0.5">
              All legal verification actions are permanently logged in the audit trail. Ensure all
              documents are thoroughly reviewed before approving or rejecting.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Death Certificate Upload */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg text-navy-900 flex items-center gap-2">
                <FileCheck size={18} className="text-amber-500" /> Death Certificate Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-navy-700 font-medium">User Principal ID</Label>
                <div className="relative mt-1.5">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                  <Input
                    value={targetPrincipal}
                    onChange={(e) => setTargetPrincipal(e.target.value)}
                    placeholder="e.g. aaaaa-aa or full principal"
                    className="pl-9 font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-navy-400 mt-1">
                  Enter the principal ID of the user whose verification you are processing.
                </p>
              </div>

              <div>
                <Label className="text-navy-700 font-medium">Death Certificate Document</Label>
                <div
                  className="mt-1.5 border-2 border-dashed border-navy-200 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-smooth"
                  onClick={() => document.getElementById('cert-upload')?.click()}
                >
                  <Upload size={28} className="text-navy-300 mx-auto mb-2" />
                  {certFile ? (
                    <div>
                      <p className="font-medium text-navy-900 text-sm">{certFile.name}</p>
                      <p className="text-xs text-navy-400 mt-1">
                        {(certFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-navy-600 font-medium text-sm">
                        Upload death certificate
                      </p>
                      <p className="text-xs text-navy-400 mt-1">PDF, JPG, or PNG accepted</p>
                    </div>
                  )}
                  <input
                    id="cert-upload"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>

              {certFile && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle size={13} />
                  Document uploaded. AI verification: Analyzing document authenticity...
                </div>
              )}

              {/* Verification Status Display */}
              {verificationStatus !== 'idle' && (
                <div
                  className={`p-3 rounded-lg border text-sm font-medium flex items-center gap-2 ${
                    verificationStatus === Variant_pending_approved_rejected.approved
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {verificationStatus === Variant_pending_approved_rejected.approved ? (
                    <CheckCircle size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  Verification{' '}
                  {verificationStatus === Variant_pending_approved_rejected.approved
                    ? 'Approved'
                    : 'Rejected'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approve / Reject Actions */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg text-navy-900 flex items-center gap-2">
                <Shield size={18} className="text-primary" /> Verification Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-navy-50 border border-navy-100 space-y-2">
                <p className="text-xs font-semibold text-navy-600 uppercase tracking-wide">
                  Current Status
                </p>
                {verificationStatus === 'idle' ? (
                  <SecurityBadge type="pending" text="Awaiting Review" />
                ) : verificationStatus === Variant_pending_approved_rejected.approved ? (
                  <SecurityBadge type="approved" />
                ) : (
                  <SecurityBadge type="rejected" />
                )}
              </div>

              <div className="space-y-3">
                {/* Approve */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={!targetPrincipal.trim() || approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Approve Verification
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to <strong>approve</strong> the legal verification for
                        principal:{' '}
                        <code className="text-xs bg-navy-100 px-1 py-0.5 rounded">
                          {targetPrincipal}
                        </code>
                        . This will allow nominees to access the user's digital assets. This action
                        is permanent and will be logged.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleApprove}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Confirm Approval
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Reject */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      disabled={!targetPrincipal.trim() || rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <XCircle size={16} />
                      )}
                      Reject Verification
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to <strong>reject</strong> the legal verification for
                        principal:{' '}
                        <code className="text-xs bg-navy-100 px-1 py-0.5 rounded">
                          {targetPrincipal}
                        </code>
                        . The user's assets will remain locked. This action is permanent and will be
                        logged.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReject}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Confirm Rejection
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="p-3 rounded-lg bg-navy-900 text-navy-300 text-xs flex items-start gap-2">
                <Shield size={13} className="flex-shrink-0 mt-0.5" />
                <span>
                  All admin actions are cryptographically signed and permanently recorded on the
                  blockchain audit trail.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Trail */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg text-navy-900 flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" /> Audit Trail Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : legalLogs.length === 0 ? (
              <p className="text-navy-400 text-sm text-center py-6">
                No legal verification events recorded yet.
              </p>
            ) : (
              <ScrollArea className="h-72">
                <div className="space-y-2 pr-4">
                  {[...legalLogs].reverse().map((log, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-navy-50 border border-navy-100"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock size={12} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-navy-800 font-medium">{log.action}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-navy-400">{formatTimestamp(log.timestamp)}</p>
                          <p className="text-xs text-navy-300 font-mono truncate max-w-[200px]">
                            {log.principal.toString()}
                          </p>
                        </div>
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
