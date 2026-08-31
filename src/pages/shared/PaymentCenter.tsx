import { Link } from 'react-router-dom';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getGate1Transactions } from '../../data/gate1CommerceData';
import { getPaymentReconciliation } from '../../data/gate2PaymentData';
import StatusBadge from '../../components/StatusBadge';

export default function PaymentCenter() {
  const { currentUser, currentRole } = useApp();
  const transactions = getGate1Transactions().filter(transaction =>
    currentRole === 'admin' || transaction.buyerId === currentUser?.id || transaction.supplierId === currentUser?.id,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Reconciliation</h1>
          <p className="mt-1 text-sm text-gray-500">External Buyer-to-Supplier payments recorded under the accepted Chunk 7 non-custodial model.</p>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <ShieldCheck size={20} className="mt-0.5 flex-shrink-0 text-blue-600" aria-hidden="true" />
        <div className="text-sm text-blue-800">
          <strong>Ani Market does not receive, hold, settle, or release Buyer funds.</strong> Payment records document external transactions between Buyer and Supplier. “Paid” means Supplier-confirmed within Ani Market records, not bank-certified settlement.
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="card py-12 text-center text-sm text-gray-400">No committed Gate 1 Transactions are available for payment reconciliation yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {transactions.map(transaction => {
            const reconciliation = getPaymentReconciliation(transaction.id);
            const terms = transaction.finalTerms;
            return (
              <Link key={transaction.id} to={`/payments/${transaction.id}`} className="card-hover block">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard size={17} className="text-green-600" aria-hidden="true" />
                      <h2 className="font-bold text-gray-900">{terms.cropName}</h2>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">{transaction.transactionReference}</div>
                    <div className="mt-1 text-xs text-gray-500">{terms.buyerName} ↔ {terms.supplierName}</div>
                  </div>
                  <StatusBadge status={reconciliation.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div><span className="block text-xs text-gray-500">Expected</span><strong>₱{reconciliation.expectedPaymentAmount.toLocaleString()}</strong></div>
                  <div><span className="block text-xs text-gray-500">Final Payable</span><strong>₱{reconciliation.finalPayableAmount.toLocaleString()}</strong></div>
                  <div><span className="block text-xs text-gray-500">Confirmed Paid</span><strong className="text-green-700">₱{reconciliation.confirmedPaidAmount.toLocaleString()}</strong></div>
                  <div><span className="block text-xs text-gray-500">Outstanding</span><strong className={reconciliation.outstandingBalance > 0 ? 'text-amber-700' : 'text-gray-900'}>₱{reconciliation.outstandingBalance.toLocaleString()}</strong></div>
                </div>
                <div className="mt-3 text-xs text-gray-400">Current reconciliation basis: {reconciliation.reconciliationBasis}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
