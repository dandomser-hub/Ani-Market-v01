import { Link } from 'react-router-dom';
import {
  Users, FileText, ArrowLeftRight, AlertTriangle, Shield,
  BarChart2, Settings, TrendingUp
} from 'lucide-react';
import { mockUsers, mockDemandPosts, mockTransactions, mockDisputes } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { month: 'Sep', demands: 4, matches: 2 },
  { month: 'Oct', demands: 8, matches: 5 },
  { month: 'Nov', demands: 12, matches: 7 },
  { month: 'Dec', demands: 10, matches: 6 },
  { month: 'Jan', demands: 15, matches: 9 },
];

export default function AdminDashboard() {
  const pendingUsers = mockUsers.filter(u => u.verificationStatus === 'Pending');
  const openDemands = mockDemandPosts.filter(d => ['Open', 'Posted', 'Response Received'].includes(d.status));
  const disputes = mockDisputes.filter(d => d.status === 'Under Review');

  const quickLinks = [
    { to: '/admin/users', icon: <Users size={18} />, label: 'Users & Roles', count: mockUsers.length, sub: `${pendingUsers.length} pending` },
    { to: '/admin/demands', icon: <FileText size={18} />, label: 'Demand Posts', count: mockDemandPosts.length, sub: `${openDemands.length} open` },
    { to: '/admin/transactions', icon: <ArrowLeftRight size={18} />, label: 'Transactions', count: mockTransactions.length, sub: '' },
    { to: '/admin/disputes', icon: <AlertTriangle size={18} />, label: 'Disputes', count: mockDisputes.length, sub: `${disputes.length} under review` },
    { to: '/admin/proof-review', icon: <Shield size={18} />, label: 'Proof Review', count: 1, sub: '1 under review' },
    { to: '/admin/reports', icon: <BarChart2 size={18} />, label: 'Reports', count: null, sub: 'View all reports' },
    { to: '/admin/crop-catalog', icon: <FileText size={18} />, label: 'Crop Catalog', count: 15, sub: '13 active' },
    { to: '/admin/fee-settings', icon: <Settings size={18} />, label: 'Fee Settings', count: null, sub: 'Default 3%' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <span className="badge bg-purple-100 text-purple-700">Admin View</span>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: mockUsers.length, icon: <Users size={20} className="text-blue-600" />, bg: 'bg-blue-50 border-blue-200', color: 'text-blue-700' },
          { label: 'Demand Posts', value: mockDemandPosts.length, icon: <FileText size={20} className="text-green-600" />, bg: 'bg-green-50 border-green-200', color: 'text-green-700' },
          { label: 'Transactions', value: mockTransactions.length, icon: <ArrowLeftRight size={20} className="text-amber-600" />, bg: 'bg-amber-50 border-amber-200', color: 'text-amber-700' },
          { label: 'Active Disputes', value: disputes.length, icon: <AlertTriangle size={20} className="text-red-500" />, bg: 'bg-red-50 border-red-200', color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className={`stat-card border ${s.bg}`}>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">{s.icon}</div>
              <TrendingUp size={14} className="text-gray-300" />
            </div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="card">
        <h2 className="section-title mb-5">Demand &amp; Match Activity (Last 5 Months)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="demands" fill="#22c55e" name="Demand Posts" radius={[4, 4, 0, 0]} />
            <Bar dataKey="matches" fill="#d97706" name="Matches" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickLinks.map(l => (
          <Link key={l.to} to={l.to} className="card-hover flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center text-green-600 border border-green-200">
                {l.icon}
              </div>
              {l.count !== null && (
                <span className="text-xl font-bold text-gray-800">{l.count}</span>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">{l.label}</div>
              <div className="text-xs text-gray-500">{l.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending verification */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Pending User Verification</h2>
          <Link to="/admin/users" className="text-sm text-green-600 hover:underline">View All Users</Link>
        </div>
        {pendingUsers.length === 0 ? (
          <div className="text-sm text-gray-400 py-4 text-center">No pending verifications.</div>
        ) : (
          <div className="space-y-2">
            {pendingUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{u.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{u.role} • {u.municipality}, {u.province}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={u.verificationStatus} />
                  <Link to={`/admin/users`} className="text-xs text-green-600 hover:underline">Review</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proof review queue */}
      <div className="card">
        <h2 className="section-title mb-4">Proof / Reference Review Queue</h2>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
          <div>
            <div className="font-medium text-blue-900 text-sm">Transaction T001 — Palay (RC-216)</div>
            <div className="text-xs text-blue-700">Polangui Farmers Association → Naga Valley Rice Mill</div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="Under Review" />
            <Link to="/admin/proof-review" className="text-xs text-blue-600 hover:underline">Review</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
