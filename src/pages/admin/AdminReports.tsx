import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { mockDemandPosts, mockTransactions, mockUsers } from '../../data/mockData';

const monthlyActivity = [
  { month: 'Sep', demands: 4, matches: 2, completed: 1 },
  { month: 'Oct', demands: 8, matches: 5, completed: 3 },
  { month: 'Nov', demands: 12, matches: 7, completed: 5 },
  { month: 'Dec', demands: 10, matches: 6, completed: 4 },
  { month: 'Jan', demands: 15, matches: 9, completed: 6 },
];

export default function AdminReports() {
  const totalDemands = mockDemandPosts.length;
  const totalMatches = mockDemandPosts.filter(d => ['Matched', 'In Transaction', 'Completed'].includes(d.status)).length;
  const totalTransactions = mockTransactions.length;
  const totalTxValue = mockTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const activeUsers = mockUsers.filter(u => u.accountStatus === 'Active').length;
  const pendingVerification = mockUsers.filter(u => u.verificationStatus === 'Pending').length;
  const matchRate = totalDemands > 0 ? Math.round((totalMatches / totalDemands) * 100) : 0;

  const categoryCount: Record<string, number> = {};
  mockDemandPosts.forEach(d => {
    categoryCount[d.cropCategory] = (categoryCount[d.cropCategory] ?? 0) + 1;
  });
  const demandByCrop = Object.entries(categoryCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const provinceCount: Record<string, number> = {};
  mockDemandPosts.forEach(d => {
    const short = d.province.replace('Camarines ', 'Cam. ');
    provinceCount[short] = (provinceCount[short] ?? 0) + 1;
  });
  const demandByProvince = Object.entries(provinceCount).map(([province, demands]) => ({ province, demands }));

  const statusGroups: Record<string, { value: number; color: string }> = {
    'Open/Posted': { value: 0, color: '#22c55e' },
    'Response Received': { value: 0, color: '#3b82f6' },
    'Matched': { value: 0, color: '#d97706' },
    'Completed': { value: 0, color: '#16a34a' },
    'Expired/Cancelled': { value: 0, color: '#9ca3af' },
    'Draft': { value: 0, color: '#d1d5db' },
  };
  mockDemandPosts.forEach(d => {
    if (d.status === 'Open' || d.status === 'Posted') statusGroups['Open/Posted'].value++;
    else if (d.status === 'Response Received') statusGroups['Response Received'].value++;
    else if (d.status === 'Matched' || d.status === 'In Transaction') statusGroups['Matched'].value++;
    else if (d.status === 'Completed') statusGroups['Completed'].value++;
    else if (d.status === 'Expired' || d.status === 'Cancelled') statusGroups['Expired/Cancelled'].value++;
    else if (d.status === 'Draft') statusGroups['Draft'].value++;
  });
  const statusBreakdown = Object.entries(statusGroups)
    .filter(([, v]) => v.value > 0)
    .map(([name, { value, color }]) => ({ name, value, color }));

  const reports = [
    { label: 'Total Demand Posts', value: totalDemands, sub: `${mockDemandPosts.filter(d => ['Open', 'Posted'].includes(d.status)).length} currently open` },
    { label: 'Total Matches', value: totalMatches, sub: `${matchRate}% match rate` },
    { label: 'Total Transactions', value: totalTransactions, sub: `₱${(totalTxValue / 1000).toFixed(0)}K total value` },
    { label: 'Active Users', value: activeUsers, sub: `${pendingVerification} pending verification` },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button className="btn-secondary text-sm">Export CSV (Placeholder)</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map(r => (
          <div key={r.label} className="card">
            <div className="text-3xl font-bold text-gray-900 mb-1">{r.value}</div>
            <div className="text-sm text-gray-700 font-medium">{r.label}</div>
            <div className="text-xs text-green-600 mt-1">{r.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="section-title mb-5">Monthly Activity — Mainland Bicol</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="demands" stroke="#22c55e" strokeWidth={2} name="Demand Posts" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="matches" stroke="#d97706" strokeWidth={2} name="Matches" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2} name="Completed" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="section-title mb-5">Demand Posts by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={demandByCrop} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} name="Demand Posts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="section-title mb-5">Demand Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={entry => entry.name}>
                {statusBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="section-title mb-5">Demand by Province (Mainland Bicol)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={demandByProvince}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="province" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="demands" fill="#84cc16" radius={[4, 4, 0, 0]} name="Demand Posts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="section-title mb-4">Report Downloads</h2>
          <div className="space-y-2">
            {[
              'Demand Summary Report', 'Match Summary Report',
              'Transaction Status Report', 'Proof/Reference Submission Report',
              'User Onboarding Report', 'Dispute & Cancellation Report',
              'Crop Demand Report', 'Mainland Bicol Activity Report',
            ].map(r => (
              <div key={r} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{r}</span>
                <button className="text-xs text-green-600 hover:underline font-medium">Export CSV</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
