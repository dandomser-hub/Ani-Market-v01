import { Link } from 'react-router-dom';
import { mockTransactions } from '../../data/mockData';
import { getGate1Transactions } from '../../data/gate1CommerceData';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

export default function TransactionList() {
  const { currentRole, currentUser } = useApp();
  const gate1Transactions = getGate1Transactions().filter(transaction => currentRole === 'admin' || transaction.buyerId === currentUser?.id || transaction.supplierId === currentUser?.id);
  const legacyTransactions = mockTransactions.filter(transaction => currentRole === 'admin' || transaction.buyerId === currentUser?.id || transaction.supplierId === currentUser?.id);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="page-header"><div><h1 className="text-2xl font-bold text-gray-900">Transactions</h1><p className="mt-1 text-sm text-gray-500">Gate 1 Transactions originate from Mutual Commitment. Legacy Matched records remain historical only.</p></div></div>

      {gate1Transactions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Gate 1 Committed Transactions</h2>
          {gate1Transactions.map(transaction => (
            <Link key={transaction.id} to={`/gate1-transactions/${transaction.id}`} className="block card-hover">
              <div className="flex items-start justify-between gap-4 mb-3"><div><div className="font-bold text-gray-900">{transaction.finalTerms.cropName}</div><div className="text-xs text-gray-500">{currentRole === 'buyer' ? `Supplier: ${transaction.finalTerms.supplierName}` : currentRole === 'supplier' ? `Buyer: ${transaction.finalTerms.buyerName}` : `${transaction.finalTerms.buyerName} ↔ ${transaction.finalTerms.supplierName}`}</div><div className="mt-1 text-xs font-mono text-gray-400">{transaction.transactionReference}</div></div><StatusBadge status={transaction.status} /></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm"><div><span className="text-xs text-gray-500 block">Historical Committed</span>{transaction.historicalCommittedQuantity.toLocaleString()} {transaction.finalTerms.unit}</div><div><span className="text-xs text-gray-500 block">Agreed Price</span>₱{transaction.finalTerms.agreedTransactionPrice.toLocaleString()}</div><div><span className="text-xs text-gray-500 block">Committed Value</span><span className="font-semibold">₱{transaction.committedTransactionValue.toLocaleString()}</span></div><div><span className="text-xs text-gray-500 block">Final Value</span><span className="font-semibold">₱{transaction.finalTransactionValue.toLocaleString()}</span></div></div>
            </Link>
          ))}
        </section>
      )}

      {legacyTransactions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Legacy Matched Transactions — historical prototype</h2>
          {legacyTransactions.map(transaction => (
            <Link key={transaction.id} to={`/transactions/${transaction.id}`} className="block card-hover opacity-80">
              <div className="flex items-start justify-between gap-4 mb-3"><div><div className="font-bold text-gray-900">{transaction.cropName}</div><div className="text-xs text-gray-500">{currentRole === 'buyer' ? `Supplier: ${transaction.supplierName}` : `Buyer: ${transaction.buyerName}`}</div></div><div className="flex flex-col items-end gap-1"><StatusBadge status={transaction.status} /><span className="text-xs text-amber-600">Legacy Match model</span></div></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm"><div><span className="text-xs text-gray-500 block">Quantity</span>{transaction.quantity.toLocaleString()} {transaction.unit}</div><div><span className="text-xs text-gray-500 block">Agreed Price</span>₱{transaction.agreedPrice.toLocaleString()}</div><div><span className="text-xs text-gray-500 block">Legacy Total</span>₱{transaction.totalAmount.toLocaleString()}</div><div><span className="text-xs text-gray-500 block">Matched Date</span>{transaction.matchedAt}</div></div>
            </Link>
          ))}
        </section>
      )}

      {gate1Transactions.length === 0 && legacyTransactions.length === 0 && <div className="card text-center py-12 text-gray-400 text-sm">No transactions yet.</div>}
    </div>
  );
}
