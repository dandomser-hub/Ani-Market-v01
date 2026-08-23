import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { MarketplaceRole } from '../types';

interface Props {
  role: MarketplaceRole;
  compact?: boolean;
}

export default function TransactionAccessNotice({ role, compact = false }: Props) {
  const { currentUser, canTransact, getRoleVerification } = useApp();
  const roleState = getRoleVerification(role);
  const account = currentUser?.accountVerification;

  if (canTransact) {
    if (compact) return null;
    return (
      <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
        <ShieldCheck size={17} className="mt-0.5 flex-shrink-0" />
        <span>Your {role} profile is marketplace verified and transaction enabled.</span>
      </div>
    );
  }

  const reasons: string[] = [];
  if (account?.emailStatus !== 'Verified') reasons.push('verify your email');
  if (account?.mobileStatus !== 'Verified') reasons.push('verify your mobile number');
  if (roleState?.profileCompleteness !== 'Complete') reasons.push(`complete your ${role} profile`);
  if (roleState?.marketplaceVerificationStatus !== 'Verified') reasons.push('complete marketplace verification');
  if (roleState?.transactionAccessStatus === 'Suspended') reasons.push('resolve the role suspension');

  const reasonText = reasons.length > 0
    ? `To transact, ${reasons.join(', ')}.`
    : 'This role is not currently transaction enabled.';

  return (
    <div className={`flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 ${compact ? 'p-3' : 'p-4'}`}>
      <ShieldAlert size={18} className="mt-0.5 flex-shrink-0 text-amber-600" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-amber-800">Transaction access is not yet enabled.</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-700">{reasonText}</p>
        <Link to="/onboarding" className="mt-2 inline-block text-xs font-semibold text-green-700 hover:underline">
          Continue verification and onboarding
        </Link>
      </div>
    </div>
  );
}
