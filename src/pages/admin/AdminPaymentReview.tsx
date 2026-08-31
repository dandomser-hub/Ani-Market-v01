import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';
import { getGate1Transactions } from '../../data/gate1CommerceData';
import {
  getPaymentEvidenceReviews,
  getPaymentRecords,
  getPaymentReconciliation,
  getRefundRecords,
  reviewPaymentEvidence,
} from '../../data/gate2PaymentData';

export default function AdminPaymentReview() {
  const { currentUser } = useApp();
  const [revision, setRevision] = useState(0);
  void revision;
  const transactions = getGate1Transactions();

  const review = (transactionId: string, recordId: string, recordType: 'Payment' | 'Refund', status: 'Reviewed for Record' | 'Needs Clarification') => {
    if (!currentUser) return;
    const notes = window.prompt(status === 'Needs Clarification' ? 'Clarification notes:' : 'Optional admin evidence-review notes:') ?? '';
    const result = reviewPaymentEvidence({ transactionId, recordId, recordType, status, notes, adminId: currentUser.id });
    if ('error' in result) window.alert(result.error);
    else setRevision(value => value + 1);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="page-header"><div><h1 className="text-2xl font-bold text-gray-900">Payment Evidence Review</h1><p className="mt-1 text-sm text-gray-500">Administrative evidence review only. Admin does not confirm receipt of Buyer-to-Supplier funds on behalf of the Supplier.</p></div></div>
      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4"><ShieldCheck size={20} className="mt-0.5 flex-shrink-0 text-blue-600" aria-hidden="true" /><p className="text-sm text-blue-800"><strong>Non-custodial control:</strong> “Reviewed for Record” means the evidence record was inspected. It does not mean Ani Market verified bank settlement or received the funds.</p></div>

      {transactions.length === 0 ? <div className="card py-12 text-center text-sm text-gray-400">No Gate 1 Transactions available.</div> : <div className="space-y-5">{transactions.map(transaction => {
        const payments = getPaymentRecords(transaction.id);
        const refunds = getRefundRecords(transaction.id);
        const reconciliation = getPaymentReconciliation(transaction.id);
        return <section key={transaction.id} className="card space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h2 className="font-bold text-gray-900">{transaction.finalTerms.cropName}</h2><div className="text-xs text-gray-500">{transaction.transactionReference} · {transaction.finalTerms.buyerName} ↔ {transaction.finalTerms.supplierName}</div></div><StatusBadge status={reconciliation.status} /></div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><div><span className="block text-xs text-gray-500">Expected</span>₱{reconciliation.expectedPaymentAmount.toLocaleString()}</div><div><span className="block text-xs text-gray-500">Final Payable</span>₱{reconciliation.finalPayableAmount.toLocaleString()}</div><div><span className="block text-xs text-gray-500">Confirmed Paid</span>₱{reconciliation.confirmedPaidAmount.toLocaleString()}</div><div><span className="block text-xs text-gray-500">Outstanding</span>₱{reconciliation.outstandingBalance.toLocaleString()}</div></div>
          {payments.length === 0 && refunds.length === 0 ? <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-400">No payment/refund evidence records yet.</div> : <div className="space-y-3">
            {payments.map(record => { const latestReview = getPaymentEvidenceReviews(record.id)[0]; return <div key={record.id} className="rounded-xl border border-gray-100 p-3"><div className="flex flex-col justify-between gap-2 sm:flex-row"><div><div className="font-semibold">Payment · ₱{record.amount.toLocaleString()} · {record.method}</div><div className="text-xs text-gray-500">{record.externalReference ? `External ref: ${record.externalReference}` : 'No external reference'}{record.evidenceReference ? ` · Evidence: ${record.evidenceReference}` : ''}</div></div><div className="flex flex-wrap gap-2"><StatusBadge status={record.status} />{latestReview && <StatusBadge status={latestReview.status} />}</div></div><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => review(transaction.id, record.id, 'Payment', 'Reviewed for Record')} className="btn-secondary text-xs">Reviewed for Record</button><button onClick={() => review(transaction.id, record.id, 'Payment', 'Needs Clarification')} className="btn-secondary text-xs">Needs Clarification</button></div></div>; })}
            {refunds.map(record => { const latestReview = getPaymentEvidenceReviews(record.id)[0]; return <div key={record.id} className="rounded-xl border border-gray-100 p-3"><div className="flex flex-col justify-between gap-2 sm:flex-row"><div><div className="font-semibold">Refund · ₱{record.amount.toLocaleString()} · {record.method}</div><div className="text-xs text-gray-500">Reason: {record.reason}{record.externalReference ? ` · External ref: ${record.externalReference}` : ''}</div></div><div className="flex flex-wrap gap-2"><StatusBadge status={record.status} />{latestReview && <StatusBadge status={latestReview.status} />}</div></div><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => review(transaction.id, record.id, 'Refund', 'Reviewed for Record')} className="btn-secondary text-xs">Reviewed for Record</button><button onClick={() => review(transaction.id, record.id, 'Refund', 'Needs Clarification')} className="btn-secondary text-xs">Needs Clarification</button></div></div>; })}
          </div>}
        </section>;
      })}</div>}
    </div>
  );
}
