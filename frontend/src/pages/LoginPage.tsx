import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Shield,
  Copy,
  Check,
  KeyRound,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Users,
  IndianRupee,
  Star,
  Lock,
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useGetCallerUserProfile, useIsAdmin } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type LoginMode = 'user' | 'admin';

const PLANS = [
  {
    name: 'Basic',
    price: 0,
    period: 'Free forever',
    features: ['Up to 5 digital assets', '1 nominee', 'Basic encryption'],
    highlight: false,
  },
  {
    name: 'Standard',
    price: 499,
    period: 'per year',
    features: ['Up to 50 digital assets', '5 nominees', 'AES-256 encryption', 'Priority support'],
    highlight: true,
  },
  {
    name: 'Premium',
    price: 1499,
    period: 'per year',
    features: ['Unlimited assets', 'Unlimited nominees', 'Military-grade encryption', '24/7 support', 'Legal assistance'],
    highlight: false,
  },
];

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
    setOtpVerified(false);
    setEnteredOtp('');
    setOtpError('');
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
    } else {
      setOtpError('Invalid OTP. Please try again.');
      setEnteredOtp('');
    }
  };

  const isRedirecting = otpVerified && (adminLoading || profileLoading || !adminFetched || !profileFetched);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <div className="hero-gradient py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground font-display">Dead Man's Switch</h1>
          <p className="text-muted-foreground mt-2">Secure Today. Protected Forever.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {step === 'select' ? (
          <>
            {/* Login Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* User Login Card */}
              <Card className="glass-card border-border/60 hover:border-primary/50 transition-all duration-200 hover:shadow-glow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">User Login</CardTitle>
                      <CardDescription className="text-xs">
                        Access your personal secure vault
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-auto text-xs">Standard</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-5">
                    Sign in to manage your digital assets, nominees, and legacy settings. Your data is encrypted and protected.
                  </p>
                  <ul className="space-y-1.5 mb-5">
                    {['Manage digital assets', 'Add nominees', 'Track legal status'].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
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
              <Card className="glass-card border-amber-500/40 hover:border-amber-500/70 transition-all duration-200 bg-amber-500/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30">
                      <ShieldCheck className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Admin Login</CardTitle>
                      <CardDescription className="text-xs">
                        Access the admin control panel
                      </CardDescription>
                    </div>
                    <Badge className="ml-auto text-xs bg-amber-500/20 text-amber-500 border border-amber-500/40 hover:bg-amber-500/30">
                      Admin
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-5">
                    Sign in with your admin Internet Identity to review documents, manage verifications, and oversee the platform.
                  </p>
                  <ul className="space-y-1.5 mb-5">
                    {['Review documents', 'Manage verifications', 'Oversee platform'].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
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
            </div>

            <p className="text-center text-xs text-muted-foreground mb-12">
              Both login options use Internet Computer's secure Internet Identity.
              <br />No passwords stored. Fully decentralized.
            </p>

            {/* Pricing Section with ₹ */}
            <div className="mb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-display text-foreground mb-2">Simple, Transparent Pricing</h2>
                <p className="text-muted-foreground text-sm">Choose the plan that fits your needs. All prices in Indian Rupees (₹).</p>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {PLANS.map((plan) => (
                  <Card
                    key={plan.name}
                    className={`glass-card relative transition-all duration-200 ${
                      plan.highlight
                        ? 'border-primary/60 ring-1 ring-primary/30 shadow-glow'
                        : 'border-border/50 hover:border-border'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground text-xs px-3 py-0.5 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-3 pt-6">
                      <CardTitle className="text-base font-semibold">{plan.name}</CardTitle>
                      <div className="flex items-end gap-1 mt-2">
                        {plan.price === 0 ? (
                          <span className="text-3xl font-bold text-foreground">Free</span>
                        ) : (
                          <>
                            <IndianRupee className="h-5 w-5 text-primary mb-1" />
                            <span className="text-3xl font-bold text-foreground">{plan.price.toLocaleString('en-IN')}</span>
                            <span className="text-muted-foreground text-sm mb-1">/{plan.period.replace('per ', '')}</span>
                          </>
                        )}
                      </div>
                      {plan.price === 0 && (
                        <p className="text-xs text-muted-foreground">{plan.period}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Separator className="mb-4" />
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className={`h-4 w-4 flex-shrink-0 ${plan.highlight ? 'text-primary' : 'text-accent'}`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleLogin('user')}
                        disabled={isLoggingIn}
                        variant={plan.highlight ? 'default' : 'outline'}
                        className="w-full mt-5 gap-2"
                        size="sm"
                      >
                        {plan.price === 0 ? (
                          <>
                            <Lock className="h-3.5 w-3.5" />
                            Get Started Free
                          </>
                        ) : (
                          <>
                            <KeyRound className="h-3.5 w-3.5" />
                            Get Started — ₹{plan.price.toLocaleString('en-IN')}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground mt-4">
                All prices are in Indian Rupees (₹ INR) and include GST. Cancel anytime.
              </p>
            </div>
          </>
        ) : (
          /* OTP Verification Step */
          <div className="max-w-md mx-auto">
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
                        aria-label="Copy OTP"
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

                  <button
                    onClick={() => {
                      setStep('select');
                      hasMovedToOtp.current = false;
                      hasRedirected.current = false;
                      setOtpVerified(false);
                      setEnteredOtp('');
                      setOtpError('');
                    }}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
                  >
                    ← Back to login options
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
