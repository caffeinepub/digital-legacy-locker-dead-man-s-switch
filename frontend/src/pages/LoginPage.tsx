import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Shield, Lock, ArrowRight, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';

type Step = 'identity' | 'otp';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function LoginPage() {
  const router = useRouter();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const [step, setStep] = useState<Step>('identity');
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [copied, setCopied] = useState(false);

  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  // After login, move to OTP step and generate OTP
  useEffect(() => {
    if (isAuthenticated && step === 'identity') {
      const newOtp = generateOtp();
      setGeneratedOtp(newOtp);
      setStep('otp');
    }
  }, [isAuthenticated, step]);

  // After OTP verified, redirect based on profile
  useEffect(() => {
    if (otpVerified && isFetched && !profileLoading) {
      if (userProfile) {
        router.navigate({ to: '/dashboard' });
      } else {
        router.navigate({ to: '/register' });
      }
    }
  }, [otpVerified, isFetched, profileLoading, userProfile, router]);

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

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      if (value === generatedOtp) {
        setTimeout(() => {
          toast.success('OTP verified successfully');
          setOtpVerified(true);
        }, 400);
      } else {
        toast.error('Incorrect OTP. Please try again.');
        setOtp('');
      }
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
        <Loader2 size={32} className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 mb-4">
            <img src="/assets/generated/logo-icon.dim_128x128.png" alt="Logo" className="w-10 h-10 rounded-lg" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-navy-300 mt-2">Sign in to access your digital legacy</p>
        </div>

        <div className="bg-white rounded-2xl shadow-glow p-8 animate-fade-in">
          {/* Step 1: Identity */}
          {step === 'identity' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold text-navy-900 mb-1">Connect Your Identity</h2>
                <p className="text-navy-500 text-sm">Use your Internet Identity to securely sign in.</p>
              </div>

              <div className="p-4 rounded-xl bg-navy-50 border border-navy-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900 text-sm">Internet Identity</p>
                    <p className="text-xs text-navy-500">Secure, passwordless authentication</p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full py-5 font-semibold gap-2"
                onClick={() => login()}
                disabled={loginStatus === 'logging-in'}
              >
                {loginStatus === 'logging-in' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
                {loginStatus === 'logging-in' ? 'Connecting...' : 'Sign In'}
              </Button>

              <p className="text-center text-sm text-navy-500">
                Don't have an account?{' '}
                <button
                  onClick={() => router.navigate({ to: '/register' })}
                  className="text-primary font-medium hover:underline"
                >
                  Register here
                </button>
              </p>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-navy-900 mb-1">Two-Factor Verification</h2>
                <p className="text-navy-500 text-sm">Copy the OTP below and enter it to complete sign-in.</p>
              </div>

              {/* Generated OTP Display */}
              <div className="p-4 rounded-xl bg-navy-50 border border-navy-200">
                <p className="text-xs text-navy-500 mb-2 font-medium uppercase tracking-wide">Your One-Time Password</p>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl font-bold text-navy-900 tracking-[0.25em] flex-1">
                    {generatedOtp}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyOtp}
                    className="gap-1.5 shrink-0"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-navy-600 mb-3 text-center">Enter the OTP above to continue</p>
                <div className="flex justify-center py-2">
                  <InputOTP maxLength={6} value={otp} onChange={handleOtpChange}>
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

              {(profileLoading && otpVerified) && (
                <div className="flex items-center justify-center gap-2 text-sm text-navy-500">
                  <Loader2 size={14} className="animate-spin" />
                  Loading your profile...
                </div>
              )}

              <button
                onClick={async () => {
                  await clear();
                  setStep('identity');
                  setOtp('');
                  setGeneratedOtp('');
                  setOtpVerified(false);
                }}
                className="w-full text-center text-sm text-navy-400 hover:text-navy-600 transition-colors"
              >
                ← Use a different identity
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
