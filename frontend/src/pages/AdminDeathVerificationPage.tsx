import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin, useGetDeathVerificationRequests, useUpdateDeathVerificationStatus, formatTimestamp } from '../hooks/useQueries';
import { PersistentDeathVerificationStatus, Variant_Approved_Rejected } from '../backend';
import {
  Shield,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

function getRelationshipLabel(rel: string): string {
  const map: Record<string, string> = {
    spouse: 'Spouse',
    child: 'Child',
    sibling: 'Sibling',
    legalRepresentative: 'Legal Representative',
    other: 'Other',
  };
  return map[rel] ?? rel;
}

export default function AdminDeathVerificationPage() {
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: requests = [], isLoading: requestsLoading, refetch } = useGetDeathVerificationRequests();
  const updateStatusMutation = useUpdateDeathVerificationStatus();

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

  const handleApprove = async (requestId: bigint) => {
    try {
      await updateStatusMutation.mutateAsync({ requestId, newStatus: Variant_Approved_Rejected.Approved });
      toast.success('Request approved successfully');
    } catch {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId: bigint) => {
    try {
      await updateStatusMutation.mutateAsync({ requestId, newStatus: Variant_Approved_Rejected.Rejected });
      toast.success('Request rejected');
    } catch {
      toast.error('Failed to reject request');
    }
  };

  const pendingCount = requests.filter(r => r.status === PersistentDeathVerificationStatus.PendingVerification).length;

  return (
    <div className="min-h-screen bg-navy-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-navy-900">
                Death Verification Requests
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                ADMIN
              </span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-navy-500 text-sm">
              Review and process heir verification requests for deceased users' digital vaults
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 text-navy-600"
          >
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>

        {/* Admin Notice */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Human Oversight Required</p>
            <p className="text-xs text-amber-700 mt-0.5">
              All approval and rejection actions are permanently logged. Carefully review all uploaded documents before taking action. No access is ever granted automatically — admin approval is mandatory.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Requests', value: requests.length, color: 'text-navy-900' },
            { label: 'Pending Review', value: pendingCount, color: 'text-amber-600' },
            { label: 'Processed', value: requests.length - pendingCount, color: 'text-emerald-600' },
          ].map((stat) => (
            <Card key={stat.label} className="shadow-card">
              <CardContent className="pt-5 pb-4 text-center">
                <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-navy-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Requests Table */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg text-navy-900 flex items-center gap-2">
              <FileText size={18} className="text-primary" /> Verification Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {requestsLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="py-16 text-center">
                <FileText size={40} className="text-navy-200 mx-auto mb-3" />
                <p className="text-navy-400 font-medium">No verification requests yet</p>
                <p className="text-navy-300 text-sm mt-1">Requests submitted by heirs will appear here</p>
              </div>
            ) : (
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-navy-50 hover:bg-navy-50">
                      <TableHead className="text-navy-600 font-semibold text-xs uppercase tracking-wide">ID</TableHead>
                      <TableHead className="text-navy-600 font-semibold text-xs uppercase tracking-wide">Deceased</TableHead>
                      <TableHead className="text-navy-600 font-semibold text-xs uppercase tracking-wide">Heir</TableHead>
                      <TableHead className="text-navy-600 font-semibold text-xs uppercase tracking-wide">Relationship</TableHead>
                      <TableHead className="text-navy-600 font-semibold text-xs uppercase tracking-wide">Status</TableHead>
                      <TableHead className="text-navy-600 font-semibold text-xs uppercase tracking-wide">Submitted</TableHead>
                      <TableHead className="text-navy-600 font-semibold text-xs uppercase tracking-wide text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => {
                      const isPending = req.status === PersistentDeathVerificationStatus.PendingVerification;
                      const isApproved = req.status === PersistentDeathVerificationStatus.Approved;
                      const isProcessing = updateStatusMutation.isPending;

                      return (
                        <TableRow key={req.requestId.toString()} className="hover:bg-navy-50/50">
                          <TableCell className="font-mono text-xs text-navy-500">
                            #{req.requestId.toString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-navy-900 text-sm">{req.deceasedFullName}</p>
                              <p className="text-xs text-navy-400">{req.deceasedEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-navy-800 font-medium">{req.heirFullName}</p>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-navy-600">
                              {getRelationshipLabel(req.relationshipToDeceased)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {isPending ? (
                              <SecurityBadge type="pending" text="Pending Verification" />
                            ) : isApproved ? (
                              <SecurityBadge type="approved" />
                            ) : (
                              <SecurityBadge type="rejected" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-navy-400">
                              <Clock size={11} />
                              {formatTimestamp(req.submittedAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                {/* Approve */}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs"
                                      disabled={isProcessing}
                                    >
                                      {isProcessing ? (
                                        <Loader2 size={12} className="animate-spin" />
                                      ) : (
                                        <CheckCircle size={12} />
                                      )}
                                      Approve
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        You are about to <strong>approve</strong> the death verification request for{' '}
                                        <strong>{req.deceasedFullName}</strong> submitted by heir{' '}
                                        <strong>{req.heirFullName}</strong>. This action is permanent and will be logged.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleApprove(req.requestId)}
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
                                      size="sm"
                                      variant="outline"
                                      className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 h-8 text-xs"
                                      disabled={isProcessing}
                                    >
                                      <XCircle size={12} />
                                      Reject
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        You are about to <strong>reject</strong> the death verification request for{' '}
                                        <strong>{req.deceasedFullName}</strong> submitted by heir{' '}
                                        <strong>{req.heirFullName}</strong>. This action is permanent and will be logged.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleReject(req.requestId)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Confirm Rejection
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            ) : (
                              <span className="text-xs text-navy-400 italic">Processed</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Security Note */}
        <div className="p-4 rounded-xl bg-navy-900 text-navy-300 text-xs flex items-start gap-2.5">
          <Shield size={14} className="flex-shrink-0 mt-0.5 text-navy-400" />
          <span>
            All admin actions are cryptographically signed and permanently recorded on the blockchain audit trail. No access is ever granted automatically — every release requires verified legal documents and explicit admin approval.
          </span>
        </div>
      </div>
    </div>
  );
}
