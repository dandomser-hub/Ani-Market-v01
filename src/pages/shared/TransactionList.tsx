import { Link } from 'react-router-dom';
import { mockTransactions } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

export default function TransactionList() {
  const { currentRole } = useApp();

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
      </div>

      {mockTransactions.length === 0 ? (
        <div className="card text-center py-12 text-gray-400 text-sm">No transactions yet.</div>
      ) : (
        <div className="space-y-4">
          {mockTransactions.map(t => (
            <Link key={t.id} to={`/transactions/${t.id}`} className="block card-hover">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="font-bold text-gray-900">{t.cropName}</div>
                  <div className="text-xs text-gray-500">
                    {currentRole === 'buyer' ? `Supplier: ${t.supplierName}` : `Buyer: ${t.buyerName}`}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={t.status} />
                  <StatusBadge status={t.paymentProofStatus} />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><span className="text-xs text-gray-500 block">Quantity</span>{t.quantity.toLocaleString()} {t.unit}</div>
                <div><span className="text-xs text-gray-500 block">Agreed Price</span>₱{t.agreedPrice.toLocaleString()}</div>
                <div><span className="text-xs text-gray-500 block">Total Amount</span><span className="font-semibold text-gray-900">₱{t.totalAmount.toLocaleString()}</span></div>
                <div><span className="text-xs text-gray-500 block">Matched Date</span>{t.matchedAt}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
