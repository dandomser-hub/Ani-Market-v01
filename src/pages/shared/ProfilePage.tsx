import { useApp } from '../../context/AppContext';
import { User, MapPin, Phone, Mail, Shield, PlusCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function ProfilePage() {
  const { currentUser, currentRole } = useApp();
  if (!currentUser) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>

      <div className="card">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-green-700">{currentUser.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{currentUser.name}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge status={currentUser.verificationStatus} />
              <StatusBadge status={currentUser.accountStatus} />
              <span className="badge bg-green-100 text-green-700 capitalize">
                {currentRole === 'supplier' && currentUser.supplierType
                  ? currentUser.supplierType.replace('_', ' ')
                  : currentRole}
              </span>
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
            { icon: <Shield size={15} className="text-gray-400" />, label: 'Verification Status', value: currentUser.verificationStatus },
          ].map(row => (
            <div key={row.label} className="flex items-start gap-3">
              <div className="mt-0.5">{row.icon}</div>
              <div>
                <div className="text-xs text-gray-500">{row.label}</div>
                <div className="text-sm font-medium text-gray-900">{row.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role management */}
      <div className="card">
        <h2 className="section-title mb-4">Role & Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="text-xs text-green-600 mb-1">Primary Role</div>
            <div className="font-bold text-green-900 capitalize">{currentRole}</div>
            <div className="text-xs text-green-700 mt-1">Active role context</div>
          </div>
          {currentUser.additionalRoleRequest && (
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="text-xs text-yellow-600 mb-1">Additional Role Request</div>
              <div className="font-bold text-yellow-900 capitalize">{currentUser.additionalRoleRequest}</div>
              <StatusBadge status={currentUser.additionalRoleStatus ?? 'Pending'} />
            </div>
          )}
        </div>
        {!currentUser.additionalRoleRequest && (
          <button className="btn-secondary text-sm">
            <PlusCircle size={15} /> Request Additional Role Context
          </button>
        )}
        <p className="text-xs text-gray-400 mt-3">
          Role-context switching requires admin approval. Buyer and supplier profiles remain logically separate. Self-dealing is not permitted.
        </p>
      </div>

      {/* Edit form placeholder */}
      <div className="card">
        <h2 className="section-title mb-4">Edit Profile</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name / Organization</label>
              <input className="input" defaultValue={currentUser.name} />
            </div>
            <div>
              <label className="label">Contact Number</label>
              <input className="input" defaultValue={currentUser.contactNumber} />
            </div>
          </div>
          <button className="btn-primary text-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
