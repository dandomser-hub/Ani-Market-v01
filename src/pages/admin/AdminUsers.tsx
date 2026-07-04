import { useState } from 'react';
import { Search } from 'lucide-react';
import { mockUsers } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verFilter, setVerFilter] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = mockUsers.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchVer = !verFilter || u.verificationStatus === verFilter;
    return matchSearch && matchRole && matchVer;
  });

  const selectedUser = mockUsers.find(u => u.id === selected);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Users &amp; Roles</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="input w-36" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="buyer">Buyer</option>
            <option value="supplier">Supplier</option>
            <option value="admin">Admin</option>
          </select>
          <select className="input w-40" value={verFilter} onChange={e => setVerFilter(e.target.value)}>
            <option value="">All Verification</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Name', 'Role', 'Location', 'Verification', 'Account', 'Reg. Date', ''].map(h => (
                      <th key={h} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr
                      key={u.id}
                      className={`border-b border-gray-50 cursor-pointer transition-colors ${selected === u.id ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelected(u.id)}
                    >
                      <td className="py-3 px-2">
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`badge text-xs capitalize ${u.role === 'buyer' ? 'bg-amber-100 text-amber-700' : u.role === 'supplier' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                          {u.role}
                        </span>
                        {u.supplierType && <div className="text-xs text-gray-400 capitalize mt-0.5">{u.supplierType.replace('_', ' ')}</div>}
                      </td>
                      <td className="py-3 px-2 text-xs text-gray-500">{u.municipality}<br />{u.province}</td>
                      <td className="py-3 px-2"><StatusBadge status={u.verificationStatus} /></td>
                      <td className="py-3 px-2"><StatusBadge status={u.accountStatus} /></td>
                      <td className="py-3 px-2 text-xs text-gray-500">{u.createdAt}</td>
                      <td className="py-3 px-2">
                        <button onClick={(e) => { e.stopPropagation(); setSelected(u.id); }} className="text-xs text-green-600 hover:underline">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedUser && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">User Profile</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
              </div>
              <div className="space-y-3">
                <div className="text-center py-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-700 font-bold text-xl">{selectedUser.name.charAt(0)}</span>
                  </div>
                  <div className="font-bold text-gray-900">{selectedUser.name}</div>
                  <div className="text-xs text-gray-500">{selectedUser.email}</div>
                  <div className="flex justify-center gap-2 mt-2">
                    <StatusBadge status={selectedUser.verificationStatus} />
                    <StatusBadge status={selectedUser.accountStatus} />
                  </div>
                </div>
                {[
                  { label: 'Role', value: selectedUser.role },
                  { label: 'Supplier Type', value: selectedUser.supplierType?.replace('_', ' ') || '—' },
                  { label: 'Contact', value: selectedUser.contactNumber },
                  { label: 'Municipality', value: selectedUser.municipality },
                  { label: 'Province', value: selectedUser.province },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-medium text-gray-900 capitalize">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <button className="btn-primary w-full justify-center text-sm">Verify Account</button>
                <button className="btn-secondary w-full justify-center text-sm">Suspend Account</button>
              </div>
            </div>

            {selectedUser.additionalRoleRequest && (
              <div className="card bg-yellow-50 border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Additional Role Request</h4>
                <div className="text-sm mb-3">
                  <span className="text-yellow-700">Requested: </span>
                  <span className="font-bold capitalize text-yellow-900">{selectedUser.additionalRoleRequest}</span>
                  <div className="mt-1"><StatusBadge status={selectedUser.additionalRoleStatus ?? 'Pending'} /></div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary flex-1 justify-center text-xs py-1.5">Approve</button>
                  <button className="btn-danger flex-1 justify-center text-xs py-1.5">Reject</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
