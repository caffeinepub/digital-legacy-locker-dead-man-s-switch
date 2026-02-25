import { Shield, Lock, ShieldCheck, AlertTriangle, Cpu } from 'lucide-react';

type BadgeType = 'aes256' | 'e2e' | 'noAccess' | 'pending' | 'verified' | 'rejected' | 'approved';

interface SecurityBadgeProps {
  type: BadgeType;
  text?: string;
  className?: string;
}

const badgeConfig: Record<BadgeType, { icon: React.ReactNode; defaultText: string; className: string }> = {
  aes256: {
    icon: <Cpu size={11} />,
    defaultText: 'AES-256 Encrypted',
    className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-navy-800 text-gold border border-gold/40',
  },
  e2e: {
    icon: <Lock size={11} />,
    defaultText: 'End-to-End Encrypted',
    className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  noAccess: {
    icon: <AlertTriangle size={11} />,
    defaultText: 'No Access During Lifetime',
    className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200',
  },
  pending: {
    icon: <Shield size={11} />,
    defaultText: 'Pending',
    className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200',
  },
  verified: {
    icon: <ShieldCheck size={11} />,
    defaultText: 'Verified',
    className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  rejected: {
    icon: <Shield size={11} />,
    defaultText: 'Rejected',
    className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200',
  },
  approved: {
    icon: <ShieldCheck size={11} />,
    defaultText: 'Approved',
    className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
};

export default function SecurityBadge({ type, text, className = '' }: SecurityBadgeProps) {
  const config = badgeConfig[type];
  return (
    <span className={`${config.className} ${className}`}>
      {config.icon}
      {text ?? config.defaultText}
    </span>
  );
}
