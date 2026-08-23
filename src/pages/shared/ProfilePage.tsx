import { Link } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Shield, PlusCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';
import type { MarketplaceRole } from '../../types';

export default function ProfilePage() {
  const { currentUser, currentRole, updateCurrentUserTrust } = useApp();
  if (!currentUser) return null;

  const activeMarketplaceRole: MarketplaceRole | null = currentRole === 'buyer' || currentRole === 'supplier' ? currentRole : null;
  const availableRoles = currentUser.roleContext?.availableRoles ?? [currentUser.role];
  const otherRole: MarketplaceRole | null = activeMarketplaceRole === 'buyer' ? 'supplier' : activeMarketplaceRole === 'supplier' ? 'buyer' : null;
  const otherRequestStatus = otherRole ? currentUser.roleRequests?.[otherRole] : undefined;
  const visibleMarketplaceRoles = (['buyer', 'supplier'] as MarketplaceRole[]).filter(role =>
    availableRoles.includes(role) || currentUser.roleRequests?.[role] || role === activeMarketplaceRole
  );

  const requestAdditionalRole = () => {
    if (!otherRole || availableRoles.includes(otherRole) || otherRequestStatus === 'Pending') return;
    updateCurrentUserTrust({
      roleRequests: { ...currentUser.roleRequests, [otherRole]: 'Pending' },
    });
    alert(`${otherRole === 'buyer' ? 'Buyer / Business' : 'Farmer / Supplier'} role request submitted for admin approval.`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="page-header"><h1 className="text-2xl font-bold text-gray-900">My Profile</h1></div>

      <div className="card">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0"><span className="text-2xl font-bold text-green-700">{currentUser.name.charAt(0)}</span></div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{currentUser.name}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge status={currentUser.accountStatus} />
              <span className="badge bg-blue-100 text-blue-700">Email: {currentUser.accountVerification?.emailStatus ?? 'Unverified'}</span>
              <span className="badge bg-blue-100 text-blue-700">Mobile: {currentUser.accountVerification?.mobileStatus ?? 'Unverified'}</span>
              <span className="badge bg-green-100 text-green-700 capitalize">Active: {currentRole}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon: <Mail size={15} className="text-gray-400" />, label: 'Email', value: currentUser.email },
            { icon: <Phone size={15} className="text-gray-400" />, label: 'Contact Number', value: currentUser.contactNumber },
            { icon: <MapPin size={15} className="text-gray-400" />, label: 'Municipality / City', value: currentUser.municipality },
            { icon: <MapPin size={15} className="text-gray-400" />, label: 'Province', value: currentUser.province },
            { icon: <User size={15} className="text-gray-400" />, label: 'Account Created', value: currentUser.createdAt },
            { icon: <Shield size={15} className="text-gray-400" />, label: 'Account Status', value: currentUser.accountStatus },
          ].map(row => (
            <div key={row.label} className="flex items-start gap-3"><div className="mt-0.5">{row.icon}</div><div><div className="text-xs text-gray-500">{row.label}</div><div className="text-sm font-medium text-gray-900">{row.value}</div></div></div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Role Profiles &amp; Marketplace Access</h2>
        <div className="space-y-3">
          {visibleMarketplaceRoles.map(role => {
            const state = currentUser.roleVerifications?.[role];
            const available = availableRoles.includes(role);
            const requestStatus = currentUser.roleRequests?.[role];
            return (
              <div key={role} className={`rounded-xl border p-4 ${role === activeMarketplaceRole ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div><div className="font-bold text-gray-900">{role === 'buyer' ? 'Buyer / Business' : 'Farmer / Supplier'}</div><div className="text-xs text-gray-500 mt-1">{available ? 'Approved role context' : `Role request: ${requestStatus ?? 'Not requested'}`}</div></div>
                  {role === activeMarketplaceRole && <span className="badge bg-green-100 text-green-700">Active context</span>}
                </div>
                {available && (
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                    <div className="rounded-lg bg-white/80 p-2"><span className="block text-gray-400">Profile</span><strong>{state?.profileCompleteness ?? 'Not Started'}</strong></div>
                    <div className="rounded-lg bg-white/80 p-2"><span className="block text-gray-400">Marketplace</span><strong>{state?.marketplaceVerificationStatus ?? 'Not Submitted'}</strong></div>
                    <div className="rounded-lg bg-white/80 p-2"><span className="block text-gray-400">Transactions</span><strong>{state?.transactionAccessStatus ?? 'Disabled'}</strong></div>
                  </div>
                )}
                {available && state?.transactionAccessStatus !== 'Enabled' && (
                  <Link to="/onboarding" className="mt-3 inline-block text-xs font-semibold text-green-700 hover:underline">Continue this role's onboarding / verification</Link>
                )}
              </div>
            );
          })}
        </div>

        {otherRole && !availableRoles.includes(otherRole) && otherRequestStatus !== 'Pending' && (
          <button onClick={requestAdditionalRole} className="btn-secondary text-sm mt-4"><PlusCircle size={15} /> Request {otherRole === 'buyer' ? 'Buyer / Business' : 'Farmer / Supplier'} Role Context</button>
        )}
        {otherRole && otherRequestStatus === 'Pending' && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">Your additional {otherRole} role request is pending admin approval. Approval creates a separate role profile; it does not automatically verify or transaction-enable that role.</div>
        )}
        <p className="text-xs text-gray-400 mt-3">Only one marketplace role context is active at a time. Buyer and Supplier verification remain separate, and self-dealing is prohibited.</p>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Edit Account Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Name / Organization</label><input className="input" defaultValue={currentUser.name} /></div>
          <div><label className="label">Contact Number</label><input className="input" defaultValue={currentUser.contactNumber} /></div>
        </div>
        <button className="btn-primary text-sm mt-4">Save Changes</button>
      </div>
    </div>
  );
}
