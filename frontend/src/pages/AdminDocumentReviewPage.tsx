import React, { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin, useAdminDocuments, useVerifyDocument, formatTimestamp } from '../hooks/useQueries';
import { DocumentType } from '../backend';
import type { DocumentMetadata } from '../backend';
import {
  Shield,
  ArrowLeft,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Eye,
  X,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import SecurityBadge from '../components/SecurityBadge';
import { toast } from 'sonner';

function getDocTypeLabel(docType: DocumentType | string): string {
  const map: Record<string, string> = {
    idProof: 'ID Proof',
    deathCertificate: 'Death Certificate',
    relationshipProof: 'Relationship Proof',
  };
  return map[docType as string] ?? String(docType);
}

function getStatusBadgeType(status: string): 'pending' | 'verified' | 'rejected' {
  if (status === 'verified') return 'verified';
  if (status === 'rejected') return 'rejected';
  return 'pending';
}

function truncatePrincipal(p: string): string {
  if (p.length <= 16) return p;
  return `${p.slice(0, 8)}…${p.slice(-6)}`;
}

export default function AdminDocumentReviewPage() {
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: documents = [], isLoading: docsLoading, refetch } = useAdminDocuments();
  const verifyMutation = useVerifyDocument();

  const [selectedDoc, setSelectedDoc] = useState<DocumentMetadata | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const openDocumentDialog = (doc: DocumentMetadata) => {
    setSelectedDoc(doc);
    setAdminNote('');
    setDialogOpen(true);
  };

  const handleVerify = async (approve: boolean) => {
    if (!selectedDoc) return;
    try {
      await verifyMutation.mutateAsync({
        documentId: selectedDoc.id,
        approve,
        note: adminNote.trim() || null,
      });
      toast.success(approve ? 'Document approved successfully' : 'Document rejected');
      setDialogOpen(false);
      setSelectedDoc(null);
      setAdminNote('');
    } catch {
      toast.error('Failed to update document status');
    }
  };

  const pendingCount = documents.filter((d) => (d.status as unknown as string) === 'pending').length;
  const verifiedCount = documents.filter((d) => (d.status as unknown as string) === 'verified').length;
  const rejectedCount = documents.filter((d) => (d.status as unknown as string) === 'rejected').length;

  const isProcessing = verifyMutation.isPending;
  const selectedDocStatus = selectedDoc ? (selectedDoc.status as unknown as string) : '';
  const isPendingDoc = selectedDocStatus === 'pending';

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.navigate({ to: '/admin/dashboard' })}
            className="text-muted-foreground"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Document Review
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
            <p className="text-muted-foreground text-sm">
              Review and verify identity documents submitted by users
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5"
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
              All approval and rejection actions are permanently logged. Carefully review all uploaded documents before taking action.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Documents', value: documents.length, color: 'text-foreground' },
            { label: 'Pending Review', value: pendingCount, color: 'text-amber-600' },
            { label: 'Verified', value: verifiedCount, color: 'text-emerald-600' },
          ].map((stat) => (
            <Card key={stat.label} className="shadow-sm">
              <CardContent className="pt-5 pb-4 text-center">
                <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Documents Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg text-foreground flex items-center gap-2">
              <FileText size={18} className="text-primary" /> Submitted Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {docsLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="py-16 text-center">
                <FileText size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No documents submitted yet</p>
                <p className="text-muted-foreground/60 text-sm mt-1">
                  Documents submitted by users will appear here
                </p>
              </div>
            ) : (
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">ID</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">Submitter</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">Type</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">Submitted</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">Status</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">Admin Note</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-xs uppercase tracking-wide text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => {
                      const statusStr = doc.status as unknown as string;
                      const isPending = statusStr === 'pending';

                      return (
                        <TableRow
                          key={doc.id.toString()}
                          className="hover:bg-muted/20 cursor-pointer"
                          onClick={() => openDocumentDialog(doc)}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{doc.id.toString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className="font-mono text-xs text-foreground"
                              title={doc.submitter.toString()}
                            >
                              {truncatePrincipal(doc.submitter.toString())}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-foreground">
                              {getDocTypeLabel(doc.docType as unknown as string)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock size={11} />
                              {formatTimestamp(doc.timestamp)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <SecurityBadge type={getStatusBadgeType(statusStr)} />
                          </TableCell>
                          <TableCell>
                            {doc.adminNote ? (
                              <span className="text-xs text-muted-foreground italic truncate max-w-[120px] block">
                                {doc.adminNote}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground/40">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDocumentDialog(doc);
                              }}
                            >
                              <Eye size={12} />
                              Review
                            </Button>
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

      {/* Document Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Document Review
              {selectedDoc && (
                <span className="font-mono text-sm text-muted-foreground font-normal">
                  #{selectedDoc.id.toString()}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Review the submitted document and approve or reject it with an optional note.
            </DialogDescription>
          </DialogHeader>

          {selectedDoc && (
            <div className="space-y-5">
              {/* Document Metadata */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Submitter</p>
                  <p className="font-mono text-xs text-foreground break-all">
                    {selectedDoc.submitter.toString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Document Type</p>
                  <p className="text-foreground font-medium">
                    {getDocTypeLabel(selectedDoc.docType as unknown as string)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Submitted At</p>
                  <p className="text-foreground">{formatTimestamp(selectedDoc.timestamp)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Status</p>
                  <SecurityBadge type={getStatusBadgeType(selectedDocStatus)} />
                </div>
                {selectedDoc.adminVerifier && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Verified By</p>
                    <p className="font-mono text-xs text-foreground break-all">
                      {selectedDoc.adminVerifier.toString()}
                    </p>
                  </div>
                )}
                {selectedDoc.verificationTime && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Verified At</p>
                    <p className="text-foreground">{formatTimestamp(selectedDoc.verificationTime)}</p>
                  </div>
                )}
                {selectedDoc.adminNote && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Previous Admin Note</p>
                    <p className="text-foreground italic text-sm">{selectedDoc.adminNote}</p>
                  </div>
                )}
              </div>

              {/* Document Preview */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Document Preview</p>
                <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
                  <img
                    src={selectedDoc.blob.getDirectURL()}
                    alt="Submitted document"
                    className="w-full max-h-80 object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div
                    className="hidden items-center justify-center py-12 text-muted-foreground flex-col gap-2"
                  >
                    <FileText size={32} className="text-muted-foreground/40" />
                    <p className="text-sm">Preview not available for this file type</p>
                    <a
                      href={selectedDoc.blob.getDirectURL()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline"
                    >
                      Open document in new tab
                    </a>
                  </div>
                </div>
                <a
                  href={selectedDoc.blob.getDirectURL()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  Open in new tab ↗
                </a>
              </div>

              {/* Admin Note */}
              {isPendingDoc && (
                <div className="space-y-2">
                  <Label htmlFor="admin-note" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Admin Note (Optional)
                  </Label>
                  <Textarea
                    id="admin-note"
                    placeholder="Add a note about this document (optional)..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline" className="gap-1.5">
                <X size={14} />
                Close
              </Button>
            </DialogClose>
            {isPendingDoc && (
              <>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                  onClick={() => handleVerify(false)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <XCircle size={14} />
                  )}
                  Reject Document
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => handleVerify(true)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  Approve Document
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
