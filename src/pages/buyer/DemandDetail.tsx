import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Calendar, DollarSign, MapPin, Package, Pencil, User } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import DemandQuantityProgress from '../../components/DemandQuantityProgress';
import { useApp } from '../../context/AppContext';
import { mockTransactions } from '../../data/mockData';
import { formatTargetPrice, getDemandEvents, getGate1Demands, saveDemandEvent, saveGate1Demand } from '../../data/gate1DemandData';
import { getDemandOffers } from '../../data/gate1OfferData';
import { acceptToleranceVariance, getDemandQuantityState, getGate1Transactions, waiveResidual } from '../../data/gate1CommerceData';
import { getLiveSelections } from '../../data/gate1FlowData';

export default function DemandDetail() {
  const { id } = useParams();
  const { currentUser } = useApp();
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [revision, setRevision] = useState(0);
  void revision;

  const demand = getGate1Demands().find(item => item.id === id);
  const offers = demand ? getDemandOffers(demand.id) : [];
  const selections = demand ? getLiveSelections().filter(selection => selection.demandId === demand.id) : [];
  const activeSelections = selections.filter(selection => ['Pending Supplier Confirmation', 'Negotiating', 'Ready for Commitment'].includes(selection.status));
  const quantityState = demand ? getDemandQuantityState(demand.id) : undefined;
  const gate1Transactions = demand ? getGate1Transactions().filter(transaction => transaction.demandId === demand.id) : [];
  const demandEvents = demand ? getDemandEvents(demand.id).slice().reverse() : [];
  const legacyTransaction = demand ? mockTransactions.find(transaction => transaction.demandId === demand.id) : undefined;

  if (!demand) return <div className="card mx-auto max-w-3xl">Demand not found.</div>;

  const canEdit = demand.responseCount === 0 && !demand.materialTermsLocked && ['Draft', 'Submitted for Qualification', 'Needs Correction', 'Open for Offers'].includes(demand.status);
  const canCancel = ['Draft', 'Submitted for Qualification', 'Needs Correction', 'Open for Offers', 'Partially Allocated', 'Fully Reserved'].includes(demand.status) && gate1Transactions.length === 0;
  const legacyMode = !demand.qualification;
  const canResolveResidual = Boolean(quantityState && quantityState.remainingQuantity > 0 && quantityState.reservedQuantity === 0 && quantityState.activeCommittedQuantity === 0 && quantityState.fulfilledQuantity > 0);

  const cancelDemand = () => {
    if (!currentUser || !cancelReason.trim()) return;
    const now = new Date().toISOString();
    saveGate1Demand({ ...demand, status: 'Cancelled', cancellationReason: cancelReason.trim(), updatedAt: now });
    saveDemandEvent({ id: `de-${demand.id}-cancel-${Date.now()}`, demandId: demand.id, eventType: 'Cancelled', actorId: currentUser.id, actorRole: 'buyer', reason: cancelReason.trim(), createdAt: now });
    setShowCancel(false); setCancelReason(''); setRevision(value => value + 1);
  };

  const handleWaiver = () => {
    if (!currentUser || !quantityState) return;
    const quantity = Number(window.prompt(`Residual quantity to waive (${demand.unit}). This is not physical fulfillment.`, quantityState.remainingQuantity.toString()));
    if (!quantity) return;
    const reason = window.prompt('Reason further sourcing is impractical:');
    if (!reason) return;
    const result = waiveResidual(demand.id, currentUser.id, quantity, reason);
    if ('error' in result) window.alert(result.error);
    else setRevision(value => value + 1);
  };

  const handleTolerance = () => {
    if (!currentUser || !quantityState) return;
    const limit = Number(window.prompt(`Configured tolerance limit quantity (${demand.unit}). No universal percentage is assumed.`, quantityState.remainingQuantity.toString()));
    if (!limit) return;
    const quantity = Number(window.prompt(`Shortfall quantity to accept within that tolerance (${demand.unit})`, quantityState.remainingQuantity.toString()));
    if (!quantity) return;
    const reason = window.prompt('Reason for accepting this fulfillment variance within tolerance:');
    if (!reason) return;
    const result = acceptToleranceVariance(demand.id, currentUser.id, quantity, limit, reason);
    if ('error' in result) window.alert(result.error);
    else setRevision(value => value + 1);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center gap-3"><Link to="/buyer/demands" className="btn-ghost px-3 py-1.5"><ArrowLeft size={16} /> Back</Link><h1 className="text-xl font-bold text-gray-900">{demand.cropName}</h1><StatusBadge status={demand.status} size="md" />{legacyMode && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">Legacy demo record</span>}</div>

      {legacyMode && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">This is a pre-Gate-1 demo record retained for migration/history. New Buyer decisions use Offer → Selection → Negotiation → Mutual Commitment.</div>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card">
            <div className="mb-4 flex items-center justify-between gap-3"><h2 className="section-title">Demand Summary</h2>{canEdit && <Link to={`/buyer/demands/${demand.id}/edit`} className="btn-secondary text-xs"><Pencil size={13} /> Edit & Requalify</Link>}</div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{[
              { icon: <Package size={16} className="text-gray-400" />, label: 'Category', value: demand.cropCategory },
              { icon: <Package size={16} className="text-gray-400" />, label: 'Variety / Spec', value: demand.variety || '—' },
              { icon: <Package size={16} className="text-gray-400" />, label: 'Requested Quantity', value: `${demand.quantity.toLocaleString()} ${demand.unit}` },
              { icon: <Package size={16} className="text-gray-400" />, label: 'Minimum per Supplier', value: demand.minimumSupplierQuantity ? `${demand.minimumSupplierQuantity.toLocaleString()} ${demand.unit}` : 'No buyer minimum' },
              { icon: <DollarSign size={16} className="text-gray-400" />, label: 'Buyer Target', value: `${formatTargetPrice(demand.targetPriceProfile, demand.targetPrice)}/${demand.unit}` },
              { icon: <MapPin size={16} className="text-gray-400" />, label: 'Location', value: demand.location },
              { icon: <Package size={16} className="text-gray-400" />, label: 'Fulfillment', value: demand.deliveryPreference },
              { icon: <Calendar size={16} className="text-gray-400" />, label: 'Required', value: demand.fulfillmentWindowEnd ? `${demand.requiredDate} → ${demand.fulfillmentWindowEnd}` : demand.requiredDate },
              { icon: <Calendar size={16} className="text-gray-400" />, label: 'Offer Deadline', value: demand.expirationDate },
              { icon: <User size={16} className="text-gray-400" />, label: 'Buyer Type', value: demand.buyerType },
            ].map(row => <div key={row.label}><div className="mb-0.5 flex items-center gap-1 text-xs text-gray-500">{row.icon}{row.label}</div><div className="text-sm font-medium text-gray-900">{row.value}</div></div>)}</div>
            {demand.qualitySpecs && <div className="mt-4 border-t border-gray-100 pt-4"><div className="mb-1 text-xs text-gray-500">Quality / Product Specifications</div><p className="text-sm text-gray-700">{demand.qualitySpecs}</p></div>}
          </div>

          {!legacyMode && <div className="card space-y-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="section-title">Multi-Supplier Allocation & Fulfillment</h2><p className="mt-1 text-xs text-gray-500">Physical fulfillment, active commitment, reservations, tolerance, waiver and Remaining are deliberately separate states.</p></div><Link to="/buyer/responses" className="btn-primary text-sm">Compare Offers</Link></div><DemandQuantityProgress demandId={demand.id} unit={demand.unit} />{activeSelections.length > 0 && <div className="space-y-2">{activeSelections.map(selection => { const offer = offers.find(item => item.id === selection.offerId); return <div key={selection.id} className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-yellow-950">{offer?.supplierName ?? selection.supplierId}</strong><StatusBadge status={selection.status} /></div><div className="mt-1 text-xs text-yellow-800">{selection.selectedQuantity.toLocaleString()} {selection.unit} reserved until {new Date(selection.reservationExpiresAt).toLocaleString()}</div></div>; })}</div>}</div>}

          {gate1Transactions.length > 0 && <div className="card"><h2 className="section-title mb-3">Committed Supplier Transactions</h2><div className="space-y-2">{gate1Transactions.map(transaction => <Link key={transaction.id} to={`/gate1-transactions/${transaction.id}`} className="block rounded-lg border border-gray-200 p-3 hover:border-green-300"><div className="flex justify-between gap-3"><div><strong>{transaction.finalTerms.supplierName}</strong><div className="text-xs text-gray-500">{transaction.historicalCommittedQuantity.toLocaleString()} {transaction.finalTerms.unit} @ ₱{transaction.finalTerms.agreedTransactionPrice.toLocaleString()}</div></div><StatusBadge status={transaction.status} /></div></Link>)}</div></div>}

          {demand.qualification && <div className="card"><h2 className="section-title mb-3">Qualification Result</h2><div className="mb-3 flex items-center gap-2"><StatusBadge status={demand.qualification.status} /><span className="text-xs text-gray-400">Evaluated {demand.qualification.evaluatedAt}</span></div><div className="space-y-2">{demand.qualification.checks.map(check => <div key={check.key} className={`rounded-lg border p-3 text-sm ${check.passed ? 'border-green-100 bg-green-50 text-green-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}><strong>{check.passed ? 'Passed' : 'Needs correction'}:</strong> {check.label}{check.message ? ` — ${check.message}` : ''}</div>)}</div></div>}
        </div>

        <div className="space-y-5">
          <div className="card"><h3 className="mb-3 font-semibold text-gray-800">Demand History</h3>{demandEvents.length === 0 ? <p className="text-xs text-gray-400">No Gate 1 Demand events recorded.</p> : <div className="max-h-72 space-y-3 overflow-y-auto">{demandEvents.map(event => <div key={event.id} className="border-l-2 border-green-200 pl-3 text-xs"><div className="font-semibold text-gray-700">{event.eventType}</div><div className="text-gray-400">{event.createdAt}</div>{event.reason && <div className="mt-1 text-gray-500">{event.reason}</div>}</div>)}</div>}</div>

          {canResolveResidual && <div className="card border-gray-200"><h3 className="font-semibold text-gray-800">Residual Resolution</h3><p className="mt-2 text-xs text-gray-500">Available only after active obligations are resolved. Neither action counts the shortfall as physical Fulfilled quantity.</p><div className="mt-3 space-y-2"><button onClick={handleWaiver} className="btn-secondary w-full justify-center text-xs">Residual Waiver</button><button onClick={handleTolerance} className="btn-secondary w-full justify-center text-xs">Accept Within Configured Tolerance</button></div></div>}

          {legacyTransaction && <Link to={`/transactions/${legacyTransaction.id}`} className="btn-secondary w-full justify-center">View Historical Transaction</Link>}

          <div className="card border-red-100"><h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-800"><AlertTriangle size={16} className="text-red-500" /> Controlled Actions</h3>{canCancel ? <><button onClick={() => setShowCancel(true)} className="btn-danger w-full justify-center text-xs">Cancel Demand</button><p className="mt-2 text-xs text-gray-400">Cancellation closes sourcing and records the reason/history. Post-Commitment cancellation belongs to the Transaction workflow.</p></> : <p className="text-xs text-gray-400">No pre-Commitment Demand cancellation is available in this state.</p>}</div>
        </div>
      </div>

      {showCancel && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><h3 className="text-lg font-bold text-gray-900">Cancel Demand</h3><p className="mt-1 text-sm text-gray-500">A reason is mandatory and remains in Demand history.</p><textarea className="input mt-4 resize-none" rows={3} value={cancelReason} onChange={event => setCancelReason(event.target.value)} placeholder="Reason for cancellation" /><div className="mt-4 flex gap-3"><button onClick={() => setShowCancel(false)} className="btn-secondary flex-1 justify-center">Back</button><button onClick={cancelDemand} disabled={!cancelReason.trim()} className="btn-danger flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50">Confirm Cancellation</button></div></div></div>}
    </div>
  );
}
