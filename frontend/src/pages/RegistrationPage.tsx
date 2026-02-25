import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSaveCallerUserProfile, useAddNominee } from '../hooks/useQueries';
import { ExternalBlob, PersistentRelationship } from '../backend';
import { Shield, User, Users, FileText, CheckCircle, Loader2, Upload, Lock, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import SecurityBadge from '../components/SecurityBadge';

type Step = 'profile' | 'otp' | 'idVerification' | 'nominee' | 'documents';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User size={14} /> },
  { id: 'otp', label: 'Verify', icon: <Shield size={14} /> },
  { id: 'idVerification', label: 'ID Check', icon: <FileText size={14} /> },
  { id: 'nominee', label: 'Nominee', icon: <Users size={14} /> },
  { id: 'documents', label: 'Documents', icon: <FileText size={14} /> },
];

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function RegistrationPage() {
  const router = useRouter();
  const { identity, login, loginStatus } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();
  const addNominee = useAddNominee();

  const [step, setStep] = useState<Step>('profile');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [copied, setCopied] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelationship, setNomineeRelationship] = useState<PersistentRelationship>(PersistentRelationship.spouse);
  const [nomineeIdFile, setNomineeIdFile] = useState<File | null>(null);
  const [legalDocFile, setLegalDocFile] = useState<File | null>(null);
  const [skipNominee, setSkipNominee] = useState(false);

  const isAuthenticated = !!identity;
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  // Generate OTP when entering the OTP step
  useEffect(() => {
    if (step === 'otp' && !generatedOtp) {
      setGeneratedOtp(generateOtp());
    }
  }, [step, generatedOtp]);

  const handleCopyOtp = useCallback(async () => {
    if (!generatedOtp) return;
    try {
      await navigator.clipboard.writeText(generatedOtp);
      setCopied(true);
      toast.success('OTP copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy. Please copy manually.');
    }
  }, [generatedOtp]);

  const handleProfileNext = async () => {
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    if (!isAuthenticated) {
      toast.info('Please connect your identity first');
      login();
      return;
    }
    const placeholder = new TextEncoder().encode(name);
    const blob = ExternalBlob.fromBytes(placeholder);
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        encryptedData: { blob, size: BigInt(placeholder.length) },
      });
      setStep('otp');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleOtpNext = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      if (value === generatedOtp) {
        setTimeout(() => {
          toast.success('OTP verified successfully');
          setStep('idVerification');
        }, 400);
      } else {
        toast.error('Incorrect OTP. Please try again.');
        setOtp('');
      }
    }
  };

  const handleIdVerificationNext = () => {
    if (!idFile) { toast.error('Please upload your ID document'); return; }
    setStep('nominee');
  };

  const handleNomineeNext = async () => {
    if (skipNominee) { setStep('documents'); return; }
    if (!nomineeName.trim()) { toast.error('Please enter nominee name'); return; }
    if (!nomineeIdFile) { toast.error('Please upload nominee ID proof'); return; }

    const bytes = new Uint8Array(await nomineeIdFile.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes);
    try {
      await addNominee.mutateAsync({
        name: nomineeName.trim(),
        relationship: nomineeRelationship,
        idProof: { blob, size: BigInt(bytes.length) },
      });
      toast.success('Nominee added successfully');
      setStep('documents');
    } catch {
      toast.error('Failed to add nominee. Please try again.');
    }
  };

  const handleComplete = () => {
    toast.success('Registration complete! Welcome to Legacy Locker.');
    router.navigate({ to: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 px-4 py-12">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 mb-4">
            <img src="/assets/generated/logo-icon.dim_128x128.png" alt="Logo" className="w-10 h-10 rounded-lg" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Create Your Legacy Plan</h1>
          <p className="text-navy-300 mt-2">Secure your digital assets in minutes</p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-smooth ${
                  i < stepIndex ? 'bg-emerald-500 text-white' :
                  i === stepIndex ? 'bg-white text-navy-900' :
                  'bg-navy-700 text-navy-400'
                }`}>
                  {i < stepIndex ? <CheckCircle size={16} /> : s.icon}
                </div>
                <span className={`text-xs hidden sm:block ${i === stepIndex ? 'text-white' : 'text-navy-500'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 sm:w-12 mx-1 mt-[-12px] transition-smooth ${i < stepIndex ? 'bg-emerald-500' : 'bg-navy-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-glow p-8 animate-fade-in">
          {/* Step 1: Profile */}
          {step === 'profile' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-navy-900 mb-1">Your Profile</h2>
                <p className="text-navy-500 text-sm">Start by connecting your identity and entering your name.</p>
              </div>
              {!isAuthenticated && (
                <div className="p-4 rounded-xl bg-navy-50 border border-navy-100">
                  <p className="text-sm text-navy-600 mb-3">First, connect your Internet Identity to get started.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => login()}
                    disabled={loginStatus === 'logging-in'}
                    className="gap-2"
                  >
                    {loginStatus === 'logging-in' ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                    {loginStatus === 'logging-in' ? 'Connecting...' : 'Connect Identity'}
                  </Button>
                </div>
              )}
              {isAuthenticated && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle size={13} /> Identity connected successfully
                </div>
              )}
              <div>
                <Label className="text-navy-700 font-medium">Full Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1.5"
                />
              </div>
              <Button
                onClick={handleProfileNext}
                className="w-full gap-2"
                disabled={saveProfile.isPending}
              >
                {saveProfile.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-navy-900 mb-1">Verify Your Identity</h2>
                <p className="text-navy-500 text-sm">Enter the OTP shown below to verify your identity.</p>
              </div>

              {/* OTP Display */}
              <div className="p-4 rounded-xl bg-navy-900 text-center">
                <p className="text-xs text-navy-400 mb-2 uppercase tracking-wide font-semibold">Your One-Time Passcode</p>
                <div className="font-mono text-4xl font-bold text-white tracking-[0.3em] mb-3">
                  {generatedOtp}
                </div>
                <button
                  onClick={handleCopyOtp}
                  className="flex items-center gap-1.5 text-xs text-navy-300 hover:text-white transition-colors mx-auto"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy OTP'}
                </button>
              </div>

              <div>
                <Label className="text-navy-700 font-medium text-sm mb-2 block">Enter OTP</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={handleOtpNext}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: ID Verification */}
          {step === 'idVerification' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-navy-900 mb-1">ID Verification</h2>
                <p className="text-navy-500 text-sm">Upload a government-issued ID for verification.</p>
              </div>
              <div
                className="border-2 border-dashed border-navy-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-navy-50 transition-smooth"
                onClick={() => document.getElementById('id-upload')?.click()}
              >
                <Upload size={32} className="text-navy-300 mx-auto mb-3" />
                {idFile ? (
                  <div>
                    <p className="font-medium text-navy-900">{idFile.name}</p>
                    <p className="text-xs text-navy-400 mt-1">{(idFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-navy-600 font-medium">Upload ID Document</p>
                    <p className="text-xs text-navy-400 mt-1">PDF, JPG, or PNG accepted</p>
                  </div>
                )}
                <input
                  id="id-upload"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button onClick={handleIdVerificationNext} className="w-full gap-2">
                Continue
              </Button>
            </div>
          )}

          {/* Step 4: Nominee */}
          {step === 'nominee' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-navy-900 mb-1">Add a Nominee</h2>
                <p className="text-navy-500 text-sm">Designate someone to receive access to your digital legacy.</p>
              </div>

              {!skipNominee && (
                <>
                  <div>
                    <Label className="text-navy-700 font-medium">Nominee Name</Label>
                    <Input
                      value={nomineeName}
                      onChange={(e) => setNomineeName(e.target.value)}
                      placeholder="Full name"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-navy-700 font-medium">Relationship</Label>
                    <Select
                      value={nomineeRelationship}
                      onValueChange={(v) => setNomineeRelationship(v as PersistentRelationship)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
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
                  <div>
                    <Label className="text-navy-700 font-medium">Nominee ID Proof</Label>
                    <div
                      className="mt-1.5 border-2 border-dashed border-navy-200 rounded-xl p-5 text-center cursor-pointer hover:border-primary/50 hover:bg-navy-50 transition-smooth"
                      onClick={() => document.getElementById('nominee-id-reg')?.click()}
                    >
                      <Upload size={20} className="text-navy-300 mx-auto mb-2" />
                      {nomineeIdFile ? (
                        <p className="text-sm font-medium text-navy-900">{nomineeIdFile.name}</p>
                      ) : (
                        <p className="text-sm text-navy-500">Click to upload</p>
                      )}
                      <input
                        id="nominee-id-reg"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setNomineeIdFile(e.target.files?.[0] ?? null)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleNomineeNext}
                  className="flex-1 gap-2"
                  disabled={addNominee.isPending}
                >
                  {addNominee.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                  {skipNominee ? 'Skip & Continue' : 'Add & Continue'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSkipNominee(!skipNominee)}
                >
                  {skipNominee ? 'Add Nominee' : 'Skip'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Documents */}
          {step === 'documents' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-navy-900 mb-1">Legal Documents</h2>
                <p className="text-navy-500 text-sm">Optionally upload any legal documents for your estate plan.</p>
              </div>
              <div
                className="border-2 border-dashed border-navy-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-navy-50 transition-smooth"
                onClick={() => document.getElementById('legal-doc')?.click()}
              >
                <FileText size={32} className="text-navy-300 mx-auto mb-3" />
                {legalDocFile ? (
                  <div>
                    <p className="font-medium text-navy-900">{legalDocFile.name}</p>
                    <p className="text-xs text-navy-400 mt-1">{(legalDocFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-navy-600 font-medium">Upload Legal Document (Optional)</p>
                    <p className="text-xs text-navy-400 mt-1">Will, trust, or other legal documents</p>
                  </div>
                )}
                <input
                  id="legal-doc"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setLegalDocFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span className="font-semibold text-emerald-800 text-sm">Registration Complete!</span>
                </div>
                <p className="text-xs text-emerald-700">Your digital legacy plan has been set up. You can manage everything from your dashboard.</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <SecurityBadge type="aes256" />
                <SecurityBadge type="e2e" />
                <SecurityBadge type="noAccess" />
              </div>

              <Button onClick={handleComplete} className="w-full gap-2">
                <Lock size={16} />
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
