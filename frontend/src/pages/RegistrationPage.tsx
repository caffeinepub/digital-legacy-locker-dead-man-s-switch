import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Shield,
  User,
  Upload,
  Users,
  FileText,
  CheckCircle,
  ArrowRight,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSaveCallerUserProfile, useAddNominee } from '../hooks/useQueries';
import { ExternalBlob, PersistentRelationship } from '../backend';

type Step = 'profile' | 'nominees' | 'complete';

interface NomineeForm {
  name: string;
  relationship: PersistentRelationship | '';
  idProofFile: File | null;
}

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('profile');
  const [profileName, setProfileName] = useState('');
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [nominees, setNominees] = useState<NomineeForm[]>([]);
  const [currentNominee, setCurrentNominee] = useState<NomineeForm>({
    name: '',
    relationship: '',
    idProofFile: null,
  });
  const [profileError, setProfileError] = useState('');

  const saveProfile = useSaveCallerUserProfile();
  const addNominee = useAddNominee();

  const handleProfileSubmit = async () => {
    if (!profileName.trim()) {
      setProfileError('Please enter your full name.');
      return;
    }
    setProfileError('');

    try {
      let encryptedData;
      if (profileFile) {
        const bytes = new Uint8Array(await profileFile.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes);
        encryptedData = { blob, size: BigInt(bytes.length) };
      } else {
        const placeholder = new Uint8Array(0);
        const blob = ExternalBlob.fromBytes(placeholder);
        encryptedData = { blob, size: BigInt(0) };
      }

      await saveProfile.mutateAsync({
        name: profileName.trim(),
        encryptedData,
      });

      setStep('nominees');
    } catch (err) {
      console.error('Profile save error:', err);
      setProfileError('Failed to save profile. Please try again.');
    }
  };

  const handleAddNominee = () => {
    if (!currentNominee.name.trim() || !currentNominee.relationship) return;
    setNominees([...nominees, currentNominee]);
    setCurrentNominee({ name: '', relationship: '', idProofFile: null });
  };

  const handleRemoveNominee = (idx: number) => {
    setNominees(nominees.filter((_, i) => i !== idx));
  };

  const handleNomineesSubmit = async () => {
    try {
      for (const nominee of nominees) {
        let idProof;
        if (nominee.idProofFile) {
          const bytes = new Uint8Array(await nominee.idProofFile.arrayBuffer());
          const blob = ExternalBlob.fromBytes(bytes);
          idProof = { blob, size: BigInt(bytes.length) };
        } else {
          const placeholder = new Uint8Array(0);
          const blob = ExternalBlob.fromBytes(placeholder);
          idProof = { blob, size: BigInt(0) };
        }

        await addNominee.mutateAsync({
          name: nominee.name.trim(),
          relationship: nominee.relationship as PersistentRelationship,
          idProof,
        });
      }
      setStep('complete');
    } catch (err) {
      console.error('Nominee add error:', err);
    }
  };

  const steps = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'nominees', label: 'Nominees', icon: <Users className="h-4 w-4" /> },
    { id: 'complete', label: 'Complete', icon: <CheckCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 mb-3">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Dead Man's Switch</h1>
          <p className="text-sm text-muted-foreground">Set up your digital legacy vault</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  step === s.id
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : steps.findIndex((x) => x.id === step) > idx
                    ? 'bg-accent/10 text-accent border border-accent/30'
                    : 'bg-secondary text-muted-foreground border border-border'
                }`}
              >
                {s.icon}
                {s.label}
              </div>
              {idx < steps.length - 1 && (
                <div className="h-px w-6 bg-border" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step: Profile */}
        {step === 'profile' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Create Your Profile</CardTitle>
              <CardDescription>
                Set up your identity on Dead Man's Switch. This information helps verify your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full legal name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="bg-[#1a2230] text-white placeholder:text-gray-400 caret-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileDoc">Identity Document (Optional)</Label>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="profileDoc"
                    className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-secondary/50 text-sm text-muted-foreground cursor-pointer hover:bg-secondary transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {profileFile ? profileFile.name : 'Upload document'}
                  </label>
                  <input
                    id="profileDoc"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setProfileFile(e.target.files?.[0] ?? null)}
                  />
                  {profileFile && (
                    <button
                      onClick={() => setProfileFile(null)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {profileError && (
                <p className="text-sm text-destructive">{profileError}</p>
              )}
              <Button
                onClick={handleProfileSubmit}
                disabled={saveProfile.isPending}
                className="w-full gap-2"
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Nominees */}
        {step === 'nominees' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Add Nominees</CardTitle>
              <CardDescription>
                Designate trusted individuals who will receive access to your digital legacy.
                You can add more later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Added nominees */}
              {nominees.length > 0 && (
                <div className="space-y-2">
                  {nominees.map((n, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{n.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{n.relationship}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveNominee(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add nominee form */}
              <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-secondary/20">
                <p className="text-sm font-medium text-foreground">Add a Nominee</p>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Nominee's full name"
                    value={currentNominee.name}
                    onChange={(e) => setCurrentNominee({ ...currentNominee, name: e.target.value })}
                    className="bg-[#1a2230] text-white placeholder:text-gray-400 caret-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Select
                    value={currentNominee.relationship}
                    onValueChange={(val) =>
                      setCurrentNominee({ ...currentNominee, relationship: val as PersistentRelationship })
                    }
                  >
                    <SelectTrigger className="bg-[#1a2230] text-white">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PersistentRelationship.spouse}>Spouse</SelectItem>
                      <SelectItem value={PersistentRelationship.child}>Child</SelectItem>
                      <SelectItem value={PersistentRelationship.sibling}>Sibling</SelectItem>
                      <SelectItem value={PersistentRelationship.legalRepresentative}>Legal Representative</SelectItem>
                      <SelectItem value={PersistentRelationship.other}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ID Proof (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="nomineeId"
                      className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-secondary/50 text-sm text-muted-foreground cursor-pointer hover:bg-secondary transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      {currentNominee.idProofFile ? currentNominee.idProofFile.name : 'Upload ID'}
                    </label>
                    <input
                      id="nomineeId"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) =>
                        setCurrentNominee({ ...currentNominee, idProofFile: e.target.files?.[0] ?? null })
                      }
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddNominee}
                  disabled={!currentNominee.name.trim() || !currentNominee.relationship}
                  className="w-full"
                >
                  Add Nominee
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('complete')}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={handleNomineesSubmit}
                  disabled={nominees.length === 0 || addNominee.isPending}
                  className="flex-1 gap-2"
                >
                  {addNominee.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <Card className="glass-card text-center">
            <CardContent className="pt-8 pb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 border border-accent/30 mb-4">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">You're All Set!</h2>
              <p className="text-muted-foreground mb-6">
                Your Dead Man's Switch vault has been created. Start adding your digital assets
                to protect your legacy.
              </p>
              <Button
                onClick={() => navigate({ to: '/dashboard' })}
                className="gap-2"
                size="lg"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
