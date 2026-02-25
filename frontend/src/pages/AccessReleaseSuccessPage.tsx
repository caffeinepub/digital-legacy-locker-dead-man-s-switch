import { useRouter } from '@tanstack/react-router';
import { CheckCircle, Shield, Key, ArrowRight, Clock, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccessReleaseSuccessPage() {
  const router = useRouter();
  const timestamp = new Date().toLocaleString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse-glow">
              <div className="w-16 h-16 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-glow p-8 text-center">
          <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">
            Access Released Successfully
          </h1>
          <p className="text-navy-500 mb-6">
            The digital assets have been securely released to the designated nominees following
            verified legal confirmation.
          </p>

          {/* Summary */}
          <div className="bg-navy-50 rounded-xl p-5 text-left space-y-3 mb-6">
            <h3 className="font-semibold text-navy-900 text-sm flex items-center gap-2">
              <Shield size={15} className="text-primary" /> Release Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-500 flex items-center gap-1.5">
                  <Clock size={13} /> Timestamp
                </span>
                <span className="text-navy-900 font-medium">{timestamp}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-500 flex items-center gap-1.5">
                  <Key size={13} /> Action
                </span>
                <span className="text-navy-900 font-medium">Access Released</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-500 flex items-center gap-1.5">
                  <Lock size={13} /> Authorization
                </span>
                <span className="text-emerald-600 font-medium">Multi-Layer Verified</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-500 flex items-center gap-1.5">
                  <Shield size={13} /> Audit Trail
                </span>
                <span className="text-emerald-600 font-medium">Recorded on Blockchain</span>
              </div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle size={11} /> Legally Verified
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Shield size={11} /> Admin Authorized
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-navy-100 text-navy-700 border border-navy-200">
              <Lock size={11} /> Immutably Logged
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full gap-2"
              onClick={() => router.navigate({ to: '/admin/legal-verification' })}
            >
              Back to Legal Verification
              <ArrowRight size={16} />
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.navigate({ to: '/dashboard' })}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-navy-400 text-xs mt-6">
          This release event has been permanently recorded on the Internet Computer blockchain and
          cannot be modified or deleted.
        </p>
      </div>
    </div>
  );
}
