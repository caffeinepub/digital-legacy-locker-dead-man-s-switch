import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Shield,
  Upload,
  CheckCircle,
  ArrowRight,
  Loader2,
  Copy,
  Check,
  FileText,
  User,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useSubmitDeathVerificationRequest } from '../hooks/useQueries';

type Step = 'form' | 'otp' | 'success';

export default function DeathVerificationRequestPage() {
  const navigate = useNavigate();
  const submitRequest = useSubmitDeathVerificationRequest();

  const [step, setStep] = useState<Step>('form');
  const [requestId, setRequestId] = useState<bigint | null>(null);

  // Form fields
  const [deceasedName, setDeceasedName] = useState('');
  const [deceasedEmail, setDeceasedEmail] = useState('');
  const [heirName, setHeirName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [deathCertFile, setDeathCertFile] = useState<File | null>(null);
  const [relProofFile, setRelProofFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  // OTP
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [copied, setCopied] = useState(false);

  const validateFile = (file: File | null): boolean => {
    if (!file) return true;
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    return validTypes.includes(file.type) && file.size <= maxSize;
  };

  const handleFormSubmit = () => {
    if (!deceasedName.trim() || !deceasedEmail.trim() || !heirName.trim() || !relationship.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (!govIdFile || !deathCertFile) {
      setFormError('Please upload your Government ID and Death Certificate.');
      return;
    }
    if (!validateFile(govIdFile) || !validateFile(deathCertFile) || !validateFile(relProofFile)) {
      setFormError('Files must be PDF, JPG, or PNG and under 10MB.');
      return;
    }
    setFormError('');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setStep('otp');
  };

  const handleOtpVerify = async () => {
    if (enteredOtp !== generatedOtp) {
      setOtpError('Invalid OTP. Please try again.');
      setEnteredOtp('');
      return;
    }

    try {
      const govIdBytes = new Uint8Array(await govIdFile!.arrayBuffer());
      const deathCertBytes = new Uint8Array(await deathCertFile!.arrayBuffer());
      const relProofBytes = relProofFile
        ? new Uint8Array(await relProofFile.arrayBuffer())
        : null;

      const id = await submitRequest.mutateAsync({
        deceasedFullName: deceasedName.trim(),
        deceasedEmail: deceasedEmail.trim(),
        heirFullName: heirName.trim(),
        relationshipToDeceased: relationship.trim(),
        governmentIdBlob: govIdBytes,
        deathCertificateBlob: deathCertBytes,
        relationshipProofBlob: relProofBytes,
      });

      setRequestId(id);
      setStep('success');
    } catch (err) {
      console.error('Submit error:', err);
      setOtpError('Submission failed. Please try again.');
    }
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(generatedOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const FileUploadField = ({
    id,
    label,
    required,
    file,
    onFileChange,
  }: {
    id: string;
    label: string;
    required?: boolean;
    file: File | null;
    onFileChange: (f: File | null) => void;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <label
          htmlFor={id}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-secondary/50 text-sm text-muted-foreground cursor-pointer hover:bg-secondary transition-colors flex-1"
        >
          <Upload className="h-4 w-4 shrink-0" />
          <span className="truncate">{file ? file.name : 'Upload file (PDF, JPG, PNG, max 10MB)'}</span>
        </label>
        <input
          id={id}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        {file && (
          <button
            onClick={() => onFileChange(null)}
            className="text-muted-foreground hover:text-destructive shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 mb-4">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Dead Man's Switch</h1>
          <p className="text-sm text-muted-foreground mt-1">Heir Verification Request</p>
        </div>

        {/* Step: Form */}
        {step === 'form' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Submit Death Verification Request</CardTitle>
              <CardDescription>
                As a nominated heir, submit this form to initiate the verification process
                for accessing the digital legacy of the deceased.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Deceased Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  Deceased Information
                </div>
                <div className="space-y-3 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="deceasedName">Full Name of Deceased *</Label>
                    <Input
                      id="deceasedName"
                      placeholder="Enter the deceased's full legal name"
                      value={deceasedName}
                      onChange={(e) => setDeceasedName(e.target.value)}
                      className="bg-[#1a2230] text-white placeholder:text-gray-400 caret-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deceasedEmail">Email Address of Deceased *</Label>
                    <Input
                      id="deceasedEmail"
                      type="email"
                      placeholder="Their registered email address"
                      value={deceasedEmail}
                      onChange={(e) => setDeceasedEmail(e.target.value)}
                      className="bg-[#1a2230] text-white placeholder:text-gray-400 caret-white"
                    />
                  </div>
                </div>
              </div>

              {/* Heir Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Heart className="h-4 w-4 text-accent" />
                  Your Information (Heir)
                </div>
                <div className="space-y-3 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="heirName">Your Full Name *</Label>
                    <Input
                      id="heirName"
                      placeholder="Your full legal name"
                      value={heirName}
                      onChange={(e) => setHeirName(e.target.value)}
                      className="bg-[#1a2230] text-white placeholder:text-gray-400 caret-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship to Deceased *</Label>
                    <Input
                      id="relationship"
                      placeholder="e.g., Spouse, Child, Legal Representative"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="bg-[#1a2230] text-white placeholder:text-gray-400 caret-white"
                    />
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="h-4 w-4 text-gold" />
                  Supporting Documents
                </div>
                <div className="space-y-3 pl-6">
                  <FileUploadField
                    id="govId"
                    label="Your Government-Issued ID"
                    required
                    file={govIdFile}
                    onFileChange={setGovIdFile}
                  />
                  <FileUploadField
                    id="deathCert"
                    label="Death Certificate"
                    required
                    file={deathCertFile}
                    onFileChange={setDeathCertFile}
                  />
                  <FileUploadField
                    id="relProof"
                    label="Relationship Proof Document"
                    file={relProofFile}
                    onFileChange={setRelProofFile}
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}

              <Button onClick={handleFormSubmit} className="w-full gap-2" size="lg">
                Proceed to Verification
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: OTP */}
        {step === 'otp' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Verify Your Identity</CardTitle>
              <CardDescription>
                Enter the one-time password below to confirm your submission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">Your One-Time Password</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-mono font-bold tracking-widest text-primary">
                    {generatedOtp}
                  </span>
                  <button
                    onClick={handleCopyOtp}
                    className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Copy this OTP and enter it below
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">Enter the OTP above</p>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(val) => {
                      setEnteredOtp(val);
                      setOtpError('');
                    }}
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
                  <p className="text-sm text-destructive text-center">{otpError}</p>
                )}
              </div>

              <Button
                onClick={handleOtpVerify}
                disabled={enteredOtp.length !== 6 || submitRequest.isPending}
                className="w-full gap-2"
                size="lg"
              >
                {submitRequest.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <Card className="glass-card text-center">
            <CardContent className="pt-8 pb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 border border-accent/30 mb-4">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Request Submitted</h2>
              <p className="text-muted-foreground mb-4">
                Your death verification request has been submitted successfully.
                Our team will review it and contact you within 3-5 business days.
              </p>
              {requestId !== null && (
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm text-primary mb-6">
                  <Shield className="h-4 w-4" />
                  Request ID: #{requestId.toString()}
                </div>
              )}
              <div className="space-y-3 text-left bg-secondary/50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-foreground">What happens next?</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    Our legal team will verify the submitted documents
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    You'll be notified of the verification status
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    Upon approval, controlled access will be granted
                  </li>
                </ul>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/' })}
                className="gap-2"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
