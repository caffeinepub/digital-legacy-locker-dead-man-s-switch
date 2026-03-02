import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  FileCheck,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Search,
  Shield,
  ScrollText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  useGetLegalVerificationForUser,
  useApproveLegalVerification,
  useRejectLegalVerification,
} from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { Variant_pending_approved_rejected } from '../backend';

export default function AdminLegalVerificationPage() {
  const navigate = useNavigate();
  const [principalInput, setPrincipalInput] = useState('');
  const [searchedPrincipal, setSearchedPrincipal] = useState('');

  const { data: legalVerification, isLoading, refetch } = useGetLegalVerificationForUser(
    searchedPrincipal ? Principal.fromText(searchedPrincipal) : null
  );

  const approveMutation = useApproveLegalVerification();
  const rejectMutation = useRejectLegalVerification();

  const handleSearch = () => {
    if (!principalInput.trim()) return;
    try {
      Principal.fromText(principalInput.trim());
      setSearchedPrincipal(principalInput.trim());
    } catch {
      alert('Invalid principal ID format.');
    }
  };

  const handleApprove = async () => {
    if (!searchedPrincipal) return;
    await approveMutation.mutateAsync(Principal.fromText(searchedPrincipal));
    refetch();
  };

  const handleReject = async () => {
    if (!searchedPrincipal) return;
    await rejectMutation.mutateAsync(Principal.fromText(searchedPrincipal));
    refetch();
  };

  const getStatusBadge = (status: Variant_pending_approved_rejected) => {
    switch (status) {
      case Variant_pending_approved_rejected.approved:
        return <Badge className="bg-accent/20 text-accent border-accent/30">Approved</Badge>;
      case Variant_pending_approved_rejected.rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-gold border-gold/30">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/dashboard' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Legal Verification</h1>
            <p className="text-sm text-muted-foreground">
              Admin — Dead Man's Switch legal verification management
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Look Up User
            </CardTitle>
            <CardDescription>Enter a user's principal ID to view their legal verification status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="principalId">Principal ID</Label>
                <Input
                  id="principalId"
                  placeholder="e.g., aaaaa-aa or full principal ID"
                  value={principalInput}
                  onChange={(e) => setPrincipalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-[#1a2230] text-white placeholder:text-gray-400 caret-white font-mono text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} className="gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {searchedPrincipal && (
          <div className="space-y-6">
            {isLoading ? (
              <Card className="glass-card">
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : legalVerification ? (
              <>
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-primary" />
                        Verification Status
                      </CardTitle>
                      {getStatusBadge(legalVerification.status)}
                    </div>
                    <CardDescription className="font-mono text-xs break-all">
                      User: {searchedPrincipal}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="gap-2 flex-1"
                            disabled={
                              approveMutation.isPending ||
                              legalVerification.status === Variant_pending_approved_rejected.approved
                            }
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Approve
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approve Legal Verification?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will approve the legal verification for this user and allow
                              controlled access release to proceed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleApprove}>Approve</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="gap-2 flex-1"
                            disabled={
                              rejectMutation.isPending ||
                              legalVerification.status === Variant_pending_approved_rejected.rejected
                            }
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Reject
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reject Legal Verification?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will reject the legal verification for this user.
                              They will need to resubmit their documents.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleReject}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Reject
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>

                {/* Audit Trail */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ScrollText className="h-5 w-5 text-primary" />
                      Audit Trail
                    </CardTitle>
                    <CardDescription>
                      {legalVerification.auditTrail.length} event{legalVerification.auditTrail.length !== 1 ? 's' : ''} recorded
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      {legalVerification.auditTrail.length > 0 ? (
                        <div className="space-y-2">
                          {legalVerification.auditTrail.map((entry, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/50">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                              <p className="text-xs text-muted-foreground">{entry}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-6">No audit events yet</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="glass-card">
                <CardContent className="text-center py-12">
                  <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No legal verification found for this user.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
