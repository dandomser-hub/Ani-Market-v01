import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import OfferModal from '../../components/OfferModal';
import DemandQuantityProgress from '../../components/DemandQuantityProgress';
import { useApp } from '../../context/AppContext';
import { formatTargetPrice, getGate1Demands } from '../../data/gate1DemandData';
import {
  getCurrentOfferVersion,
  getGate1Offers,
  getOfferVersions,
  saveGate1Offer,
  withdrawOffer,
} from '../../data/gate1OfferData';
import {
  confirmSelectionDirect,
  getNegotiationThreads,
  startNegotiation,
} from '../../data/gate1CommerceData';
import {
  declineCommerceSelection,
  getCommerceOfferSelectableQuantity,
  getLiveSelections,
} from '../../data/gate1FlowData';
import type { DemandPost, Offer, SelectedAllocation } from '../../types';

function OfferCard({
  offer,
  demand,
  selections,
  negotiationThreadId,
  onRevise,
  onWithdraw,
  onConfirmSelection,
  onCounterSelection,
  onDeclineSelection,
}: {
  offer: Offer;
  demand?: DemandPost;
  selections: SelectedAllocation[];
  negotiationThreadId?: string;
  onRevise: () => void;
  onWithdraw: () => void;
  onConfirmSelection: (selection: SelectedAllocation) => void;
  onCounterSelection: (selection: SelectedAllocation) => void;
  onDeclineSelection: (selection: SelectedAllocation) => void;
}) {
  const version = getCurrentOfferVersion(offer);
  const versions = getOfferVersions(offer.id);
  const selectable = getCommerceOfferSelectableQuantity(offer);
  const activeSelection = selections.find(selection => ['Pending Supplier Confirmation', 'Negotiating', 'Ready for Commitment'].includes(selection.status));
  const releasedSelection = offer.status === 'Selected' && !activeSelection && !offer.legacyResponseId;
  const displayStatus = releasedSelection ? 'Active' : offer.status;

  return (
    <div className="card transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="font-bold text-gray-900">{demand?.cropName ?? 'Demand'}</div>
          <div className="text-xs text-gray-500">{demand?.buyerName} • {demand?.location}</div>
          <div className="mt-1 text-xs text-gray-400">Offer {offer.id} · version {offer.currentVersionNumber}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5"><StatusBadge status={displayStatus} size="md" /><span className="text-xs text-gray-400">Submitted {offer.submittedAt}</span></div>
      </div>

      {demand && <div className="mb-4"><DemandQuantityProgress demandId={demand.id} unit={demand.unit} compact /></div>}

      {version && (
        <>
          <div className="mb-3 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div><div className="text-xs text-gray-500">Original Offered</div><div className="text-sm font-semibold text-gray-900">{offer.originalOfferedQuantity.toLocaleString()} {offer.unit}</div></div>
            <div><div className="text-xs text-gray-500">Current Offer</div><div className="text-sm font-semibold text-gray-900">{version.offeredQuantity.toLocaleString()} {version.unit}</div></div>
            <div><div className="text-xs text-gray-500">Currently Selectable</div><div className="text-sm font-semibold text-blue-700">{selectable.toLocaleString()} {offer.unit}</div></div>
            <div><div className="text-xs text-gray-500">Offered Price</div><div className="text-sm font-semibold text-green-700">₱{version.offeredPrice.toLocaleString()}</div>{demand && <div className="text-xs text-gray-400">Buyer target {formatTargetPrice(demand.targetPriceProfile, demand.targetPrice)}</div>}</div>
            <div><div className="text-xs text-gray-500">Valid Until</div><div className="text-sm text-gray-900">{version.validUntil}</div></div>
          </div>
          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-3"><span className="font-medium text-gray-700">Specification confirmation: </span><span className="text-gray-600">{version.specificationConfirmation}</span></div>
            <div className="rounded-lg bg-gray-50 p-3"><span className="font-medium text-gray-700">Fulfillment: </span><span className="text-gray-600">{version.fulfillmentDate}</span>{version.priceBasis && <div className="mt-1 text-gray-500">Price basis: {version.priceBasis}</div>}</div>
          </div>
          {version.specificationVariations && <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><strong>Declared variation:</strong> {version.specificationVariations}</div>}
          {version.remarks && <div className="mt-3 text-xs italic text-gray-500">“{version.remarks}”</div>}
          <div className="mt-3 text-xs text-gray-500">Version history: {versions.length} version{versions.length !== 1 ? 's' : ''}{version.changeReason ? ` · Latest note: ${version.changeReason}` : ''}</div>
        </>
      )}

      {activeSelection && (
        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="font-semibold text-yellow-900">Buyer Selection / Negotiation</div>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm"><div><span className="text-yellow-700">Reserved quantity</span><div className="font-semibold text-yellow-950">{activeSelection.selectedQuantity.toLocaleString()} {activeSelection.unit}</div></div><div><span className="text-yellow-700">Reservation expires</span><div className="font-semibold text-yellow-950">{new Date(activeSelection.reservationExpiresAt).toLocaleString()}</div></div></div>
          <div className="mt-2"><StatusBadge status={activeSelection.status} /></div>
          <p className="mt-2 text-xs text-yellow-800">Confirming unchanged terms creates Mutual Commitment. Countering does not increase or extend this reservation; any changed quantity is revalidated only at Commitment.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeSelection.status === 'Pending Supplier Confirmation' && <button onClick={() => onConfirmSelection(activeSelection)} className="btn-primary text-xs">Confirm Selection</button>}
            {activeSelection.status === 'Pending Supplier Confirmation' && <button onClick={() => onCounterSelection(activeSelection)} className="btn-secondary text-xs">Counter Terms</button>}
            {negotiationThreadId && <Link to={`/negotiations/${negotiationThreadId}`} className="btn-secondary text-xs">Open Negotiation</Link>}
            {['Pending Supplier Confirmation', 'Negotiating'].includes(activeSelection.status) && <button onClick={() => onDeclineSelection(activeSelection)} className="btn-danger text-xs">Decline</button>}
          </div>
        </div>
      )}

      {(offer.status === 'Active' || releasedSelection) && !activeSelection && (
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3"><button onClick={onRevise} className="btn-secondary text-sm">Revise Offer</button><button onClick={onWithdraw} className="btn-danger text-sm">Withdraw Offer</button></div>
      )}
      {offer.withdrawalReason && <div className="mt-3 text-xs text-gray-500">Withdrawal reason: {offer.withdrawalReason}</div>}
    </div>
  );
}

export default function SupplierResponses() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  void revision;

  const demands = getGate1Demands();
  const myOffers = getGate1Offers().filter(offer => offer.supplierId === currentUser?.id);
  const selections = getLiveSelections().filter(selection => selection.supplierId === currentUser?.id);
  const negotiations = getNegotiationThreads();
  const activeOffers = myOffers.filter(offer => offer.status === 'Active' || offer.status === 'Selected');
  const closedOffers = myOffers.filter(offer => !['Active', 'Selected'].includes(offer.status));
  const editingOffer = myOffers.find(offer => offer.id === editingOfferId);
  const editingDemand = editingOffer ? demands.find(demand => demand.id === editingOffer.demandId) : undefined;

  const reactivateReleasedOffer = (offer: Offer) => {
    const hasActiveSelection = selections.some(selection => selection.offerId === offer.id && ['Pending Supplier Confirmation', 'Negotiating', 'Ready for Commitment'].includes(selection.status));
    if (offer.status === 'Selected' && !hasActiveSelection && !offer.legacyResponseId) {
      const active = { ...offer, status: 'Active' as const, updatedAt: new Date().toISOString() };
      saveGate1Offer(active);
      return active;
    }
    return offer;
  };

  const handleRevise = (offer: Offer) => {
    reactivateReleasedOffer(offer);
    setRevision(value => value + 1);
    setEditingOfferId(offer.id);
  };

  const handleWithdraw = (offer: Offer) => {
    const reason = window.prompt('Reason for withdrawing this uncommitted Offer residual:');
    if (!reason) return;
    const result = withdrawOffer(reactivateReleasedOffer(offer).id, reason);
    if (result.error) window.alert(result.error);
    else setRevision(value => value + 1);
  };

  const handleDeclineSelection = (selection: SelectedAllocation) => {
    if (!currentUser) return;
    const reason = window.prompt('Reason for declining this Buyer Selection / negotiation:');
    if (!reason) return;
    const result = declineCommerceSelection(selection.id, currentUser.id, reason);
    if (result.error) window.alert(result.error);
    else setRevision(value => value + 1);
  };

  const handleConfirmSelection = (selection: SelectedAllocation) => {
    if (!currentUser) return;
    const result = confirmSelectionDirect(selection.id, currentUser.id);
    if ('error' in result) {
      window.alert(result.error);
      return;
    }
    navigate(`/gate1-transactions/${result.transaction.id}`);
  };

  const handleCounterSelection = (selection: SelectedAllocation) => {
    if (!currentUser) return;
    const offer = myOffers.find(item => item.id === selection.offerId);
    const version = offer ? getCurrentOfferVersion(offer) : undefined;
    if (!version) return;
    const quantity = Number(window.prompt(`Counter quantity (${selection.unit}). The reservation stays at ${selection.selectedQuantity.toLocaleString()} ${selection.unit} until Commitment.`, selection.selectedQuantity.toString()));
    if (!quantity) return;
    const price = Number(window.prompt(`Counter price (₱/${selection.unit})`, version.offeredPrice.toString()));
    if (!price) return;
    const fulfillmentDate = window.prompt('Counter fulfillment date (YYYY-MM-DD)', version.fulfillmentDate);
    if (!fulfillmentDate) return;
    const specificationVariations = window.prompt('Specification variation, if any', version.specificationVariations ?? '') ?? '';
    const remarks = window.prompt('Commercial remarks, if any', '') ?? '';
    const result = startNegotiation(selection.id, currentUser.id, 'supplier', { quantity, unitPrice: price, fulfillmentDate, specificationVariations, remarks });
    if ('error' in result) window.alert(result.error);
    else navigate(`/negotiations/${result.thread.id}`);
  };

  if (myOffers.length === 0) {
    return <div className="mx-auto max-w-5xl space-y-5"><div className="page-header"><h1 className="text-2xl font-bold text-gray-900">My Offers</h1></div><div className="card py-12 text-center text-gray-400"><p className="text-sm">You haven't submitted any Offers yet.</p><Link to="/supplier/marketplace" className="btn-primary mt-4 inline-flex">Browse Opportunities</Link></div></div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="page-header"><div><h1 className="text-2xl font-bold text-gray-900">My Offers</h1><p className="mt-1 text-sm text-gray-500">Offer → Selection → Negotiation → Mutual Commitment. Only uncommitted Offer residual remains revisable.</p></div><div className="text-sm text-gray-500">{myOffers.length} total</div></div>
      {activeOffers.length > 0 && <div><h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">Active Offers</h2><div className="space-y-4">{activeOffers.map(offer => { const offerSelections = selections.filter(selection => selection.offerId === offer.id); const thread = offerSelections.map(selection => negotiations.find(item => item.selectionId === selection.id && item.status === 'Active')).find(Boolean); return <OfferCard key={offer.id} offer={offer} demand={demands.find(demand => demand.id === offer.demandId)} selections={offerSelections} negotiationThreadId={thread?.id} onRevise={() => handleRevise(offer)} onWithdraw={() => handleWithdraw(offer)} onConfirmSelection={handleConfirmSelection} onCounterSelection={handleCounterSelection} onDeclineSelection={handleDeclineSelection} />; })}</div></div>}
      {closedOffers.length > 0 && <div><h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">Past Offers</h2><div className="space-y-4 opacity-85">{closedOffers.map(offer => <OfferCard key={offer.id} offer={offer} demand={demands.find(demand => demand.id === offer.demandId)} selections={selections.filter(selection => selection.offerId === offer.id)} onRevise={() => {}} onWithdraw={() => {}} onConfirmSelection={handleConfirmSelection} onCounterSelection={handleCounterSelection} onDeclineSelection={handleDeclineSelection} />)}</div></div>}
      {editingOffer && editingDemand && <OfferModal demand={editingDemand} offer={editingOffer} onClose={() => setEditingOfferId(null)} onSaved={() => setRevision(value => value + 1)} />}
    </div>
  );
}
