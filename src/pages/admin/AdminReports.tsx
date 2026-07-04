import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const demandByCrop = [
  { name: 'Palay', count: 8 }, { name: 'Coconut', count: 5 },
  { name: 'Abaca', count: 3 }, { name: 'Pili Nut', count: 4 },
  { name: 'Corn', count: 3 }, { name: 'Cassava', count: 2 },
];

const demandByProvince = [
  { province: 'Cam. Sur', demands: 12 }, { province: 'Albay', demands: 9 },
  { province: 'Cam. Norte', demands: 4 }, { province: 'Sorsogon', demands: 3 },
];

const statusBreakdown = [
  { name: 'Open/Posted', value: 4, color: '#22c55e' },
  { name: 'Matched', value: 2, color: '#d97706' },
  { name: 'Completed', value: 3, color: '#16a34a' },
  { name: 'Expired', value: 2, color: '#9ca3af' },
  { name: 'Draft', value: 1, color: '#d1d5db' },
];

const monthlyActivity = [
  { month: 'Sep', demands: 4, matches: 2, completed: 1 },
  { month: 'Oct', demands: 8, matches: 5, completed: 3 },
  { month: 'Nov', demands: 12, matches: 7, completed: 5 },
  { month: 'Dec', demands: 10, matches: 6, completed: 4 },
  { month: 'Jan', demands: 15, matches: 9, completed: 6 },
];

export default function AdminReports() {
  const reports = [
    { label: 'Total Demand Posts', value: 28, sub: '+15 this month' },
    { label: 'Total Matches', value: 12, sub: '43% match rate' },
    { label: 'Total Transactions', value: 10, sub: '₱776K total value' },
    { label: 'Active Users', value: 7, sub: '1 pending verification' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button className="btn-secondary text-sm">Export CSV (Placeholder)</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map(r => (
          <div key={r.label} className="card">
            <div className="text-3xl font-bold text-gray-900 mb-1">{r.value}</div>
            <div className="text-sm text-gray-700 font-medium">{r.label}</div>
            <div className="text-xs text-green-600 mt-1">{r.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly activity */}
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
        {/* Demand by crop */}
        <div className="card">
          <h2 className="section-title mb-5">Demand Posts by Crop</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={demandByCrop} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} name="Demand Posts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown */}
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

        {/* Demand by province */}
        <div className="card">
          <h2 className="section-title mb-5">Demand by Province (Mainland Bicol)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={demandByProvince}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="province" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="demands" fill="#84cc16" radius={[4, 4, 0, 0]} name="Demand Posts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Report links */}
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
