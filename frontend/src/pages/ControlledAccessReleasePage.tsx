import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin, useGetActivityLogs, useRecordAccessRelease, formatTimestamp } from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import {
  Shield,
  Key,
  Lock,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Activity,
  Clock,
  Eye,
  EyeOff,
  User,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/alert-dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

type AuthStep = 'credentials' | 'otp' | 'confirm';

export default function ControlledAccessReleasePage() {
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: activityLogs = [], isLoading: logsLoading } = useGetActivityLogs();
  const recordRelease = useRecordAccessRelease();

  const [authStep, setAuthStep] = useState<AuthStep>('credentials');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [targetPrincipal, setTargetPrincipal] = useState('');
  const [releaseNote, setReleaseNote] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center">
          <Shield size={48} className="text-navy-300 mx-auto mb-4" />
          <p className="text-navy-500 mb-4">Please log in to access admin features.</p>
          <Button onClick={() => router.navigate({ to: '/login' })}>Login</Button>
        </div>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center max-w-sm">
          <Shield size={48} className="text-red-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Access Denied</h2>
          <p className="text-navy-500 mb-6">
            You do not have admin privileges to access this page.
          </p>
          <Button onClick={() => router.navigate({ to: '/dashboard' })}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleCredentialsNext = () => {
    if (!adminPassword.trim()) {
      toast.error('Admin password is required');
      return;
    }
    if (!targetPrincipal.trim()) {
      toast.error('Target user principal is required');
      return;
    }
    // Simulate credential verification (UI prototype)
    setAuthStep('otp');
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      setTimeout(() => {
        toast.success('OTP verified');
        setAuthStep('confirm');
      }, 600);
    }
  };

  const handleReleaseAccess = async () => {
    let principal: Principal;
    try {
      principal = Principal.fromText(targetPrincipal.trim());
    } catch {
      toast.error('Invalid principal ID');
      return;
    }

    try {
      await recordRelease.mutateAsync({
        user: principal,
        note: releaseNote.trim() || 'Access released by admin after legal verification',
      });
      router.navigate({ to: '/admin/access-release/success' });
    } catch {
      toast.error('Failed to record access release. Please try again.');
    }
  };

  const accessLogs = activityLogs.filter(
    (log) =>
      log.action.toLowerCase().includes('access released') ||
      log.action.toLowerCase().includes('access release')
  );

  const stepLabels: Record<AuthStep, string> = {
    credentials: 'Admin Credentials',
    otp: 'OTP Verification',
    confirm: 'Confirm Release',
  };

  const steps: AuthStep[] = ['credentials', 'otp', 'confirm'];
  const currentStepIndex = steps.indexOf(authStep);

  return (
    <div className="min-h-screen bg-navy-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.navigate({ to: '/admin/legal-verification' })}
            className="text-navy-500"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-navy-900">
                Controlled Access Release
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                ADMIN
              </span>
            </div>
            <p className="text-navy-500 text-sm">
              Multi-layer authentication required to release digital assets
            </p>
          </div>
        </div>

        {/* Critical Warning */}
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Critical Action Warning</p>
            <p className="text-xs text-red-700 mt-0.5">
              Releasing access is irreversible. Ensure legal verification has been approved and all
              required documentation is in order before proceeding.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Multi-Layer Auth */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg text-navy-900 flex items-center gap-2">
                <Lock size={18} className="text-primary" /> Multi-Layer Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Step Indicators */}
              <div className="flex items-center gap-2 mb-6">
                {steps.map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-smooth ${
                        i < currentStepIndex
                          ? 'bg-emerald-500 text-white'
                          : i === currentStepIndex
                          ? 'bg-primary text-white'
                          : 'bg-navy-200 text-navy-500'
                      }`}
                    >
                      {i < currentStepIndex ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    <span
                      className={`text-xs hidden sm:block ${
                        i === currentStepIndex ? 'text-navy-900 font-medium' : 'text-navy-400'
                      }`}
                    >
                      {stepLabels[step]}
                    </span>
                    {i < steps.length - 1 && (
                      <div
                        className={`h-px w-4 ${
                          i < currentStepIndex ? 'bg-emerald-500' : 'bg-navy-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Credentials */}
              {authStep === 'credentials' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <Label className="text-navy-700 font-medium">Target User Principal ID</Label>
                    <div className="relative mt-1.5">
                      <User
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400"
                      />
                      <Input
                        value={targetPrincipal}
                        onChange={(e) => setTargetPrincipal(e.target.value)}
                        placeholder="User's principal ID"
                        className="pl-9 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-navy-700 font-medium">Admin Password</Label>
                    <div className="relative mt-1.5">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Enter admin password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-navy-700 font-medium">Release Note (optional)</Label>
                    <Input
                      value={releaseNote}
                      onChange={(e) => setReleaseNote(e.target.value)}
                      placeholder="Reason for access release"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-center gap-2">
                    <Shield size={13} />
                    Prototype: Enter any password to proceed.
                  </div>
                  <Button className="w-full gap-2" onClick={handleCredentialsNext}>
                    <Key size={16} /> Verify Credentials
                  </Button>
                </div>
              )}

              {/* Step 2: OTP */}
              {authStep === 'otp' && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-sm text-navy-600">
                    Enter the 6-digit OTP sent to the registered admin device.
                  </p>
                  <div className="flex justify-center py-2">
                    <InputOTP maxLength={6} value={otp} onChange={handleOtpComplete}>
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
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-center gap-2">
                    <Shield size={13} />
                    Prototype: Enter any 6 digits to proceed.
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {authStep === 'confirm' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={16} className="text-emerald-600" />
                      <span className="font-semibold text-emerald-800 text-sm">
                        Authentication Successful
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-emerald-700">
                      <p>✓ Admin credentials verified</p>
                      <p>✓ OTP verification passed</p>
                      <p>
                        ✓ Target:{' '}
                        <code className="bg-emerald-100 px-1 rounded font-mono">
                          {targetPrincipal.slice(0, 20)}...
                        </code>
                      </p>
                    </div>
                  </div>

                  <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <Button
                      className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => setShowConfirmDialog(true)}
                      disabled={recordRelease.isPending}
                    >
                      {recordRelease.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Key size={16} />
                      )}
                      Release Access Now
                    </Button>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                          <AlertTriangle size={20} /> Final Confirmation Required
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            You are about to release digital asset access for principal:
                          </p>
                          <code className="block text-xs bg-navy-100 px-2 py-1 rounded font-mono break-all">
                            {targetPrincipal}
                          </code>
                          <p className="font-semibold text-red-600">
                            This action is irreversible and will be permanently recorded.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleReleaseAccess}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Confirm Release
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Access Logs */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg text-navy-900 flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" /> Access Release Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : accessLogs.length === 0 ? (
                <div className="text-center py-10">
                  <Activity size={32} className="text-navy-200 mx-auto mb-3" />
                  <p className="text-navy-400 text-sm">No access release events recorded yet.</p>
                </div>
              ) : (
                <ScrollArea className="h-80">
                  <div className="space-y-2 pr-4">
                    {[...accessLogs].reverse().map((log, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-navy-50 border border-navy-100"
                      >
                        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Key size={12} className="text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-navy-800 font-medium truncate">
                            {log.action}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock size={11} className="text-navy-400" />
                            <p className="text-xs text-navy-400">
                              {formatTimestamp(log.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
