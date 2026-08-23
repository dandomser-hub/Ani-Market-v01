import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import DemandQuantityProgress from '../../components/DemandQuantityProgress';
import { useApp } from '../../context/AppContext';
import {
  acceptExcessAdjustment,
  getFulfillmentRecords,
  getGate1Transactions,
  recordFulfillment,
} from '../../data/gate1CommerceData';
import {
  getCureRecord,
  releaseOutstandingAfterCure,
  requestSupplierCure,
  resolveCureIfFulfilled,
} from '../../data/gate1FlowData';

export default function Gate1TransactionWorkspace() {
  const { id } = useParams();
  const { currentUser } = useApp();
  const [revision, setRevision] = useState(0);
  const [presented, setPresented] = useState('');
  const [accepted, setAccepted] = useState('');
  const [rejected, setRejected] = useState('');
  const [remarks, setRemarks] = useState('');
  const [message, setMessage] = useState('');
  void revision;

  const transaction = getGate1Transactions().find(item => item.id === id);
  if (!transaction) return <div className="card mx-auto max-w-3xl">Gate 1 Transaction not found.</div>;
  const isBuyer = currentUser?.id === transaction.buyerId;
  const records = getFulfillmentRecords(transaction.id);
  const cure = getCureRecord(transaction.id);
  const terms = transaction.finalTerms;

  const recordAcceptance = () => {
    if (!currentUser) return;
    const result = recordFulfillment({ transactionId: transaction.id, buyerId: currentUser.id, presentedQuantity: Number(presented), acceptedQuantity: Number(accepted), rejectedQuantity: Number(rejected), remarks });
    if ('error' in result) setMessage(result.error);
    else {
      resolveCureIfFulfilled(transaction.id);
      setMessage('Fulfillment record saved. Accepted quantity now drives Demand Fulfilled and Final Transaction Value.');
      setPresented(''); setAccepted(''); setRejected(''); setRemarks(''); setRevision(value => value + 1);
    }
  };

  const requestCure = () => {
    if (!currentUser) return;
    const reason = window.prompt('Describe the outstanding quantity/specification issue and requested Supplier cure:');
    if (!reason) return;
    const result = requestSupplierCure(transaction.id, currentUser.id, reason);
    setMessage('error' in result ? result.error : 'Supplier cure opportunity recorded. Outstanding quantity remains Active Committed until cured or formally released.');
    setRevision(value => value + 1);
  };

  const releaseAfterCure = () => {
    if (!currentUser) return;
    const reason = window.prompt('Reason the Supplier cannot cure the outstanding quantity:');
    if (!reason) return;
    const result = releaseOutstandingAfterCure(transaction.id, currentUser.id, reason);
    setMessage('error' in result ? result.error : `${result.releasedQuantity.toLocaleString()} ${terms.unit} released back to Demand Remaining Quantity.`);
    setRevision(value => value + 1);
  };

  const acceptExcess = () => {
    if (!currentUser) return;
    const quantity = Number(window.prompt(`Accepted excess quantity (${terms.unit}). This must fit legitimate outstanding Demand.`, ''));
    if (!quantity) return;
    const reason = window.prompt('Reason for explicitly accepting this excess quantity:');
    if (!reason) return;
    const result = acceptExcessAdjustment(transaction.id, currentUser.id, quantity, reason);
    setMessage('error' in result ? result.error : 'Accepted Excess Adjustment recorded. It is now included in Fulfilled quantity and Final Transaction Value.');
    setRevision(value => value + 1);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center gap-3"><Link to="/transactions" className="btn-ghost py-1.5 px-3"><ArrowLeft size={16} /> Back</Link><div><h1 className="text-xl font-bold text-gray-900">Gate 1 Transaction</h1><p className="text-xs text-gray-500">{transaction.transactionReference}</p></div><StatusBadge status={transaction.status} size="md" /></div>
      {message && <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">{message}</div>}

      <div className="card"><DemandQuantityProgress demandId={transaction.demandId} unit={terms.unit} /></div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card">
            <h2 className="section-title mb-4">Immutable Final Terms Snapshot</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><div><div className="text-xs text-gray-500">Buyer</div><div className="font-semibold">{terms.buyerName}</div></div><div><div className="text-xs text-gray-500">Supplier</div><div className="font-semibold">{terms.supplierName}</div></div><div><div className="text-xs text-gray-500">Commodity</div><div className="font-semibold">{terms.cropName}</div></div><div><div className="text-xs text-gray-500">Committed</div><div className="font-semibold">{terms.committedQuantity.toLocaleString()} {terms.unit}</div></div><div><div className="text-xs text-gray-500">Agreed Price</div><div className="font-semibold text-green-700">₱{terms.agreedTransactionPrice.toLocaleString()}</div></div><div><div className="text-xs text-gray-500">Committed Value</div><div className="font-semibold">₱{transaction.committedTransactionValue.toLocaleString()}</div></div><div><div className="text-xs text-gray-500">Fulfillment</div><div className="font-semibold">{terms.fulfillmentDate}</div></div><div><div className="text-xs text-gray-500">Proposal Version</div><div className="font-semibold">v{terms.negotiationProposalVersion}</div></div></div>
            {terms.specificationVariations && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Agreed variation: {terms.specificationVariations}</div>}
          </div>

          <div className="card">
            <h2 className="section-title mb-4">Fulfillment Quantity Record</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div><span className="text-xs text-gray-500 block">Historical Committed</span><strong>{transaction.historicalCommittedQuantity.toLocaleString()} {terms.unit}</strong></div><div><span className="text-xs text-gray-500 block">Active Outstanding</span><strong className="text-teal-700">{transaction.activeCommittedQuantity.toLocaleString()} {terms.unit}</strong></div><div><span className="text-xs text-gray-500 block">Presented</span><strong>{transaction.presentedQuantity.toLocaleString()} {terms.unit}</strong></div><div><span className="text-xs text-gray-500 block">Buyer Accepted</span><strong className="text-green-700">{transaction.acceptedQuantity.toLocaleString()} {terms.unit}</strong></div><div><span className="text-xs text-gray-500 block">Rejected / Unaccepted</span><strong>{transaction.rejectedQuantity.toLocaleString()} {terms.unit}</strong></div><div><span className="text-xs text-gray-500 block">Accepted Excess</span><strong>{transaction.acceptedExcessQuantity.toLocaleString()} {terms.unit}</strong></div><div><span className="text-xs text-gray-500 block">Released Shortfall</span><strong>{transaction.releasedShortfallQuantity.toLocaleString()} {terms.unit}</strong></div><div><span className="text-xs text-gray-500 block">Final Transaction Value</span><strong>₱{transaction.finalTransactionValue.toLocaleString()}</strong></div></div>
          </div>

          {isBuyer && (
            <div className="card border-green-200">
              <h2 className="section-title mb-4">Record Presented / Accepted Quantity</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><div><label className="label">Presented</label><input type="number" className="input" value={presented} onChange={event => setPresented(event.target.value)} /></div><div><label className="label">Accepted</label><input type="number" className="input" value={accepted} onChange={event => setAccepted(event.target.value)} /></div><div><label className="label">Rejected / Unaccepted</label><input type="number" className="input" value={rejected} onChange={event => setRejected(event.target.value)} /></div></div><div className="mt-3"><label className="label">Remarks</label><textarea className="input resize-none" rows={2} value={remarks} onChange={event => setRemarks(event.target.value)} /></div><button onClick={recordAcceptance} className="btn-primary mt-3"><CheckCircle size={15} /> Save Buyer Acceptance</button>
              <p className="mt-3 text-xs text-gray-500">Normal acceptance cannot exceed Active Committed quantity. Any presented excess is non-payable/non-fulfilling until explicitly accepted against legitimate outstanding Demand.</p>
            </div>
          )}

          {records.length > 0 && <div className="card"><h2 className="section-title mb-4">Fulfillment History</h2><div className="space-y-2">{records.map(record => <div key={record.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm"><div>{record.createdAt}</div><div className="text-xs text-gray-600">Presented {record.presentedQuantity.toLocaleString()} · Accepted {record.acceptedQuantity.toLocaleString()} · Rejected {record.rejectedQuantity.toLocaleString()} {terms.unit}</div>{record.remarks && <div className="mt-1 text-xs text-gray-500">{record.remarks}</div>}</div>)}</div></div>}
        </div>

        <div className="space-y-5">
          <div className="card"><h3 className="font-semibold text-gray-800">Commercial Values</h3><div className="mt-3 space-y-2 text-sm"><div className="flex justify-between"><span>Committed Transaction Value</span><strong>₱{transaction.committedTransactionValue.toLocaleString()}</strong></div><div className="flex justify-between"><span>Final Transaction Value</span><strong>₱{transaction.finalTransactionValue.toLocaleString()}</strong></div></div><p className="mt-3 text-xs text-gray-500">Final value is based on Buyer-confirmed Accepted Quantity plus valid Accepted Excess Adjustments. Payment workflow and Success-Based Platform Fee collection remain Chunks 7–8.</p></div>

          <div className="card"><h3 className="font-semibold text-gray-800">Operational Contact Release</h3><p className="mt-2 text-sm text-gray-600">Full operational contact is released only after Mutual Commitment.</p><div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">Contact release: {transaction.operationalContactReleased ? 'Enabled after Commitment' : 'Restricted'}</div></div>

          {isBuyer && transaction.activeCommittedQuantity > 0 && <div className="card border-amber-200"><h3 className="font-semibold text-amber-900 flex items-center gap-2"><AlertTriangle size={16} /> Under-Fulfillment / Cure</h3><p className="mt-2 text-xs text-amber-800">Outstanding quantity remains Active Committed during the Supplier cure opportunity. Release back to sourcing is blocked until cure has first been recorded.</p><div className="mt-3 space-y-2">{!cure || cure.status !== 'Requested' ? <button onClick={requestCure} className="btn-secondary w-full justify-center text-xs">Request Supplier Cure</button> : <><div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">Cure requested: {cure.reason}</div><button onClick={releaseAfterCure} className="btn-danger w-full justify-center text-xs">Cure Failed — Release Outstanding</button></>}</div></div>}

          {isBuyer && <div className="card"><h3 className="font-semibold text-gray-800">Accepted Excess Adjustment</h3><p className="mt-2 text-xs text-gray-500">Use only for explicitly accepted excess that fits a legitimate outstanding Demand. It does not rewrite historical Commitment.</p><button onClick={acceptExcess} className="btn-secondary mt-3 w-full justify-center text-xs">Record Accepted Excess</button></div>}
        </div>
      </div>
    </div>
  );
}
