import { Link } from 'react-router-dom';
import { mockTransactions } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function AdminTransactions() {
  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Transaction Monitoring</h1>
      </div>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['ID', 'Crop', 'Buyer', 'Supplier', 'Qty', 'Total Amount', 'Platform Fee (3%)', 'Status', 'Payment Proof', ''].map(h => (
                  <th key={h} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2 text-xs text-gray-400 font-mono">{t.id}</td>
                  <td className="py-3 px-2 font-medium text-gray-900 text-xs">{t.cropName}</td>
                  <td className="py-3 px-2 text-gray-600 text-xs">{t.buyerName}</td>
                  <td className="py-3 px-2 text-gray-600 text-xs">{t.supplierName}</td>
                  <td className="py-3 px-2 text-gray-600 text-xs whitespace-nowrap">{t.quantity.toLocaleString()} {t.unit}</td>
                  <td className="py-3 px-2 text-gray-900 font-semibold text-xs">₱{t.totalAmount.toLocaleString()}</td>
                  <td className="py-3 px-2 text-amber-700 font-semibold text-xs">₱{t.platformFeeAmount.toLocaleString()}</td>
                  <td className="py-3 px-2"><StatusBadge status={t.status} /></td>
                  <td className="py-3 px-2"><StatusBadge status={t.paymentProofStatus} /></td>
                  <td className="py-3 px-2">
                    <Link to={`/transactions/${t.id}`} className="text-xs text-green-600 hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
