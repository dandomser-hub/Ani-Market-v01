import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';
import { formatTargetPrice, getGate1Demands } from '../../data/gate1DemandData';
import {
  createSelection,
  getCurrentOfferVersion,
  getDemandOffers,
  getDemandRemainingForSelection,
  getDemandReservedQuantity,
  getGate1Selections,
  getOfferSelectableQuantity,
  getShortlistedDemandOffers,
  withdrawSelection,
} from '../../data/gate1OfferData';
import type { Offer, SelectedAllocation } from '../../types';

const CONFIRMATION_WINDOWS = [4, 8, 12, 16, 20, 24] as const;

export default function BuyerResponses() {
  const { currentUser } = useApp();
  const [batchesShown, setBatchesShown] = useState<Record<string, number>>({});
  const [selectingOfferId, setSelectingOfferId] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [confirmationWindow, setConfirmationWindow] = useState<(typeof CONFIRMATION_WINDOWS)[number]>(8);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  void revision;

  const demands = getGate1Demands().filter(demand => demand.buyerId === currentUser?.id);
  const selections = getGate1Selections().filter(selection => selection.buyerId === currentUser?.id);
  const demandsWithOffers = demands.filter(demand => getDemandOffers(demand.id).length > 0);
  const selectingOffer = selectingOfferId ? demandsWithOffers.flatMap(demand => getDemandOffers(demand.id)).find(offer => offer.id === selectingOfferId) : undefined;
  const selectingDemand = selectingOffer ? demands.find(demand => demand.id === selectingOffer.demandId) : undefined;
  const selectingVersion = selectingOffer ? getCurrentOfferVersion(selectingOffer) : undefined;
  const selectingMax = selectingOffer ? getOfferSelectableQuantity(selectingOffer) : 0;

  const openSelection = (offer: Offer) => {
    const selectable = getOfferSelectableQuantity(offer);
    setSelectingOfferId(offer.id);
    setSelectedQuantity(selectable > 0 ? selectable.toString() : '');
    setConfirmationWindow(8);
    setError('');
  };

  const confirmSelection = () => {
    if (!currentUser || !selectingOffer || !selectingDemand) return;
    const result = createSelection({
      demand: selectingDemand,
      offer: selectingOffer,
      buyerId: currentUser.id,
      selectedQuantity: Number(selectedQuantity),
      confirmationWindowHours: confirmationWindow,
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    setSelectingOfferId(null);
    setSelectedQuantity('');
    setRevision(value => value + 1);
  };

  const handleWithdrawSelection = (selection: SelectedAllocation) => {
    if (!currentUser) return;
    const reason = window.prompt('Reason for withdrawing this Selection before Supplier confirmation:');
    if (!reason) return;
    const result = withdrawSelection(selection.id, currentUser.id, reason);
    if (result.error) window.alert(result.error);
    else setRevision(value => value + 1);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compare Supplier Offers</h1>
          <p className="mt-1 text-sm text-gray-500">Default order is Submission Time. Ani Market does not automatically rank or select a winning Supplier.</p>
        </div>
      </div>

      {demandsWithOffers.length === 0 ? (
        <div className="card py-12 text-center text-gray-400"><p className="text-sm">No Supplier Offers are available for your Demands yet.</p><Link to="/buyer/demands" className="btn-primary mt-4 inline-flex">View My Demands</Link></div>
      ) : (
        <div className="space-y-6">
          {demandsWithOffers.map(demand => {
            const batch = getShortlistedDemandOffers(demand.id, batchesShown[demand.id] ?? 1);
            const allOffers = getDemandOffers(demand.id);
            const demandSelections = selections.filter(selection => selection.demandId === demand.id);
            const activeSelections = demandSelections.filter(selection => selection.status === 'Pending Supplier Confirmation' || selection.status === 'Ready for Commitment');
            const reserved = getDemandReservedQuantity(demand.id);
            const remaining = getDemandRemainingForSelection(demand.id);

            return (
              <section key={demand.id} className="card space-y-4">
                <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-gray-900">{demand.cropName}</h2><StatusBadge status={demand.status} /></div>
                    <div className="mt-1 text-sm text-gray-500">Requested {demand.quantity.toLocaleString()} {demand.unit} · Buyer target {formatTargetPrice(demand.targetPriceProfile, demand.targetPrice)}/{demand.unit}</div>
                    <div className="mt-1 text-xs text-gray-400">{allOffers.length} Offer{allOffers.length !== 1 ? 's' : ''} received · earliest valid submissions shown first</div>
                  </div>
                  <Link to={`/buyer/demands/${demand.id}`} className="btn-secondary text-xs">View Demand</Link>
                </div>

                <div className="grid grid-cols-3 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                  <div><div className="text-xs text-gray-500">Requested</div><div className="font-bold text-gray-900">{demand.quantity.toLocaleString()} {demand.unit}</div></div>
                  <div><div className="text-xs text-gray-500">Temporarily Reserved</div><div className="font-bold text-yellow-700">{reserved.toLocaleString()} {demand.unit}</div></div>
                  <div><div className="text-xs text-gray-500">Remaining for Selection</div><div className="font-bold text-green-700">{remaining.toLocaleString()} {demand.unit}</div></div>
                </div>

                {activeSelections.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Active Buyer Selections</h3>
                    {activeSelections.map(selection => {
                      const offer = allOffers.find(item => item.id === selection.offerId);
                      return <div key={selection.id} className="flex flex-col justify-between gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm sm:flex-row sm:items-center"><div><strong className="text-yellow-950">{offer?.supplierName ?? selection.supplierId}</strong><div className="text-xs text-yellow-800">{selection.selectedQuantity.toLocaleString()} {selection.unit} reserved · expires {new Date(selection.reservationExpiresAt).toLocaleString()}</div></div><div className="flex items-center gap-2"><StatusBadge status={selection.status} /><button onClick={() => handleWithdrawSelection(selection)} className="btn-danger text-xs">Withdraw</button></div></div>;
                    })}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-sm">
                    <thead><tr className="border-b border-gray-200">{['Submitted', 'Supplier', 'Offer Qty', 'Selectable', 'Offered Price', 'Fulfillment', 'Specifications', 'Validity', ''].map(header => <th key={header} className="px-2 py-3 text-left text-xs font-semibold text-gray-500">{header}</th>)}</tr></thead>
                    <tbody>
                      {batch.visible.map(offer => {
                        const version = getCurrentOfferVersion(offer);
                        if (!version) return null;
                        const selectable = getOfferSelectableQuantity(offer);
                        const hasActiveSelection = activeSelections.some(selection => selection.offerId === offer.id);
                        const legacySelected = Boolean(offer.legacyResponseId && offer.status === 'Selected');
                        return (
                          <tr key={offer.id} className="border-b border-gray-50 align-top hover:bg-gray-50">
                            <td className="px-2 py-3 text-xs text-gray-500">{offer.submittedAt}<div className="mt-1">v{offer.currentVersionNumber}</div></td>
                            <td className="px-2 py-3"><div className="font-semibold text-gray-900">{offer.supplierName}</div><div className="text-xs capitalize text-gray-400">{offer.supplierType.replace('_', ' ')}</div><StatusBadge status={offer.status} /></td>
                            <td className="px-2 py-3 font-medium text-gray-800">{version.offeredQuantity.toLocaleString()} {version.unit}</td>
                            <td className="px-2 py-3 font-semibold text-blue-700">{selectable.toLocaleString()} {version.unit}</td>
                            <td className="px-2 py-3"><div className="font-semibold text-green-700">₱{version.offeredPrice.toLocaleString()}</div>{version.priceBasis && <div className="mt-1 text-xs text-gray-400">{version.priceBasis}</div>}</td>
                            <td className="px-2 py-3 text-gray-700">{version.fulfillmentDate}</td>
                            <td className="max-w-[260px] px-2 py-3"><div className="text-xs text-gray-700">{version.specificationConfirmation}</div>{version.specificationVariations && <div className="mt-1 rounded bg-amber-50 p-1.5 text-xs text-amber-700">Variation: {version.specificationVariations}</div>}{version.evidence.length > 0 && <div className="mt-1 text-xs text-gray-400">{version.evidence.length} evidence reference{version.evidence.length !== 1 ? 's' : ''}</div>}</td>
                            <td className="px-2 py-3 text-xs text-gray-500">{version.validUntil}</td>
                            <td className="px-2 py-3 text-right">{legacySelected ? <span className="text-xs text-gray-400">Legacy matched record</span> : hasActiveSelection ? <span className="text-xs font-medium text-yellow-700">Selection pending</span> : selectable > 0 ? <button onClick={() => openSelection(offer)} className="btn-primary whitespace-nowrap text-xs">Select Quantity</button> : <span className="text-xs text-gray-400">Not currently selectable</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {batch.hiddenCount > 0 && <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-3"><p className="text-xs text-blue-700">{batch.hiddenCount} later Offer{batch.hiddenCount !== 1 ? 's' : ''} remain hidden in the next FCFS batch; they are not rejected.</p><button onClick={() => setBatchesShown(current => ({ ...current, [demand.id]: (current[demand.id] ?? 1) + 1 }))} className="btn-secondary text-xs">Show Next Offers</button></div>}
              </section>
            );
          })}
        </div>
      )}

      {selectingOffer && selectingDemand && selectingVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between"><div><h3 className="text-lg font-bold text-gray-900">Select Supplier Quantity</h3><p className="text-sm text-gray-500">{selectingOffer.supplierName} · Offer v{selectingOffer.currentVersionNumber}</p></div><button onClick={() => setSelectingOfferId(null)} className="text-2xl leading-none text-gray-400">&times;</button></div>
            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm"><div className="flex justify-between"><span className="text-gray-500">Offer Quantity</span><strong>{selectingVersion.offeredQuantity.toLocaleString()} {selectingVersion.unit}</strong></div><div className="flex justify-between"><span className="text-gray-500">Currently Selectable</span><strong>{selectingMax.toLocaleString()} {selectingVersion.unit}</strong></div><div className="flex justify-between"><span className="text-gray-500">Offered Price</span><strong className="text-green-700">₱{selectingVersion.offeredPrice.toLocaleString()}</strong></div></div>
            <div className="space-y-4"><div><label className="label">Quantity to Select *</label><input type="number" min="1" max={selectingMax} className="input" value={selectedQuantity} onChange={event => setSelectedQuantity(event.target.value)} /></div><div><label className="label">Supplier Confirmation Window *</label><div className="grid grid-cols-3 gap-2">{CONFIRMATION_WINDOWS.map(hours => <button key={hours} type="button" onClick={() => setConfirmationWindow(hours)} className={`rounded-lg border px-3 py-2 text-sm ${confirmationWindow === hours ? 'border-green-500 bg-green-50 font-semibold text-green-700' : 'border-gray-200 text-gray-600'}`}>{hours}h</button>)}</div></div><div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">Selection creates a temporary reservation only. It does not create a Transaction or binding Commitment. Supplier confirmation/countering continues in Increment 1D.</div><div className="flex gap-3"><button onClick={() => setSelectingOfferId(null)} className="btn-secondary flex-1 justify-center">Cancel</button><button onClick={confirmSelection} disabled={Number(selectedQuantity) <= 0 || Number(selectedQuantity) > selectingMax} className="btn-primary flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50">Reserve Selection</button></div></div>
          </div>
        </div>
      )}
    </div>
  );
}
