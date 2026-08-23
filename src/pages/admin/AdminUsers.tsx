import { useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { mockUsers } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import {
  enrichUserWithGate1Trust,
  getPrototypeUsers,
  getVerificationRecords,
  saveGate1TrustState,
  saveVerificationRecord,
} from '../../data/gate1TrustData';
import type { MarketplaceRole, VerificationStatus } from '../../types';

const VERIFICATION_FILTERS: VerificationStatus[] = ['Not Submitted', 'Pending Review', 'Needs Information', 'Verified', 'Rejected', 'Suspended'];

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verFilter, setVerFilter] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [revision, setRevision] = useState(0);

  const users = [...mockUsers, ...getPrototypeUsers()].map(enrichUserWithGate1Trust);
  const getMarketplaceRole = (role: string): MarketplaceRole | null => role === 'buyer' || role === 'supplier' ? role : null;
  const getMarketplaceStatus = (user: typeof users[number]) => {
    const role = getMarketplaceRole(user.role);
    if (!role) return 'Verified';
    return user.roleVerifications?.[role]?.marketplaceVerificationStatus ?? (user.verificationStatus === 'Pending' ? 'Pending Review' : user.verificationStatus);
  };

  void revision;

  const filtered = users.filter(user => {
    const matchSearch = !search || user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || user.role === roleFilter;
    const matchVer = !verFilter || getMarketplaceStatus(user) === verFilter;
    return matchSearch && matchRole && matchVer;
  });

  const selectedUser = users.find(user => user.id === selected);
  const selectedRole = selectedUser ? getMarketplaceRole(selectedUser.role) : null;
  const selectedRoleState = selectedRole ? selectedUser?.roleVerifications?.[selectedRole] : undefined;
  const verificationRecords = selectedUser ? getVerificationRecords(selectedUser.id).slice().reverse() : [];
  const persistentPendingRequest = selectedUser
    ? (Object.entries(selectedUser.roleRequests ?? {}).find(([, status]) => status === 'Pending')?.[0] as MarketplaceRole | undefined)
    : undefined;
  const pendingRoleRequest = persistentPendingRequest ?? selectedUser?.additionalRoleRequest;

  const applyDecision = (status: VerificationStatus) => {
    if (!selectedUser || !selectedRole) return;
    const timestamp = new Date().toISOString();
    const previousStatus = selectedRoleState?.marketplaceVerificationStatus;
    const transactionAccessStatus = status === 'Verified' ? 'Enabled' : status === 'Suspended' ? 'Suspended' : 'Disabled';
    const eventType = status === 'Verified'
      ? 'Verified'
      : status === 'Needs Information'
        ? 'Needs Information'
        : status === 'Rejected'
          ? 'Rejected'
          : 'Suspended';

    const nextRoleState = {
      ...(selectedRoleState ?? {
        role: selectedRole,
        profileCompleteness: 'Complete' as const,
        marketplaceVerificationStatus: 'Pending Review' as const,
        transactionAccessStatus: 'Disabled' as const,
      }),
      role: selectedRole,
      profileCompleteness: selectedRoleState?.profileCompleteness ?? 'Complete',
      marketplaceVerificationStatus: status,
      transactionAccessStatus,
      reviewedAt: timestamp,
      verifiedAt: status === 'Verified' ? timestamp : selectedRoleState?.verifiedAt,
      suspendedAt: status === 'Suspended' ? timestamp : undefined,
      decisionReason: decisionReason.trim() || undefined,
    };

    saveGate1TrustState(selectedUser.id, {
      roleVerifications: { ...selectedUser.roleVerifications, [selectedRole]: nextRoleState },
    });
    saveVerificationRecord({
      id: `vr-${selectedUser.id}-${selectedRole}-${Date.now()}`,
      userId: selectedUser.id,
      role: selectedRole,
      fromStatus: previousStatus,
      toStatus: status,
      eventType,
      reason: decisionReason.trim() || undefined,
      actorId: 'admin1',
      actorRole: 'admin',
      createdAt: timestamp,
    });
    setDecisionReason('');
    setRevision(value => value + 1);
  };

  const approveAdditionalRole = () => {
    if (!selectedUser || !pendingRoleRequest) return;
    const availableRoles = Array.from(new Set([...(selectedUser.roleContext?.availableRoles ?? [selectedUser.role]), pendingRoleRequest]));
    saveGate1TrustState(selectedUser.id, {
      roleContext: { activeRole: selectedUser.roleContext?.activeRole ?? selectedUser.role, availableRoles },
      roleRequests: { ...selectedUser.roleRequests, [pendingRoleRequest]: 'Approved' },
      roleVerifications: {
        ...selectedUser.roleVerifications,
        [pendingRoleRequest]: selectedUser.roleVerifications?.[pendingRoleRequest] ?? {
          role: pendingRoleRequest,
          profileCompleteness: 'Not Started',
          marketplaceVerificationStatus: 'Not Submitted',
          transactionAccessStatus: 'Disabled',
        },
      },
      onboardingProgress: { ...selectedUser.onboardingProgress, [pendingRoleRequest]: 'Not Started' },
    });
    setRevision(value => value + 1);
  };

  const rejectAdditionalRole = () => {
    if (!selectedUser || !pendingRoleRequest) return;
    saveGate1TrustState(selectedUser.id, {
      roleRequests: { ...selectedUser.roleRequests, [pendingRoleRequest]: 'Rejected' },
    });
    setRevision(value => value + 1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header"><h1 className="text-2xl font-bold text-gray-900">Users &amp; Roles</h1></div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input className="input pl-9" placeholder="Search by name or email..." value={search} onChange={event => setSearch(event.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="input w-36" value={roleFilter} onChange={event => setRoleFilter(event.target.value)}>
            <option value="">All Roles</option><option value="buyer">Buyer</option><option value="supplier">Supplier</option><option value="admin">Admin</option>
          </select>
          <select className="input w-48" value={verFilter} onChange={event => setVerFilter(event.target.value)}>
            <option value="">All Verification</option>{VERIFICATION_FILTERS.map(status => <option key={status}>{status}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200">{['Name', 'Role', 'Location', 'Marketplace Verification', 'Access', ''].map(header => <th key={header} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold">{header}</th>)}</tr></thead>
              <tbody>
                {filtered.map(user => {
                  const role = getMarketplaceRole(user.role);
                  const roleState = role ? user.roleVerifications?.[role] : undefined;
                  return (
                    <tr key={user.id} onClick={() => setSelected(user.id)} className={`border-b border-gray-50 cursor-pointer ${selected === user.id ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                      <td className="py-3 px-2"><div className="font-medium text-gray-900">{user.name}</div><div className="text-xs text-gray-400">{user.email}</div></td>
                      <td className="py-3 px-2"><span className="badge bg-gray-100 text-gray-700 capitalize">{user.role}</span></td>
                      <td className="py-3 px-2 text-xs text-gray-500">{user.municipality}<br />{user.province}</td>
                      <td className="py-3 px-2"><StatusBadge status={getMarketplaceStatus(user)} /></td>
                      <td className="py-3 px-2"><StatusBadge status={roleState?.transactionAccessStatus ?? user.accountStatus} /></td>
                      <td className="py-3 px-2 text-right"><button className="text-xs text-green-600 hover:underline">Review</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {selectedUser && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-gray-900">Marketplace Verification</h3><button onClick={() => setSelected(null)} className="text-gray-400 text-lg">&times;</button></div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100"><span className="text-xl font-bold text-green-700">{selectedUser.name.charAt(0)}</span></div>
                <div className="font-bold text-gray-900">{selectedUser.name}</div><div className="text-xs text-gray-500">{selectedUser.email}</div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3"><span className="text-gray-500">Role</span><strong className="capitalize">{selectedUser.role}</strong></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500">Email</span><strong>{selectedUser.accountVerification?.emailStatus ?? 'Unverified'}</strong></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500">Mobile</span><strong>{selectedUser.accountVerification?.mobileStatus ?? 'Unverified'}</strong></div>
                {selectedRole && <><div className="flex justify-between gap-3"><span className="text-gray-500">Profile</span><strong>{selectedRoleState?.profileCompleteness ?? 'Not Started'}</strong></div><div className="flex justify-between gap-3"><span className="text-gray-500">Marketplace</span><strong>{selectedRoleState?.marketplaceVerificationStatus ?? 'Not Submitted'}</strong></div><div className="flex justify-between gap-3"><span className="text-gray-500">Transaction Access</span><strong>{selectedRoleState?.transactionAccessStatus ?? 'Disabled'}</strong></div></>}
              </div>

              {selectedRole && (
                <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
                  <label className="label">Decision reason / review note</label>
                  <textarea className="input resize-none" rows={2} value={decisionReason} onChange={event => setDecisionReason(event.target.value)} placeholder="Required when clarification, rejection, or suspension needs explanation" />
                  <button onClick={() => applyDecision('Verified')} className="btn-primary w-full justify-center text-sm"><ShieldCheck size={15} /> Verify Role & Enable Transactions</button>
                  <button onClick={() => applyDecision('Needs Information')} className="btn-secondary w-full justify-center text-sm">Needs Information</button>
                  <button onClick={() => applyDecision('Rejected')} className="btn-danger w-full justify-center text-sm">Reject Role Verification</button>
                  <button onClick={() => applyDecision('Suspended')} className="btn-danger w-full justify-center text-sm bg-orange-600 hover:bg-orange-700">Suspend Role Access</button>
                </div>
              )}
            </div>

            {verificationRecords.length > 0 && (
              <div className="card">
                <h4 className="font-semibold text-gray-800 mb-3">Verification History</h4>
                <div className="space-y-3 max-h-52 overflow-y-auto">
                  {verificationRecords.map(record => <div key={record.id} className="border-l-2 border-green-200 pl-3 text-xs"><div className="font-semibold text-gray-700">{record.eventType} → {record.toStatus}</div><div className="text-gray-400">{record.createdAt}</div>{record.reason && <div className="mt-1 text-gray-500">{record.reason}</div>}</div>)}
                </div>
              </div>
            )}

            {pendingRoleRequest && (
              <div className="card bg-yellow-50 border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Additional Role Request</h4>
                <p className="text-sm text-yellow-700">Requested: <strong className="capitalize">{pendingRoleRequest}</strong></p>
                <p className="mt-2 text-xs text-yellow-700">Approval only creates the role context. The new role must complete its own onboarding and marketplace verification before transactions are enabled.</p>
                <div className="mt-3 flex gap-2"><button onClick={approveAdditionalRole} className="btn-primary flex-1 justify-center text-xs">Approve Role Context</button><button onClick={rejectAdditionalRole} className="btn-danger flex-1 justify-center text-xs">Reject</button></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
