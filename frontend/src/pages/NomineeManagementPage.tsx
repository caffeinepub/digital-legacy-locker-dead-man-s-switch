import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetNominees, useAddNominee, useRemoveNominee } from '../hooks/useQueries';
import { ExternalBlob, PersistentRelationship, PersistentVerificationStatus } from '../backend';
import { Shield, Users, Plus, Trash2, Upload, Loader2, ArrowLeft, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import SecurityBadge from '../components/SecurityBadge';

const RELATIONSHIP_OPTIONS = [
  { value: PersistentRelationship.spouse, label: 'Spouse' },
  { value: PersistentRelationship.child, label: 'Child' },
  { value: PersistentRelationship.sibling, label: 'Sibling' },
  { value: PersistentRelationship.legalRepresentative, label: 'Legal Representative' },
  { value: PersistentRelationship.other, label: 'Other' },
];

function getRelationshipLabel(rel: PersistentRelationship): string {
  return RELATIONSHIP_OPTIONS.find((r) => r.value === rel)?.label ?? String(rel);
}

export default function NomineeManagementPage() {
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const { data: nominees = [], isLoading } = useGetNominees();
  const addNominee = useAddNominee();
  const removeNominee = useRemoveNominee();

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<PersistentRelationship>(PersistentRelationship.spouse);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center">
          <Shield size={48} className="text-navy-300 mx-auto mb-4" />
          <p className="text-navy-500 mb-4">Please log in to manage nominees.</p>
          <Button onClick={() => router.navigate({ to: '/login' })}>Login</Button>
        </div>
      </div>
    );
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Nominee name is required'); return; }
    if (!idFile) { toast.error('ID proof is required'); return; }

    const bytes = new Uint8Array(await idFile.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes);

    try {
      await addNominee.mutateAsync({
        name: name.trim(),
        relationship,
        idProof: { blob, size: BigInt(bytes.length) },
      });
      toast.success(`${name} added as nominee`);
      setName('');
      setIdFile(null);
      setShowForm(false);
    } catch {
      toast.error('Failed to add nominee. Please try again.');
    }
  };

  const handleRemove = async (index: number) => {
    try {
      await removeNominee.mutateAsync(BigInt(index));
      toast.success('Nominee removed');
    } catch {
      toast.error('Failed to remove nominee.');
    }
  };

  return (
    <div className="min-h-screen bg-navy-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
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
            <h1 className="font-display text-2xl font-bold text-navy-900">Nominee Management</h1>
            <p className="text-navy-500 text-sm">Manage who receives access to your digital legacy</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus size={16} /> Add Nominee
          </Button>
        </div>

        {/* Add Nominee Form */}
        {showForm && (
          <Card className="shadow-card border-primary/20 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg text-navy-900 flex items-center gap-2">
                <UserCheck size={18} className="text-primary" /> New Nominee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-navy-700 font-medium">Full Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nominee's full name"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-navy-700 font-medium">Relationship</Label>
                    <Select
                      value={relationship}
                      onValueChange={(v) => setRelationship(v as PersistentRelationship)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-navy-700 font-medium">ID Proof Document</Label>
                  <div
                    className="mt-1.5 border-2 border-dashed border-navy-200 rounded-xl p-5 text-center cursor-pointer hover:border-primary/50 hover:bg-navy-50 transition-smooth"
                    onClick={() => document.getElementById('nominee-id')?.click()}
                  >
                    <Upload size={20} className="text-navy-300 mx-auto mb-2" />
                    {idFile ? (
                      <p className="text-sm font-medium text-navy-900">{idFile.name}</p>
                    ) : (
                      <p className="text-sm text-navy-500">Click to upload ID document</p>
                    )}
                    <input
                      id="nominee-id"
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1 gap-2" disabled={addNominee.isPending}>
                    {addNominee.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    Add Nominee
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Nominees List */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg text-navy-900 flex items-center gap-2">
              <Users size={18} className="text-purple-500" /> Your Nominees ({nominees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : nominees.length === 0 ? (
              <div className="text-center py-10">
                <Users size={36} className="text-navy-200 mx-auto mb-3" />
                <p className="text-navy-500 text-sm">No nominees added yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setShowForm(true)}
                >
                  Add Your First Nominee
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {nominees.map((nominee, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl bg-navy-50 hover:bg-navy-100 transition-smooth"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-bold text-sm">
                          {nominee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-navy-900 text-sm">{nominee.name}</p>
                        <p className="text-xs text-navy-400">
                          {getRelationshipLabel(nominee.relationship)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <SecurityBadge
                        type={
                          nominee.verificationStatus === PersistentVerificationStatus.verified
                            ? 'verified'
                            : nominee.verificationStatus === PersistentVerificationStatus.rejected
                            ? 'rejected'
                            : 'pending'
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Nominee</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove <strong>{nominee.name}</strong> as a
                              nominee? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemove(i)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="p-4 rounded-xl bg-navy-900 text-navy-300 text-xs flex items-start gap-2">
          <Shield size={14} className="flex-shrink-0 mt-0.5 text-navy-400" />
          <span>
            Nominees will only receive access after legal death verification is approved by our admin
            team. All nominee ID proofs are encrypted and stored securely.
          </span>
        </div>
      </div>
    </div>
  );
}
