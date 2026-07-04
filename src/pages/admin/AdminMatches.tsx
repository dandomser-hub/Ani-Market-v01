import { Link } from 'react-router-dom';
import { mockTransactions, mockDemandPosts, mockResponses } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function AdminMatches() {
  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Match Monitoring</h1>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Transaction', 'Crop', 'Buyer', 'Supplier', 'Matched Amount', 'Platform Fee (3%)', 'Matched Date', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2 text-xs font-mono text-gray-400">{t.id}</td>
                  <td className="py-3 px-2 font-medium text-gray-900 text-xs">{t.cropName}</td>
                  <td className="py-3 px-2 text-gray-600 text-xs">{t.buyerName}</td>
                  <td className="py-3 px-2 text-gray-600 text-xs">{t.supplierName}</td>
                  <td className="py-3 px-2 font-semibold text-gray-900 text-xs">₱{t.totalAmount.toLocaleString()}</td>
                  <td className="py-3 px-2 text-amber-700 font-semibold text-xs">₱{t.platformFeeAmount.toLocaleString()}</td>
                  <td className="py-3 px-2 text-gray-600 text-xs">{t.matchedAt}</td>
                  <td className="py-3 px-2"><StatusBadge status={t.status} /></td>
                  <td className="py-3 px-2">
                    <Link to={`/transactions/${t.id}`} className="text-xs text-green-600 hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Response Monitoring</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Supplier', 'Type', 'Demand / Crop', 'Offered Qty', 'Offered Price', 'Submitted', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockResponses.map(r => {
                const demand = mockDemandPosts.find(d => d.id === r.demandId);
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-900 text-xs">{r.supplierName}</td>
                    <td className="py-3 px-2 text-gray-500 text-xs capitalize">{r.supplierType.replace('_', ' ')}</td>
                    <td className="py-3 px-2 text-gray-700 text-xs">{demand?.cropName}</td>
                    <td className="py-3 px-2 text-gray-700 text-xs">{r.availableQuantity.toLocaleString()} {r.unit}</td>
                    <td className="py-3 px-2 text-gray-700 text-xs">₱{r.offeredPrice.toLocaleString()}</td>
                    <td className="py-3 px-2 text-gray-500 text-xs">{r.createdAt}</td>
                    <td className="py-3 px-2"><StatusBadge status={r.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
