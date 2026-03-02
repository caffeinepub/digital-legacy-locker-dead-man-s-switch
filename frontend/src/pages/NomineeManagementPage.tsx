import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Users,
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGetNominees, useAddNominee, useRemoveNominee } from '../hooks/useQueries';
import { ExternalBlob, PersistentRelationship, PersistentVerificationStatus } from '../backend';

const relationshipLabels: Record<PersistentRelationship, string> = {
  [PersistentRelationship.spouse]: 'Spouse',
  [PersistentRelationship.child]: 'Child',
  [PersistentRelationship.sibling]: 'Sibling',
  [PersistentRelationship.legalRepresentative]: 'Legal Representative',
  [PersistentRelationship.other]: 'Other',
};

export default function NomineeManagementPage() {
  const navigate = useNavigate();
  const { data: nominees, isLoading } = useGetNominees();
  const addNominee = useAddNominee();
  const removeNominee = useRemoveNominee();

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<PersistentRelationship | ''>('');
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !relationship) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setFormError('');

    try {
      let idProof;
      if (idProofFile) {
        const bytes = new Uint8Array(await idProofFile.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes);
        idProof = { blob, size: BigInt(bytes.length) };
      } else {
        const placeholder = new Uint8Array(0);
        const blob = ExternalBlob.fromBytes(placeholder);
        idProof = { blob, size: BigInt(0) };
      }

      await addNominee.mutateAsync({
        name: name.trim(),
        relationship: relationship as PersistentRelationship,
        idProof,
      });

      setName('');
      setRelationship('');
      setIdProofFile(null);
    } catch (err) {
      console.error('Add nominee error:', err);
      setFormError('Failed to add nominee. Please try again.');
    }
  };

  const handleRemove = async (idx: number) => {
    try {
      await removeNominee.mutateAsync(BigInt(idx));
    } catch (err) {
      console.error('Remove nominee error:', err);
    }
  };

  const getStatusIcon = (status: PersistentVerificationStatus) => {
    switch (status) {
      case PersistentVerificationStatus.verified:
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case PersistentVerificationStatus.rejected:
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-gold" />;
    }
  };

  const getStatusBadge = (status: PersistentVerificationStatus) => {
    switch (status) {
      case PersistentVerificationStatus.verified:
        return <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">Verified</Badge>;
      case PersistentVerificationStatus.rejected:
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-gold border-gold/30 text-xs">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nominee Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage trusted individuals who will receive your digital legacy
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Nominee Form */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add Nominee
              </CardTitle>
              <CardDescription>
                Add a trusted person who will receive access to your digital legacy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomineeName">Full Name *</Label>
                <Input
                  id="nomineeName"
                  placeholder="Nominee's full legal name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#1a2230] text-white placeholder:text-gray-400 caret-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship *</Label>
                <Select
                  value={relationship}
                  onValueChange={(val) => setRelationship(val as PersistentRelationship)}
                >
                  <SelectTrigger className="bg-[#1a2230] text-white">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(relationshipLabels).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ID Proof Document (Optional)</Label>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="idProof"
                    className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-secondary/50 text-sm text-muted-foreground cursor-pointer hover:bg-secondary transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {idProofFile ? idProofFile.name : 'Upload ID document'}
                  </label>
                  <input
                    id="idProof"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setIdProofFile(e.target.files?.[0] ?? null)}
                  />
                  {idProofFile && (
                    <button
                      onClick={() => setIdProofFile(null)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              <Button
                onClick={handleSubmit}
                disabled={addNominee.isPending}
                className="w-full gap-2"
              >
                {addNominee.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Add Nominee
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Nominees List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Your Nominees
              </CardTitle>
              <CardDescription>
                {nominees?.length ?? 0} nominee{(nominees?.length ?? 0) !== 1 ? 's' : ''} designated
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-lg bg-secondary/50 animate-pulse" />
                  ))}
                </div>
              ) : nominees && nominees.length > 0 ? (
                <div className="space-y-3">
                  {nominees.map((nominee, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold">
                            {nominee.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{nominee.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {relationshipLabels[nominee.relationship]}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(nominee.verificationStatus)}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemove(idx)}
                            disabled={removeNominee.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No nominees added yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your first nominee using the form
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
