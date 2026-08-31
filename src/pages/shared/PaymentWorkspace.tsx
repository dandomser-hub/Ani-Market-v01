import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Banknote, CheckCircle, FileText, RefreshCcw, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';
import { getGate1Transactions } from '../../data/gate1CommerceData';
import {
  acceptPaymentTerms,
  buildPaymentSchedule,
  confirmPaymentReceived,
  confirmRefundReceived,
  getCurrentPaymentTerms,
  getPaymentEvents,
  getPaymentRecords,
  getPaymentReconciliation,
  getPaymentTermsVersions,
  getRefundRecords,
  proposePaymentTerms,
  raisePaymentIssue,
  raiseRefundIssue,
  recordCashReceived,
  reportPaymentSent,
  reportRefundSent,
  withdrawPaymentReport,
} from '../../data/gate2PaymentData';
import type { PaymentMethod, PaymentTermsType } from '../../types/payment';

const METHODS: PaymentMethod[] = ['Bank Transfer', 'GCash', 'Maya', 'QR Ph', 'Cash / COD', 'Check', 'Other External Method'];
const TERMS_TYPES: PaymentTermsType[] = ['Full Prepayment', 'Payment on Buyer Acceptance', 'Cash on Delivery', 'Advance + Balance', 'Staged / Milestone', 'Credit Terms', 'Other Agreed Arrangement'];

export default function PaymentWorkspace() {
  const { id } = useParams();
  const { currentUser, currentRole } = useApp();
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState('');
  const [termsType, setTermsType] = useState<PaymentTermsType>('Payment on Buyer Acceptance');
  const [preferredMethod, setPreferredMethod] = useState<PaymentMethod>('Bank Transfer');
  const [advancePercent, setAdvancePercent] = useState('20');
  const [creditDays, setCreditDays] = useState('15');
  const [dueDate, setDueDate] = useState('');
  const [termsNotes, setTermsNotes] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentEvidence, setPaymentEvidence] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState<PaymentMethod>('Bank Transfer');
  const [refundReason, setRefundReason] = useState('');
  const [refundReference, setRefundReference] = useState('');
  void revision;

  const transaction = getGate1Transactions().find(item => item.id === id);
  const isBuyer = Boolean(transaction && currentUser?.id === transaction.buyerId);
  const isSupplier = Boolean(transaction && currentUser?.id === transaction.supplierId);
  const authorized = currentRole === 'admin' || isBuyer || isSupplier;

  const currentTerms = transaction ? getCurrentPaymentTerms(transaction.id) : undefined;
  const termsVersions = transaction ? getPaymentTermsVersions(transaction.id) : [];
  const payments = transaction ? getPaymentRecords(transaction.id) : [];
  const refunds = transaction ? getRefundRecords(transaction.id) : [];
  const reconciliation = transaction ? getPaymentReconciliation(transaction.id) : undefined;
  const events = transaction ? getPaymentEvents(transaction.id) : [];
  const termsSchedulePreview = useMemo(() => transaction ? buildPaymentSchedule(termsType, transaction.committedTransactionValue, {
    advancePercent: Number(advancePercent) || 20,
    creditDays: Number(creditDays) || 15,
    dueDate: dueDate || undefined,
  }) : [], [transaction, termsType, advancePercent, creditDays, dueDate]);

  if (!transaction) return <div className="card mx-auto max-w-3xl">Payment Transaction not found.</div>;
  if (!authorized) return <div className="card mx-auto max-w-3xl">You are not authorized to view this payment record.</div>;

  const participantRole = isBuyer ? 'buyer' as const : isSupplier ? 'supplier' as const : undefined;

  const refresh = (text: string) => {
    setMessage(text);
    setRevision(value => value + 1);
  };

  const handleProposeTerms = () => {
    if (!currentUser || !participantRole) return;
    const result = proposePaymentTerms({
      transactionId: transaction.id,
      actorId: currentUser.id,
      actorRole: participantRole,
      termsType,
      preferredMethod,
      schedule: termsSchedulePreview,
      notes: termsNotes,
    });
    refresh('error' in result ? (result.error ?? 'Unable to propose payment terms.') : `Payment terms v${result.terms.versionNumber} proposed. The other party must accept the same version before payment can be recorded.`);
  };

  const handleAcceptTerms = () => {
    if (!currentUser || !participantRole) return;
    const result = acceptPaymentTerms(transaction.id, currentUser.id, participantRole);
    refresh('error' in result ? (result.error ?? 'Unable to accept payment terms.') : result.terms.status === 'Agreed' ? 'Both parties accepted the same payment terms. The snapshot is now locked.' : 'Your acceptance is recorded. Waiting for the other party.');
  };

  const handleReportPayment = () => {
    if (!currentUser || !isBuyer) return;
    const result = reportPaymentSent({
      transactionId: transaction.id,
      buyerId: currentUser.id,
      amount: Number(paymentAmount),
      method: paymentMethod,
      externalReference: paymentReference,
      evidenceReference: paymentEvidence,
    });
    if ('error' in result) return refresh(result.error ?? 'Unable to record payment report.');
    setPaymentAmount(''); setPaymentReference(''); setPaymentEvidence('');
    refresh('Payment recorded as Buyer Reported Payment Sent. It will count as Confirmed Paid only after Supplier confirmation.');
  };

  const handleCashReceived = () => {
    if (!currentUser || !isSupplier) return;
    const result = recordCashReceived({ transactionId: transaction.id, supplierId: currentUser.id, amount: Number(cashAmount), notes: 'Supplier direct cash/COD receipt acknowledgment.' });
    if ('error' in result) return refresh(result.error ?? 'Unable to record cash received.');
    setCashAmount('');
    refresh('Cash/COD receipt recorded as Supplier Confirmed Received.');
  };

  const handleRefund = () => {
    if (!currentUser || !isSupplier) return;
    const result = reportRefundSent({
      transactionId: transaction.id,
      supplierId: currentUser.id,
      amount: Number(refundAmount),
      method: refundMethod,
      reason: refundReason,
      externalReference: refundReference,
    });
    if ('error' in result) return refresh(result.error ?? 'Unable to report refund.');
    setRefundAmount(''); setRefundReason(''); setRefundReference('');
    refresh('Refund recorded as Supplier Reported Refund Sent. It reduces Net Confirmed Paid only after Buyer confirmation.');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/payments" className="btn-ghost px-3 py-1.5"><ArrowLeft size={16} /> Back</Link>
        <div className="min-w-0 flex-1"><h1 className="text-xl font-bold text-gray-900">Payment & Reconciliation</h1><p className="text-xs text-gray-500">{transaction.transactionReference} · {transaction.finalTerms.cropName}</p></div>
        {reconciliation && <StatusBadge status={reconciliation.status} size="md" />}
      </div>

      {message && <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">{message}</div>}

      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <ShieldCheck size={20} className="mt-0.5 flex-shrink-0 text-blue-600" aria-hidden="true" />
        <div className="text-sm text-blue-800"><strong>External settlement only.</strong> Ani Market records payment terms, evidence and participant acknowledgments. It does not receive, hold, settle or release funds, and it does not certify bank settlement.</div>
      </div>

      {reconciliation && (
        <div className="card">
          <h2 className="section-title mb-4">Payment Reconciliation</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div><span className="block text-xs text-gray-500">Expected Payment</span><strong>₱{reconciliation.expectedPaymentAmount.toLocaleString()}</strong></div>
            <div><span className="block text-xs text-gray-500">Final Payable</span><strong>₱{reconciliation.finalPayableAmount.toLocaleString()}</strong></div>
            <div><span className="block text-xs text-gray-500">Confirmed Paid</span><strong className="text-green-700">₱{reconciliation.confirmedPaidAmount.toLocaleString()}</strong></div>
            <div><span className="block text-xs text-gray-500">Confirmed Refunds</span><strong>₱{reconciliation.confirmedRefundAmount.toLocaleString()}</strong></div>
            <div><span className="block text-xs text-gray-500">Outstanding</span><strong className="text-amber-700">₱{reconciliation.outstandingBalance.toLocaleString()}</strong></div>
            <div><span className="block text-xs text-gray-500">Refund Due</span><strong className="text-red-700">₱{reconciliation.refundDue.toLocaleString()}</strong></div>
          </div>
          <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">Current target: <strong>₱{reconciliation.reconciliationTargetAmount.toLocaleString()}</strong> using {reconciliation.reconciliationBasis}. Final Payable is considered finalized when no Active Committed quantity remains.</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between gap-3"><h2 className="section-title">Payment Terms Snapshot</h2>{currentTerms && <StatusBadge status={currentTerms.status} />}</div>
            {!currentTerms ? <p className="mt-3 text-sm text-gray-500">No payment terms have been proposed yet.</p> : (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm"><div><span className="block text-xs text-gray-500">Version</span><strong>v{currentTerms.versionNumber}</strong></div><div><span className="block text-xs text-gray-500">Arrangement</span><strong>{currentTerms.termsType}</strong></div><div><span className="block text-xs text-gray-500">Preferred Method</span><strong>{currentTerms.preferredMethod ?? 'Not specified'}</strong></div><div><span className="block text-xs text-gray-500">Locked</span><strong>{currentTerms.lockedAt ? new Date(currentTerms.lockedAt).toLocaleString() : 'Pending'}</strong></div></div>
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-200">{['Stage', '%', 'Amount', 'Due Basis'].map(header => <th key={header} className="px-2 py-2 text-left text-xs text-gray-500">{header}</th>)}</tr></thead><tbody>{currentTerms.schedule.map(stage => <tr key={stage.id} className="border-b border-gray-50"><td className="px-2 py-2">{stage.label}</td><td className="px-2 py-2">{stage.percentage ?? '—'}</td><td className="px-2 py-2">{stage.amount !== undefined ? `₱${stage.amount.toLocaleString()}` : '—'}</td><td className="px-2 py-2">{stage.dueBasis}{stage.daysAfterAcceptance ? ` (${stage.daysAfterAcceptance} days)` : ''}{stage.dueDate ? ` (${stage.dueDate})` : ''}</td></tr>)}</tbody></table></div>
                {currentTerms.notes && <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{currentTerms.notes}</div>}
                <div className="grid grid-cols-2 gap-3 text-xs"><div className="rounded-lg border border-gray-100 p-2">Buyer acceptance: <strong>{currentTerms.buyerAcceptedAt ? 'Recorded' : 'Pending'}</strong></div><div className="rounded-lg border border-gray-100 p-2">Supplier acceptance: <strong>{currentTerms.supplierAcceptedAt ? 'Recorded' : 'Pending'}</strong></div></div>
                {participantRole && currentTerms.status === 'Pending Agreement' && ((participantRole === 'buyer' && !currentTerms.buyerAcceptedAt) || (participantRole === 'supplier' && !currentTerms.supplierAcceptedAt)) && <button onClick={handleAcceptTerms} className="btn-primary"><CheckCircle size={15} /> Accept Current Terms Version</button>}
              </div>
            )}
          </div>

          {participantRole && (
            <div className="card border-green-200">
              <h2 className="section-title mb-2">{currentTerms?.status === 'Agreed' ? 'Propose Payment Terms Amendment' : 'Propose Payment Terms'}</h2>
              <p className="mb-4 text-xs text-gray-500">A new proposal creates a new version. The proposer accepts that version automatically; the other party must accept the same version before it becomes the locked payment-terms snapshot.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className="label">Arrangement</label><select className="input" value={termsType} onChange={event => setTermsType(event.target.value as PaymentTermsType)}>{TERMS_TYPES.map(item => <option key={item}>{item}</option>)}</select></div><div><label className="label">Preferred External Method</label><select className="input" value={preferredMethod} onChange={event => setPreferredMethod(event.target.value as PaymentMethod)}>{METHODS.map(item => <option key={item}>{item}</option>)}</select></div>{termsType === 'Advance + Balance' && <div><label className="label">Advance %</label><input type="number" min="1" max="99" className="input" value={advancePercent} onChange={event => setAdvancePercent(event.target.value)} /></div>}{termsType === 'Credit Terms' && <div><label className="label">Credit Days After Buyer Acceptance</label><input type="number" min="1" className="input" value={creditDays} onChange={event => setCreditDays(event.target.value)} /></div>}{termsType === 'Other Agreed Arrangement' && <div><label className="label">Optional Fixed Due Date</label><input type="date" className="input" value={dueDate} onChange={event => setDueDate(event.target.value)} /></div>}</div>
              <div className="mt-3"><label className="label">Terms Notes / Staged Schedule Detail</label><textarea className="input resize-none" rows={2} value={termsNotes} onChange={event => setTermsNotes(event.target.value)} placeholder="Describe staged milestones or other agreed payment conditions when needed." /></div>
              <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">Preview: {termsSchedulePreview.map(stage => `${stage.label}: ${stage.percentage ?? 0}% (${stage.dueBasis})`).join(' · ')}</div>
              <button onClick={handleProposeTerms} className="btn-primary mt-3">Propose This Version</button>
            </div>
          )}

          <div className="card">
            <h2 className="section-title mb-4">Payment Ledger</h2>
            {payments.length === 0 ? <p className="text-sm text-gray-400">No Buyer-to-Supplier payment records yet.</p> : <div className="space-y-3">{payments.map(record => <div key={record.id} className="rounded-xl border border-gray-100 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="font-semibold text-gray-900">₱{record.amount.toLocaleString()} · {record.method}</div><div className="mt-1 text-xs text-gray-500">{record.externalReference ? `External ref: ${record.externalReference}` : 'No external reference supplied'} · {new Date(record.reportedAt).toLocaleString()}</div>{record.evidenceReference && <div className="mt-1 text-xs text-gray-500">Evidence: {record.evidenceReference}</div>}{record.issueNote && <div className="mt-2 rounded bg-red-50 p-2 text-xs text-red-700">Issue: {record.issueNote}</div>}{record.withdrawalReason && <div className="mt-2 text-xs text-gray-500">Withdrawn: {record.withdrawalReason}</div>}</div><StatusBadge status={record.status} /></div><div className="mt-3 flex flex-wrap gap-2">{isSupplier && record.status === 'Buyer Reported Payment Sent' && <><button onClick={() => { const result = confirmPaymentReceived(record.id, currentUser!.id); refresh('error' in result ? (result.error ?? 'Unable to confirm payment.') : 'Payment marked Supplier Confirmed Received.'); }} className="btn-primary text-xs">Confirm Received</button><button onClick={() => { const note = window.prompt('Describe why the payment was not received or does not match:'); if (!note) return; const result = raisePaymentIssue(record.id, currentUser!.id, note); refresh('error' in result ? (result.error ?? 'Unable to raise issue.') : 'Payment issue recorded for later Chunk 11 resolution.'); }} className="btn-danger text-xs">Report Not Received / Mismatch</button></>}{isBuyer && record.status === 'Buyer Reported Payment Sent' && <button onClick={() => { const reason = window.prompt('Reason for withdrawing this unconfirmed payment report:'); if (!reason) return; const result = withdrawPaymentReport(record.id, currentUser!.id, reason); refresh('error' in result ? (result.error ?? 'Unable to withdraw report.') : 'Unconfirmed payment report withdrawn; audit history retained.'); }} className="btn-secondary text-xs">Withdraw Report</button>}</div></div>)}</div>}
          </div>

          <div className="card">
            <h2 className="section-title mb-4">Refund Ledger</h2>
            {refunds.length === 0 ? <p className="text-sm text-gray-400">No Supplier-to-Buyer refund records yet.</p> : <div className="space-y-3">{refunds.map(record => <div key={record.id} className="rounded-xl border border-gray-100 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><div className="font-semibold">₱{record.amount.toLocaleString()} · {record.method}</div><div className="mt-1 text-xs text-gray-500">Reason: {record.reason}</div>{record.externalReference && <div className="text-xs text-gray-500">External ref: {record.externalReference}</div>}{record.issueNote && <div className="mt-2 rounded bg-red-50 p-2 text-xs text-red-700">Issue: {record.issueNote}</div>}</div><StatusBadge status={record.status} /></div>{isBuyer && record.status === 'Supplier Reported Refund Sent' && <div className="mt-3 flex gap-2"><button onClick={() => { const result = confirmRefundReceived(record.id, currentUser!.id); refresh('error' in result ? (result.error ?? 'Unable to confirm refund.') : 'Refund marked Buyer Confirmed Refund Received.'); }} className="btn-primary text-xs">Confirm Refund Received</button><button onClick={() => { const note = window.prompt('Describe the refund issue:'); if (!note) return; const result = raiseRefundIssue(record.id, currentUser!.id, note); refresh('error' in result ? (result.error ?? 'Unable to raise refund issue.') : 'Refund issue recorded for later Chunk 11 resolution.'); }} className="btn-danger text-xs">Report Refund Issue</button></div>}</div>)}</div>}
          </div>
        </div>

        <div className="space-y-5">
          {isBuyer && (
            <div className="card border-blue-200">
              <h3 className="font-semibold text-gray-900">Report External Payment Sent</h3><p className="mt-1 text-xs text-gray-500">This is a Buyer declaration only. It does not count as Confirmed Paid until Supplier acknowledgment.</p>
              <div className="mt-3 space-y-3"><div><label className="label">Amount</label><input type="number" min="0" className="input" value={paymentAmount} onChange={event => setPaymentAmount(event.target.value)} /></div><div><label className="label">Actual Method</label><select className="input" value={paymentMethod} onChange={event => setPaymentMethod(event.target.value as PaymentMethod)}>{METHODS.map(item => <option key={item}>{item}</option>)}</select></div><div><label className="label">External Reference</label><input className="input" value={paymentReference} onChange={event => setPaymentReference(event.target.value)} placeholder="Bank / e-wallet / check reference" /></div><div><label className="label">Evidence Reference</label><input className="input" value={paymentEvidence} onChange={event => setPaymentEvidence(event.target.value)} placeholder="Receipt filename or controlled evidence reference" /></div><button onClick={handleReportPayment} className="btn-primary w-full justify-center">Report Payment Sent</button></div>
            </div>
          )}

          {isSupplier && (
            <div className="card border-green-200">
              <h3 className="font-semibold text-gray-900">Record Cash / COD Received</h3><p className="mt-1 text-xs text-gray-500">Use only when you actually received cash directly. This becomes Supplier Confirmed Received immediately.</p><div className="mt-3"><label className="label">Cash Amount</label><input type="number" min="0" className="input" value={cashAmount} onChange={event => setCashAmount(event.target.value)} /></div><button onClick={handleCashReceived} className="btn-primary mt-3 w-full justify-center"><Banknote size={15} /> Record Cash Received</button>
            </div>
          )}

          {isSupplier && reconciliation && reconciliation.refundDue > 0 && (
            <div className="card border-red-200">
              <h3 className="font-semibold text-gray-900">Refund Due</h3><p className="mt-1 text-xs text-gray-500">Current reconciled overpayment: ₱{reconciliation.refundDue.toLocaleString()}. Refund externally; Ani Market does not return funds because it never held them.</p><div className="mt-3 space-y-3"><div><label className="label">Refund Amount</label><input type="number" min="0" max={reconciliation.refundDue} className="input" value={refundAmount} onChange={event => setRefundAmount(event.target.value)} /></div><div><label className="label">Method</label><select className="input" value={refundMethod} onChange={event => setRefundMethod(event.target.value as PaymentMethod)}>{METHODS.map(item => <option key={item}>{item}</option>)}</select></div><div><label className="label">Reason</label><textarea className="input resize-none" rows={2} value={refundReason} onChange={event => setRefundReason(event.target.value)} /></div><div><label className="label">External Reference</label><input className="input" value={refundReference} onChange={event => setRefundReference(event.target.value)} /></div><button onClick={handleRefund} className="btn-danger w-full justify-center">Report Refund Sent</button></div>
            </div>
          )}

          <div className="card">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900"><FileText size={16} aria-hidden="true" /> Audit History</h3><div className="mt-3 max-h-80 space-y-2 overflow-y-auto">{events.length === 0 ? <p className="text-xs text-gray-400">No payment events yet.</p> : events.map(event => <div key={event.id} className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs"><div className="font-medium text-gray-700">{event.eventType}</div><div className="text-gray-400">{new Date(event.createdAt).toLocaleString()} · {event.actorRole}</div>{event.reason && <div className="mt-1 text-gray-500">{event.reason}</div>}</div>)}</div>
          </div>

          <div className="card bg-amber-50 border-amber-200"><h3 className="flex items-center gap-2 font-semibold text-amber-900"><RefreshCcw size={16} aria-hidden="true" /> Scope Boundary</h3><p className="mt-2 text-xs text-amber-800">Payment disputes hand off to Chunk 11. Success-Based Platform Fee collection remains Chunk 8 and is intentionally absent from this workspace.</p></div>
          {termsVersions.length > 1 && <div className="card"><h3 className="font-semibold text-gray-900">Terms Version History</h3><div className="mt-2 space-y-2">{termsVersions.map(item => <div key={item.id} className="flex justify-between rounded-lg bg-gray-50 p-2 text-xs"><span>v{item.versionNumber} · {item.termsType}</span><StatusBadge status={item.status} /></div>)}</div></div>}
        </div>
      </div>
    </div>
  );
}
