import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Shield, Copy, Check, KeyRound, ArrowRight, Loader2, ShieldCheck, Users } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useGetCallerUserProfile, useIsAdmin } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';

type LoginMode = 'user' | 'admin';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const [step, setStep] = useState<'select' | 'otp'>('select');
  const [loginMode, setLoginMode] = useState<LoginMode>('user');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [copied, setCopied] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const hasMovedToOtp = useRef(false);
  const hasRedirected = useRef(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched } = useIsAdmin();

  // When authenticated, generate OTP and move to OTP step (only once)
  useEffect(() => {
    if (isAuthenticated && !hasMovedToOtp.current) {
      hasMovedToOtp.current = true;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setStep('otp');
    }
  }, [isAuthenticated]);

  // After OTP is verified, wait for profile and admin data, then redirect
  useEffect(() => {
    if (!otpVerified) return;
    if (hasRedirected.current) return;

    // Wait for both admin check and profile to finish loading
    const adminReady = adminFetched && !adminLoading;
    const profileReady = profileFetched && !profileLoading;

    if (!adminReady || !profileReady) return;

    hasRedirected.current = true;

    if (isAdmin) {
      navigate({ to: '/admin/dashboard' });
    } else if (userProfile) {
      navigate({ to: '/dashboard' });
    } else {
      navigate({ to: '/register' });
    }
  }, [otpVerified, isAdmin, adminLoading, adminFetched, userProfile, profileLoading, profileFetched, navigate]);

  const handleLogin = async (mode: LoginMode) => {
    setLoginMode(mode);
    hasMovedToOtp.current = false;
    hasRedirected.current = false;
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(generatedOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === generatedOtp) {
      setOtpVerified(true);
      // Redirect will be handled by the useEffect above once data is ready
    } else {
      setOtpError('Invalid OTP. Please try again.');
      setEnteredOtp('');
    }
  };

  const isRedirecting = otpVerified && (adminLoading || profileLoading || !adminFetched || !profileFetched);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Dead Man's Switch</h1>
          <p className="text-muted-foreground text-sm mt-1">Secure Today. Protected Forever.</p>
        </div>

        {step === 'select' ? (
          <div className="space-y-4">
            {/* User Login Card */}
            <Card className="glass-card border-border/60 hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">User Login</CardTitle>
                    <CardDescription className="text-xs">
                      Access your personal secure vault
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-auto text-xs">Standard</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to manage your digital assets, nominees, and legacy settings.
                </p>
                <Button
                  onClick={() => handleLogin('user')}
                  disabled={isLoggingIn}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isLoggingIn && loginMode === 'user' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Login as User
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Admin Login Card */}
            <Card className="glass-card border-amber-500/30 hover:border-amber-500/60 transition-colors bg-amber-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <ShieldCheck className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Admin Login</CardTitle>
                    <CardDescription className="text-xs">
                      Access the admin control panel
                    </CardDescription>
                  </div>
                  <Badge className="ml-auto text-xs bg-amber-500/20 text-amber-600 border-amber-500/30 hover:bg-amber-500/30">
                    Admin
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in with your admin Internet Identity to review documents, manage verifications, and oversee the platform.
                </p>
                <Button
                  onClick={() => handleLogin('admin')}
                  disabled={isLoggingIn}
                  className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white border-0"
                  size="lg"
                >
                  {isLoggingIn && loginMode === 'admin' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Login as Admin
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Admin access is determined by your Internet Identity principal
                </p>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Both login options use Internet Computer's secure Internet Identity.
              <br />No passwords stored. Fully decentralized.
            </p>
          </div>
        ) : (
          /* OTP Verification Step */
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                  loginMode === 'admin'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-primary/10 border-primary/20'
                }`}>
                  {loginMode === 'admin'
                    ? <ShieldCheck className="h-5 w-5 text-amber-500" />
                    : <KeyRound className="h-5 w-5 text-primary" />
                  }
                </div>
                <div>
                  <CardTitle className="text-xl">Verify Identity</CardTitle>
                  <CardDescription className="text-xs">
                    {loginMode === 'admin' ? 'Admin verification' : 'User verification'}
                  </CardDescription>
                </div>
              </div>
              <CardDescription>
                Enter the OTP displayed below to complete your {loginMode === 'admin' ? 'admin ' : ''}login.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Generated OTP Display */}
                <div className={`rounded-lg border p-4 text-center ${
                  loginMode === 'admin'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-primary/30 bg-primary/5'
                }`}>
                  <p className="text-xs text-muted-foreground mb-2">Your One-Time Password</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className={`text-3xl font-mono font-bold tracking-widest ${
                      loginMode === 'admin' ? 'text-amber-500' : 'text-primary'
                    }`}>
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
                    Copy this OTP and enter it below to verify
                  </p>
                </div>

                {/* OTP Input */}
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
                  onClick={handleVerifyOtp}
                  disabled={enteredOtp.length !== 6 || isRedirecting}
                  className={`w-full gap-2 ${
                    loginMode === 'admin'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-0'
                      : ''
                  }`}
                  size="lg"
                >
                  {isRedirecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking access...
                    </>
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
