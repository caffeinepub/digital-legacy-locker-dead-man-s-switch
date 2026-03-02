import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGetAssets, useAddAsset, useRemoveAsset } from '../hooks/useQueries';
import { ExternalBlob, PersistentCategory } from '../backend';

const categoryLabels: Record<PersistentCategory, string> = {
  [PersistentCategory.banking]: 'Banking',
  [PersistentCategory.socialMedia]: 'Social Media',
  [PersistentCategory.crypto]: 'Crypto',
  [PersistentCategory.cloud]: 'Cloud',
  [PersistentCategory.other]: 'Other',
};

export default function AddAssetPage() {
  const navigate = useNavigate();
  const { data: assets, isLoading } = useGetAssets();
  const addAsset = useAddAsset();
  const removeAsset = useRemoveAsset();

  const [platform, setPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<PersistentCategory | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async () => {
    if (!platform.trim() || !username.trim() || !password.trim() || !category) {
      setFormError('Please fill in all fields.');
      return;
    }
    setFormError('');

    try {
      const encoder = new TextEncoder();
      const passwordBytes = encoder.encode(password);
      const blob = ExternalBlob.fromBytes(passwordBytes);
      const encryptedPassword = { blob, size: BigInt(passwordBytes.length) };

      await addAsset.mutateAsync({
        platform: platform.trim(),
        username: username.trim(),
        encryptedPassword,
        category: category as PersistentCategory,
      });

      setPlatform('');
      setUsername('');
      setPassword('');
      setCategory('');
    } catch (err) {
      console.error('Add asset error:', err);
      setFormError('Failed to add asset. Please try again.');
    }
  };

  const handleRemove = async (idx: number) => {
    try {
      await removeAsset.mutateAsync(BigInt(idx));
    } catch (err) {
      console.error('Remove asset error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Digital Assets</h1>
            <p className="text-sm text-muted-foreground">
              Manage your encrypted digital accounts on Dead Man's Switch
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Asset Form */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add New Asset
              </CardTitle>
              <CardDescription>
                Your credentials are encrypted before being stored on the blockchain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform / Service *</Label>
                <Input
                  id="platform"
                  placeholder="e.g., Gmail, Coinbase, Chase Bank"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="bg-[#1a2230] text-white placeholder:text-gray-400 caret-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username / Email *</Label>
                <Input
                  id="username"
                  placeholder="Your login username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#1a2230] text-white placeholder:text-gray-400 caret-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password / Key *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password or secret key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#1a2230] text-white placeholder:text-gray-400 caret-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as PersistentCategory)}
                >
                  <SelectTrigger className="bg-[#1a2230] text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              <Button
                onClick={handleSubmit}
                disabled={addAsset.isPending}
                className="w-full gap-2"
              >
                {addAsset.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Encrypting & Saving...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Encrypt & Save Asset
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Assets List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Stored Assets
              </CardTitle>
              <CardDescription>
                {assets?.length ?? 0} encrypted asset{(assets?.length ?? 0) !== 1 ? 's' : ''} stored
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-secondary/50 animate-pulse" />
                  ))}
                </div>
              ) : assets && assets.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {assets.map((asset, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                          <Lock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{asset.platform}</p>
                          <p className="text-xs text-muted-foreground truncate">{asset.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Badge variant="outline" className="text-xs hidden sm:flex">
                          {categoryLabels[asset.category]}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemove(idx)}
                          disabled={removeAsset.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Lock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No assets added yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your first encrypted asset using the form
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
