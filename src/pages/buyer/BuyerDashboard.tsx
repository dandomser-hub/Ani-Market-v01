import { Link } from 'react-router-dom';
import { FileText, GitMerge, MessageSquare, AlertTriangle, PlusCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { mockDemandPosts, mockTransactions } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

export default function BuyerDashboard() {
  const { currentUser } = useApp();
  const myDemands = mockDemandPosts.filter(d => d.buyerId === currentUser?.id || true).slice(0, 5);
  const active = mockDemandPosts.filter(d => ['Open', 'Posted', 'Response Received'].includes(d.status)).length;
  const matched = mockDemandPosts.filter(d => d.status === 'Matched' || d.status === 'In Transaction').length;
  const pending = mockDemandPosts.filter(d => d.status === 'Response Received').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {currentUser?.name}</p>
        </div>
        <Link to="/buyer/demands/new" className="btn-primary">
          <PlusCircle size={16} /> Post New Demand
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Demand Posts', value: active, icon: <FileText size={20} className="text-green-600" />, bg: 'bg-green-50', border: 'border-green-200', color: 'text-green-700' },
          { label: 'Matched Transactions', value: matched, icon: <GitMerge size={20} className="text-blue-600" />, bg: 'bg-blue-50', border: 'border-blue-200', color: 'text-blue-700' },
          { label: 'Pending Responses', value: pending, icon: <MessageSquare size={20} className="text-amber-600" />, bg: 'bg-amber-50', border: 'border-amber-200', color: 'text-amber-700' },
          { label: 'Disputes / Cancellations', value: 1, icon: <AlertTriangle size={20} className="text-red-500" />, bg: 'bg-red-50', border: 'border-red-200', color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.bg} border ${s.border}`}>
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm`}>
                {s.icon}
              </div>
              <TrendingUp size={14} className="text-gray-300" />
            </div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* My Demand Posts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">My Demand Posts</h2>
          <Link to="/buyer/demands" className="text-sm text-green-600 hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium">Crop</th>
                <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium">Quantity</th>
                <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium">Target Price</th>
                <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium hidden md:table-cell">Required Date</th>
                <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium">Status</th>
                <th className="text-right py-2 px-2 text-xs text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {myDemands.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2">
                    <div className="font-medium text-gray-900">{d.cropName}</div>
                    <div className="text-xs text-gray-500">{d.cropCategory}</div>
                  </td>
                  <td className="py-3 px-2 text-gray-700">{d.quantity.toLocaleString()} {d.unit}</td>
                  <td className="py-3 px-2 text-gray-700">₱{d.targetPrice.toLocaleString()}/{d.unit}</td>
                  <td className="py-3 px-2 text-gray-500 hidden md:table-cell">{d.requiredDate}</td>
                  <td className="py-3 px-2"><StatusBadge status={d.status} /></td>
                  <td className="py-3 px-2 text-right">
                    <Link to={`/buyer/demands/${d.id}`} className="text-xs text-green-600 hover:underline font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-green-600 hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {mockTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No transactions yet.</div>
        ) : (
          <div className="space-y-3">
            {mockTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{t.cropName}</div>
                  <div className="text-xs text-gray-500">{t.supplierName} • {t.quantity.toLocaleString()} {t.unit}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 text-sm">₱{t.totalAmount.toLocaleString()}</div>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
