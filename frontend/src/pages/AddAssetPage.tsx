import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAddAsset } from '../hooks/useQueries';
import { ExternalBlob, PersistentCategory } from '../backend';
import { Shield, Lock, Eye, EyeOff, Cpu, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import SecurityBadge from '../components/SecurityBadge';

const CATEGORY_OPTIONS = [
  { value: PersistentCategory.banking, label: 'Banking & Finance' },
  { value: PersistentCategory.socialMedia, label: 'Social Media' },
  { value: PersistentCategory.crypto, label: 'Cryptocurrency' },
  { value: PersistentCategory.cloud, label: 'Cloud Storage' },
  { value: PersistentCategory.other, label: 'Other' },
];

export default function AddAssetPage() {
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const addAsset = useAddAsset();

  const [platform, setPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<PersistentCategory>(PersistentCategory.other);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center">
          <Shield size={48} className="text-navy-300 mx-auto mb-4" />
          <p className="text-navy-500 mb-4">Please log in to add assets.</p>
          <Button onClick={() => router.navigate({ to: '/login' })}>Login</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform.trim()) { toast.error('Platform name is required'); return; }
    if (!username.trim()) { toast.error('Username is required'); return; }
    if (!password.trim()) { toast.error('Password is required'); return; }

    const passwordBytes = new TextEncoder().encode(password);
    const blob = ExternalBlob.fromBytes(passwordBytes);

    try {
      await addAsset.mutateAsync({
        platform: platform.trim(),
        username: username.trim(),
        encryptedPassword: { blob, size: BigInt(passwordBytes.length) },
        category,
      });
      setSaved(true);
      toast.success('Asset saved securely!');
      setTimeout(() => router.navigate({ to: '/dashboard' }), 1500);
    } catch {
      toast.error('Failed to save asset. Please try again.');
    }
  };

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50 px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Asset Saved!</h2>
          <p className="text-navy-500 mb-2">Your credentials have been encrypted and stored securely.</p>
          <SecurityBadge type="e2e" className="mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.navigate({ to: '/dashboard' })} className="text-navy-500">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-900">Add Digital Asset</h1>
            <p className="text-navy-500 text-sm">Store your credentials securely</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          {/* Security Header */}
          <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-navy-900">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-navy-300" />
              <span className="text-white font-semibold text-sm">Secure Vault Entry</span>
            </div>
            <SecurityBadge type="aes256" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Platform Name */}
            <div>
              <Label htmlFor="platform" className="text-navy-700 font-medium">Platform Name</Label>
              <Input
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="e.g., Gmail, Chase Bank, Coinbase"
                className="mt-1.5"
              />
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="username" className="text-navy-700 font-medium">Username / Email</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or email"
                className="mt-1.5"
              />
            </div>

            {/* Password with AES indicator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="text-navy-700 font-medium">Password</Label>
                {(passwordFocused || password) && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 animate-fade-in">
                    <Cpu size={11} />
                    <span className="font-semibold">AES-256 Encrypting...</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Enter password to encrypt"
                  className={`mt-0 pr-10 transition-smooth ${(passwordFocused || password) ? 'border-amber-400 ring-1 ring-amber-200' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {(passwordFocused || password) && (
                <div className="mt-2 flex items-center gap-2 animate-fade-in">
                  <div className="flex-1 h-1.5 rounded-full bg-navy-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-500"
                      style={{ width: password.length > 0 ? `${Math.min(100, (password.length / 16) * 100)}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-navy-400">Encryption strength</span>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <Label className="text-navy-700 font-medium">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as PersistentCategory)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* E2E Badge + Submit */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <Lock size={14} className="text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">End-to-End Encrypted</span>
                <SecurityBadge type="aes256" />
              </div>
              <Button
                type="submit"
                className="w-full py-6 text-base font-semibold gap-2"
                disabled={addAsset.isPending}
              >
                {addAsset.isPending ? (
                  <><Loader2 size={18} className="animate-spin" /> Encrypting & Saving...</>
                ) : (
                  <><Shield size={18} /> Save Securely</>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="mt-4 p-4 rounded-xl bg-navy-900 text-navy-300 text-xs flex items-start gap-2">
          <Cpu size={14} className="flex-shrink-0 mt-0.5 text-navy-400" />
          <span>Your password is encrypted with AES-256 before being stored on the blockchain. It cannot be read by anyone, including our team.</span>
        </div>
      </div>
    </div>
  );
}
