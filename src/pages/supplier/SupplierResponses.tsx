import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import OfferModal from '../../components/OfferModal';
import { useApp } from '../../context/AppContext';
import { formatTargetPrice, getGate1Demands } from '../../data/gate1DemandData';
import {
  declineSelection,
  getCurrentOfferVersion,
  getGate1Offers,
  getGate1Selections,
  getOfferSelectableQuantity,
  getOfferVersions,
  withdrawOffer,
} from '../../data/gate1OfferData';
import type { DemandPost, Offer, SelectedAllocation } from '../../types';

function OfferCard({
  offer,
  demand,
  selections,
  onRevise,
  onWithdraw,
  onDeclineSelection,
}: {
  offer: Offer;
  demand?: DemandPost;
  selections: SelectedAllocation[];
  onRevise: () => void;
  onWithdraw: () => void;
  onDeclineSelection: (selection: SelectedAllocation) => void;
}) {
  const version = getCurrentOfferVersion(offer);
  const versions = getOfferVersions(offer.id);
  const selectable = getOfferSelectableQuantity(offer);
  const pendingSelection = selections.find(selection => selection.status === 'Pending Supplier Confirmation');

  return (
    <div className="card transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="font-bold text-gray-900">{demand?.cropName ?? 'Demand'}</div>
          <div className="text-xs text-gray-500">{demand?.buyerName} • {demand?.location}</div>
          <div className="mt-1 text-xs text-gray-400">Offer {offer.id} · version {offer.currentVersionNumber}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5"><StatusBadge status={offer.status} size="md" /><span className="text-xs text-gray-400">Submitted {offer.submittedAt}</span></div>
      </div>

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

      {pendingSelection && (
        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="font-semibold text-yellow-900">Buyer Selection Received</div>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm"><div><span className="text-yellow-700">Selected quantity</span><div className="font-semibold text-yellow-950">{pendingSelection.selectedQuantity.toLocaleString()} {pendingSelection.unit}</div></div><div><span className="text-yellow-700">Reservation expires</span><div className="font-semibold text-yellow-950">{new Date(pendingSelection.reservationExpiresAt).toLocaleString()}</div></div></div>
          <p className="mt-2 text-xs text-yellow-800">The quantity is temporarily reserved. Supplier Confirm / Counter will enter the Negotiation & Commitment flow in Increment 1D. You may decline now with a recorded reason.</p>
          <button onClick={() => onDeclineSelection(pendingSelection)} className="btn-danger mt-3 text-xs">Decline Selection</button>
        </div>
      )}

      {offer.status === 'Active' && !pendingSelection && (
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3"><button onClick={onRevise} className="btn-secondary text-sm">Revise Offer</button><button onClick={onWithdraw} className="btn-danger text-sm">Withdraw Offer</button></div>
      )}
      {offer.withdrawalReason && <div className="mt-3 text-xs text-gray-500">Withdrawal reason: {offer.withdrawalReason}</div>}
    </div>
  );
}

export default function SupplierResponses() {
  const { currentUser } = useApp();
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  void revision;

  const demands = getGate1Demands();
  const myOffers = getGate1Offers().filter(offer => offer.supplierId === currentUser?.id);
  const selections = getGate1Selections().filter(selection => selection.supplierId === currentUser?.id);
  const activeOffers = myOffers.filter(offer => offer.status === 'Active' || offer.status === 'Selected');
  const closedOffers = myOffers.filter(offer => !['Active', 'Selected'].includes(offer.status));
  const editingOffer = myOffers.find(offer => offer.id === editingOfferId);
  const editingDemand = editingOffer ? demands.find(demand => demand.id === editingOffer.demandId) : undefined;

  const handleWithdraw = (offer: Offer) => {
    const reason = window.prompt('Reason for withdrawing this unselected Offer:');
    if (!reason) return;
    const result = withdrawOffer(offer.id, reason);
    if (result.error) window.alert(result.error);
    else setRevision(value => value + 1);
  };

  const handleDeclineSelection = (selection: SelectedAllocation) => {
    if (!currentUser) return;
    const reason = window.prompt('Reason for declining this Buyer Selection:');
    if (!reason) return;
    const result = declineSelection(selection.id, currentUser.id, reason);
    if (result.error) window.alert(result.error);
    else setRevision(value => value + 1);
  };

  if (myOffers.length === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="page-header"><h1 className="text-2xl font-bold text-gray-900">My Offers</h1></div>
        <div className="card py-12 text-center text-gray-400"><p className="text-sm">You haven't submitted any Offers yet.</p><Link to="/supplier/marketplace" className="btn-primary mt-4 inline-flex">Browse Opportunities</Link></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="page-header"><div><h1 className="text-2xl font-bold text-gray-900">My Offers</h1><p className="mt-1 text-sm text-gray-500">One active Offer per Supplier per Demand; revisions preserve immutable history.</p></div><div className="text-sm text-gray-500">{myOffers.length} total</div></div>

      {activeOffers.length > 0 && <div><h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">Active Offers</h2><div className="space-y-4">{activeOffers.map(offer => <OfferCard key={offer.id} offer={offer} demand={demands.find(demand => demand.id === offer.demandId)} selections={selections.filter(selection => selection.offerId === offer.id)} onRevise={() => setEditingOfferId(offer.id)} onWithdraw={() => handleWithdraw(offer)} onDeclineSelection={handleDeclineSelection} />)}</div></div>}
      {closedOffers.length > 0 && <div><h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">Past Offers</h2><div className="space-y-4 opacity-85">{closedOffers.map(offer => <OfferCard key={offer.id} offer={offer} demand={demands.find(demand => demand.id === offer.demandId)} selections={selections.filter(selection => selection.offerId === offer.id)} onRevise={() => {}} onWithdraw={() => {}} onDeclineSelection={handleDeclineSelection} />)}</div></div>}

      {editingOffer && editingDemand && <OfferModal demand={editingDemand} offer={editingOffer} onClose={() => setEditingOfferId(null)} onSaved={() => setRevision(value => value + 1)} />}
    </div>
  );
}
