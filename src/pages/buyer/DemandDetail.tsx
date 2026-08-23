import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Calendar, DollarSign, MapPin, Package, Pencil, User } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';
import { mockTransactions } from '../../data/mockData';
import {
  formatTargetPrice,
  getDemandEvents,
  getGate1Demands,
  saveDemandEvent,
  saveGate1Demand,
} from '../../data/gate1DemandData';
import {
  getDemandOffers,
  getDemandRemainingForSelection,
  getDemandReservedQuantity,
  getGate1Selections,
} from '../../data/gate1OfferData';

export default function DemandDetail() {
  const { id } = useParams();
  const { currentUser } = useApp();
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [revision, setRevision] = useState(0);
  void revision;

  const demand = getGate1Demands().find(item => item.id === id);
  const offers = demand ? getDemandOffers(demand.id) : [];
  const selections = demand ? getGate1Selections().filter(selection => selection.demandId === demand.id) : [];
  const activeSelections = selections.filter(selection => selection.status === 'Pending Supplier Confirmation' || selection.status === 'Ready for Commitment');
  const reserved = demand ? getDemandReservedQuantity(demand.id) : 0;
  const remaining = demand ? getDemandRemainingForSelection(demand.id) : 0;
  const demandEvents = demand ? getDemandEvents(demand.id).slice().reverse() : [];
  const legacyTransaction = demand ? mockTransactions.find(transaction => transaction.demandId === demand.id) : undefined;

  if (!demand) return <div className="card mx-auto max-w-3xl">Demand not found.</div>;

  const canEdit = demand.responseCount === 0 && !demand.materialTermsLocked && ['Draft', 'Submitted for Qualification', 'Needs Correction', 'Open for Offers'].includes(demand.status);
  const canCancel = ['Draft', 'Submitted for Qualification', 'Needs Correction', 'Open for Offers', 'Partially Allocated', 'Fully Reserved'].includes(demand.status);
  const legacyMode = !demand.qualification;

  const cancelDemand = () => {
    if (!currentUser || !cancelReason.trim()) return;
    const now = new Date().toISOString();
    saveGate1Demand({ ...demand, status: 'Cancelled', cancellationReason: cancelReason.trim(), updatedAt: now });
    saveDemandEvent({ id: `de-${demand.id}-cancel-${Date.now()}`, demandId: demand.id, eventType: 'Cancelled', actorId: currentUser.id, actorRole: 'buyer', reason: cancelReason.trim(), createdAt: now });
    setShowCancel(false);
    setCancelReason('');
    setRevision(value => value + 1);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/buyer/demands" className="btn-ghost px-3 py-1.5"><ArrowLeft size={16} /> Back</Link>
        <h1 className="text-xl font-bold text-gray-900">{demand.cropName}</h1>
        <StatusBadge status={demand.status} size="md" />
        {legacyMode && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">Legacy demo record</span>}
      </div>

      {legacyMode && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This is a pre-Gate-1 demo record retained for migration/history. New Buyer decisions no longer use <strong>Accept & Match</strong>; use the controlled Offer & Selection workflow for Gate 1 Demands.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card">
            <div className="mb-4 flex items-center justify-between gap-3"><h2 className="section-title">Demand Summary</h2>{canEdit && <Link to={`/buyer/demands/${demand.id}/edit`} className="btn-secondary text-xs"><Pencil size={13} /> Edit & Requalify</Link>}</div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
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
              ].map(row => <div key={row.label}><div className="mb-0.5 flex items-center gap-1 text-xs text-gray-500">{row.icon}{row.label}</div><div className="text-sm font-medium text-gray-900">{row.value}</div></div>)}
            </div>
            {demand.qualitySpecs && <div className="mt-4 border-t border-gray-100 pt-4"><div className="mb-1 text-xs text-gray-500">Quality / Product Specifications</div><p className="text-sm text-gray-700">{demand.qualitySpecs}</p></div>}
            {demand.notes && <div className="mt-3"><div className="mb-1 text-xs text-gray-500">Procurement Notes</div><p className="text-sm text-gray-700">{demand.notes}</p></div>}
          </div>

          {!legacyMode && (
            <div className="card space-y-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="section-title">Offer & Selection State</h2><p className="mt-1 text-xs text-gray-500">Supplier Offers remain confidential from competing Suppliers. Buyer comparison is ordered by Submission Time by default.</p></div><Link to="/buyer/responses" className="btn-primary text-sm">Compare Offers</Link></div>
              <div className="grid grid-cols-4 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                <div><div className="text-xs text-gray-500">Requested</div><div className="font-bold text-gray-900">{demand.quantity.toLocaleString()}</div></div>
                <div><div className="text-xs text-gray-500">Offers</div><div className="font-bold text-blue-700">{offers.length}</div></div>
                <div><div className="text-xs text-gray-500">Reserved</div><div className="font-bold text-yellow-700">{reserved.toLocaleString()}</div></div>
                <div><div className="text-xs text-gray-500">Remaining</div><div className="font-bold text-green-700">{remaining.toLocaleString()}</div></div>
              </div>
              {activeSelections.length > 0 && <div className="space-y-2">{activeSelections.map(selection => { const offer = offers.find(item => item.id === selection.offerId); return <div key={selection.id} className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-yellow-950">{offer?.supplierName ?? selection.supplierId}</strong><StatusBadge status={selection.status} /></div><div className="mt-1 text-xs text-yellow-800">{selection.selectedQuantity.toLocaleString()} {selection.unit} temporarily reserved until {new Date(selection.reservationExpiresAt).toLocaleString()}</div></div>; })}</div>}
            </div>
          )}

          {demand.qualification && (
            <div className="card">
              <h2 className="section-title mb-3">Qualification Result</h2>
              <div className="mb-3 flex items-center gap-2"><StatusBadge status={demand.qualification.status} /><span className="text-xs text-gray-400">Evaluated {demand.qualification.evaluatedAt}</span></div>
              <div className="space-y-2">{demand.qualification.checks.map(check => <div key={check.key} className={`rounded-lg border p-3 text-sm ${check.passed ? 'border-green-100 bg-green-50 text-green-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}><strong>{check.passed ? 'Passed' : 'Needs correction'}:</strong> {check.label}{check.message ? ` — ${check.message}` : ''}</div>)}</div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card">
            <h3 className="mb-3 font-semibold text-gray-800">Demand History</h3>
            {demandEvents.length === 0 ? <p className="text-xs text-gray-400">No Gate 1 Demand events recorded for this legacy item.</p> : <div className="max-h-72 space-y-3 overflow-y-auto">{demandEvents.map(event => <div key={event.id} className="border-l-2 border-green-200 pl-3 text-xs"><div className="font-semibold text-gray-700">{event.eventType}</div><div className="text-gray-400">{event.createdAt}</div>{event.reason && <div className="mt-1 text-gray-500">{event.reason}</div>}</div>)}</div>}
          </div>

          {legacyTransaction && <Link to={`/transactions/${legacyTransaction.id}`} className="btn-secondary w-full justify-center">View Historical Transaction</Link>}

          <div className="card border-red-100">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-800"><AlertTriangle size={16} className="text-red-500" /> Controlled Actions</h3>
            {canCancel ? <><button onClick={() => setShowCancel(true)} className="btn-danger w-full justify-center text-xs">Cancel Demand</button><p className="mt-2 text-xs text-gray-400">Cancellation closes sourcing and records the reason/history. Post-Commitment cancellation belongs to the Transaction workflow.</p></> : <p className="text-xs text-gray-400">No pre-Commitment Demand cancellation is available in this state.</p>}
          </div>
        </div>
      </div>

      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><h3 className="text-lg font-bold text-gray-900">Cancel Demand</h3><p className="mt-1 text-sm text-gray-500">A reason is mandatory and remains in Demand history.</p><textarea className="input mt-4 resize-none" rows={3} value={cancelReason} onChange={event => setCancelReason(event.target.value)} placeholder="Reason for cancellation" /><div className="mt-4 flex gap-3"><button onClick={() => setShowCancel(false)} className="btn-secondary flex-1 justify-center">Back</button><button onClick={cancelDemand} disabled={!cancelReason.trim()} className="btn-danger flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50">Confirm Cancellation</button></div></div>
        </div>
      )}
    </div>
  );
}
