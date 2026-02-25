import { useState, useCallback } from 'react';
import { Shield, Upload, CheckCircle, Copy, Check, Lock, AlertTriangle, FileText, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import SecurityBadge from '../components/SecurityBadge';
import { useSubmitDeathVerificationRequest } from '../hooks/useQueries';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ACCEPTED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Only PDF, JPG, and PNG files are accepted.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must not exceed 10MB.';
  }
  return null;
}

interface FileUploadFieldProps {
  id: string;
  label: string;
  required?: boolean;
  file: File | null;
  error: string | null;
  onChange: (file: File | null, error: string | null) => void;
  hint?: string;
}

function FileUploadField({ id, label, required, file, error, onChange, hint }: FileUploadFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) {
      onChange(null, null);
      return;
    }
    const err = validateFile(selected);
    onChange(err ? null : selected, err);
    e.target.value = '';
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-navy-200 font-medium text-sm">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      <div
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
          error
            ? 'border-red-500/60 bg-red-500/5'
            : file
            ? 'border-emerald-500/60 bg-emerald-500/5'
            : 'border-navy-600 bg-navy-800/50 hover:border-primary/60 hover:bg-navy-700/50'
        }`}
        onClick={() => document.getElementById(id)?.click()}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-emerald-300 truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-navy-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        ) : (
          <div>
            <Upload size={22} className="text-navy-400 mx-auto mb-2" />
            <p className="text-sm text-navy-300 font-medium">Click to upload</p>
            <p className="text-xs text-navy-500 mt-1">PDF, JPG, PNG — max 10MB</p>
          </div>
        )}
        <input
          id={id}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={handleChange}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertTriangle size={11} /> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-navy-500">{hint}</p>
      )}
    </div>
  );
}

export default function DeathVerificationRequestPage() {
  // Form fields
  const [deceasedFullName, setDeceasedFullName] = useState('');
  const [deceasedEmail, setDeceasedEmail] = useState('');
  const [heirFullName, setHeirFullName] = useState('');
  const [relationship, setRelationship] = useState('');

  // File states
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [govIdError, setGovIdError] = useState<string | null>(null);
  const [deathCertFile, setDeathCertFile] = useState<File | null>(null);
  const [deathCertError, setDeathCertError] = useState<string | null>(null);
  const [relProofFile, setRelProofFile] = useState<File | null>(null);
  const [relProofError, setRelProofError] = useState<string | null>(null);

  // OTP states
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpCopied, setOtpCopied] = useState(false);
  const [showOtp, setShowOtp] = useState(true);

  // Submission
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const submitMutation = useSubmitDeathVerificationRequest();

  const handleGenerateOtp = () => {
    const otp = generateOtp();
    setGeneratedOtp(otp);
    setOtpInput('');
    setOtpVerified(false);
    setOtpError(null);
    toast.info('OTP generated. Copy it and enter it below to verify your identity.');
  };

  const handleCopyOtp = useCallback(async () => {
    if (!generatedOtp) return;
    try {
      await navigator.clipboard.writeText(generatedOtp);
      setOtpCopied(true);
      toast.success('OTP copied to clipboard!');
      setTimeout(() => setOtpCopied(false), 2000);
    } catch {
      toast.error('Failed to copy. Please copy manually.');
    }
  }, [generatedOtp]);

  const handleOtpChange = (value: string) => {
    setOtpInput(value);
    setOtpError(null);
    if (value.length === 6) {
      if (value === generatedOtp) {
        setOtpVerified(true);
        toast.success('Identity verified successfully!');
      } else {
        setOtpError('Incorrect OTP. Please try again.');
        setOtpVerified(false);
        setTimeout(() => setOtpInput(''), 600);
      }
    } else {
      setOtpVerified(false);
    }
  };

  const isFormValid =
    deceasedFullName.trim() &&
    deceasedEmail.trim() &&
    heirFullName.trim() &&
    relationship &&
    govIdFile &&
    !govIdError &&
    deathCertFile &&
    !deathCertError &&
    !relProofError &&
    otpVerified;

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error('Please complete all required fields and verify your identity.');
      return;
    }

    try {
      const govIdBytes = new Uint8Array(await govIdFile!.arrayBuffer());
      const deathCertBytes = new Uint8Array(await deathCertFile!.arrayBuffer());
      const relProofBytes = relProofFile
        ? new Uint8Array(await relProofFile.arrayBuffer())
        : null;

      await submitMutation.mutateAsync({
        deceasedFullName: deceasedFullName.trim(),
        deceasedEmail: deceasedEmail.trim(),
        heirFullName: heirFullName.trim(),
        relationshipToDeceased: relationship,
        governmentIdBlob: govIdBytes,
        deathCertificateBlob: deathCertBytes,
        relationshipProofBlob: relProofBytes,
      });

      setSubmissionSuccess(true);
    } catch {
      toast.error('Submission failed. Please try again.');
    }
  };

  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center animate-fade-in">
          {/* Success Icon */}
          <div className="relative inline-flex mb-8">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-navy-800 border-2 border-emerald-500 flex items-center justify-center">
              <Shield size={14} className="text-emerald-400" />
            </div>
          </div>

          <div className="bg-navy-800/80 border border-navy-600 rounded-2xl p-8 shadow-glow backdrop-blur-sm">
            <div className="flex justify-center mb-4">
              <SecurityBadge type="pending" text="Under Verification" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-4">
              Request Submitted Successfully
            </h1>
            <p className="text-navy-200 text-base leading-relaxed mb-6">
              Your request has been received and is under verification. You will be notified within{' '}
              <span className="text-emerald-400 font-semibold">3–5 business days</span>.
            </p>

            <div className="space-y-3 text-left mb-6">
              {[
                'Documents are being reviewed by our verification team',
                'All data is encrypted and handled with strict confidentiality',
                'No access will be granted without full admin approval',
                'You will receive a notification once the review is complete',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-navy-300">{item}</p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-700 flex items-start gap-2.5 text-left">
              <Lock size={14} className="text-navy-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-navy-400">
                This system uses AI-assisted verification with human oversight. Data remains encrypted and inaccessible during the user's lifetime. Access is granted only after verified legal confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 mb-4">
            <FileText size={28} className="text-white" />
          </div>
          <div className="flex justify-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wide">
              <Shield size={11} /> Secure Heir Verification
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Death Verification Request
          </h1>
          <p className="text-navy-300 text-sm max-w-md mx-auto leading-relaxed">
            Submit a formal request to access a deceased user's digital vault. All documents are encrypted and reviewed by our verification team.
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="mb-6 p-4 rounded-xl bg-navy-800/60 border border-navy-600 flex items-start gap-3">
          <Lock size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Privacy & Security Notice</p>
            <p className="text-xs text-navy-400 leading-relaxed">
              All uploaded documents are encrypted with AES-256 and stored securely on the blockchain. Your data is handled with strict confidentiality and will only be accessed by authorized verification personnel.
            </p>
          </div>
        </div>

        <div className="bg-navy-800/70 border border-navy-600 rounded-2xl shadow-glow backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-navy-700">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">1</span>
              Deceased User Information
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="deceased-name" className="text-navy-200 font-medium text-sm">
                  Full Name of Deceased <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="deceased-name"
                  value={deceasedFullName}
                  onChange={(e) => setDeceasedFullName(e.target.value)}
                  placeholder="Enter full legal name"
                  className="bg-navy-900/60 border-navy-600 text-white placeholder:text-navy-500 focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deceased-email" className="text-navy-200 font-medium text-sm">
                  Registered Email <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="deceased-email"
                  type="email"
                  value={deceasedEmail}
                  onChange={(e) => setDeceasedEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="bg-navy-900/60 border-navy-600 text-white placeholder:text-navy-500 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-navy-700">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-5">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">2</span>
              Heir Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="heir-name" className="text-navy-200 font-medium text-sm">
                  Heir's Full Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="heir-name"
                  value={heirFullName}
                  onChange={(e) => setHeirFullName(e.target.value)}
                  placeholder="Your full legal name"
                  className="bg-navy-900/60 border-navy-600 text-white placeholder:text-navy-500 focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="relationship" className="text-navy-200 font-medium text-sm">
                  Relationship to Deceased <span className="text-red-400">*</span>
                </Label>
                <Select value={relationship} onValueChange={setRelationship}>
                  <SelectTrigger
                    id="relationship"
                    className="bg-navy-900/60 border-navy-600 text-white focus:border-primary"
                  >
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent className="bg-navy-800 border-navy-600">
                    <SelectItem value="spouse" className="text-white hover:bg-navy-700">Spouse</SelectItem>
                    <SelectItem value="child" className="text-white hover:bg-navy-700">Child</SelectItem>
                    <SelectItem value="sibling" className="text-white hover:bg-navy-700">Sibling</SelectItem>
                    <SelectItem value="legalRepresentative" className="text-white hover:bg-navy-700">Legal Representative</SelectItem>
                    <SelectItem value="other" className="text-white hover:bg-navy-700">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-navy-700">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-5">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">3</span>
              Document Uploads
            </h2>
            <div className="space-y-5">
              <FileUploadField
                id="gov-id-upload"
                label="Government-Issued ID"
                required
                file={govIdFile}
                error={govIdError}
                onChange={(f, e) => { setGovIdFile(f); setGovIdError(e); }}
                hint="Passport, national ID, or driver's license"
              />
              <FileUploadField
                id="death-cert-upload"
                label="Official Death Certificate"
                required
                file={deathCertFile}
                error={deathCertError}
                onChange={(f, e) => { setDeathCertFile(f); setDeathCertError(e); }}
                hint="Official government-issued death certificate"
              />
              <FileUploadField
                id="rel-proof-upload"
                label="Relationship Proof (Optional)"
                file={relProofFile}
                error={relProofError}
                onChange={(f, e) => { setRelProofFile(f); setRelProofError(e); }}
                hint="Marriage certificate, birth certificate, or legal document"
              />
            </div>
          </div>

          {/* OTP Verification */}
          <div className="p-6 border-t border-navy-700">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">4</span>
              Identity Verification
            </h2>
            <p className="text-navy-400 text-sm mb-5">
              Generate a one-time passcode to verify your identity before submitting this request.
            </p>

            {!generatedOtp ? (
              <Button
                onClick={handleGenerateOtp}
                variant="outline"
                className="w-full border-primary/40 text-primary hover:bg-primary/10 hover:border-primary gap-2"
              >
                <Shield size={16} />
                Generate Verification OTP
              </Button>
            ) : (
              <div className="space-y-4">
                {/* OTP Display */}
                <div className="p-4 rounded-xl bg-navy-900/80 border border-primary/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide">Your One-Time Passcode</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowOtp(!showOtp)}
                        className="text-navy-400 hover:text-white transition-colors"
                        title={showOtp ? 'Hide OTP' : 'Show OTP'}
                      >
                        {showOtp ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={handleCopyOtp}
                        className="flex items-center gap-1.5 text-xs text-primary hover:text-white transition-colors font-medium"
                      >
                        {otpCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        {otpCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="font-mono text-3xl font-bold text-white tracking-[0.3em] text-center py-2">
                    {showOtp ? generatedOtp : '••••••'}
                  </div>
                  <p className="text-xs text-navy-500 text-center mt-1">
                    Copy this code and enter it below
                  </p>
                </div>

                {/* OTP Input */}
                <div className="space-y-2">
                  <Label className="text-navy-200 font-medium text-sm">Enter OTP to Verify</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otpInput}
                      onChange={handleOtpChange}
                      disabled={otpVerified}
                    >
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
                  {otpError && (
                    <p className="text-xs text-red-400 text-center flex items-center justify-center gap-1">
                      <AlertTriangle size={11} /> {otpError}
                    </p>
                  )}
                  {otpVerified && (
                    <p className="text-xs text-emerald-400 text-center flex items-center justify-center gap-1">
                      <CheckCircle size={11} /> Identity verified successfully
                    </p>
                  )}
                </div>

                <button
                  onClick={handleGenerateOtp}
                  className="text-xs text-navy-400 hover:text-navy-200 transition-colors underline underline-offset-2 w-full text-center"
                >
                  Generate a new OTP
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="p-6 border-t border-navy-700">
            <div className="flex flex-wrap gap-2 mb-4">
              <SecurityBadge type="aes256" />
              <SecurityBadge type="e2e" />
              <SecurityBadge type="noAccess" text="Admin Approval Required" />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || submitMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 gap-2 disabled:opacity-50"
              size="lg"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting Securely...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Submit Verification Request
                </>
              )}
            </Button>

            <p className="text-xs text-navy-500 text-center mt-3 leading-relaxed">
              By submitting, you confirm that all information provided is accurate and that you are the legitimate heir. False submissions may result in legal consequences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
