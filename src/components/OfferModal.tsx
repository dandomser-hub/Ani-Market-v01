import { useState } from 'react';
import type { DemandPost, Offer, SupplierType } from '../types';
import { useApp } from '../context/AppContext';
import TransactionAccessNotice from './TransactionAccessNotice';
import {
  createOffer,
  getCurrentOfferVersion,
  reviseOffer,
} from '../data/gate1OfferData';
import { formatTargetPrice } from '../data/gate1DemandData';

interface Props {
  demand: DemandPost;
  offer?: Offer;
  onClose: () => void;
  onSaved?: () => void;
}

export default function OfferModal({ demand, offer, onClose, onSaved }: Props) {
  const { canTransact, currentUser } = useApp();
  const currentVersion = offer ? getCurrentOfferVersion(offer) : undefined;
  const [form, setForm] = useState({
    qty: currentVersion?.offeredQuantity.toString() ?? '',
    price: currentVersion?.offeredPrice.toString() ?? demand.targetPrice.toString(),
    priceBasis: currentVersion?.priceBasis ?? '',
    fulfillmentDate: currentVersion?.fulfillmentDate ?? '',
    qualityConfirm: currentVersion?.specificationConfirmation ?? '',
    variations: currentVersion?.specificationVariations ?? '',
    remarks: currentVersion?.remarks ?? '',
    validUntil: currentVersion?.validUntil ?? demand.expirationDate,
    evidenceLabels: currentVersion?.evidence.map(item => item.label).join(', ') ?? '',
    changeReason: '',
  });
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [error, setError] = useState('');

  const update = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }));
  const canSubmit = canTransact && Number(form.qty) > 0 && Number(form.price) > 0 && Boolean(form.fulfillmentDate) && Boolean(form.qualityConfirm.trim()) && Boolean(form.validUntil);

  const handleReview = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setError('');
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!canTransact || !currentUser) return;
    const input = {
      offeredQuantity: Number(form.qty),
      unit: demand.unit,
      offeredPrice: Number(form.price),
      priceBasis: form.priceBasis,
      fulfillmentDate: form.fulfillmentDate,
      specificationConfirmation: form.qualityConfirm,
      specificationVariations: form.variations,
      remarks: form.remarks,
      validUntil: form.validUntil,
      evidenceLabels: form.evidenceLabels.split(',').map(item => item.trim()).filter(Boolean),
    };

    if (offer) {
      const result = reviseOffer(offer.id, input, form.changeReason);
      if (result.errors.length > 0) {
        setError(result.errors.join(' '));
        setStep('form');
        return;
      }
    } else {
      const supplierType: SupplierType = currentUser.supplierProfile?.supplierType ?? currentUser.supplierType ?? 'organized_supplier';
      const result = createOffer({ demand, supplierId: currentUser.id, supplierName: currentUser.name, supplierType, input });
      if (result.errors.length > 0) {
        setError(result.errors.join(' '));
        setStep('form');
        return;
      }
    }

    onSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {step === 'confirm' ? (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirm {offer ? 'Offer Revision' : 'Offer Submission'}</h3>
                <p className="text-sm text-gray-500">{demand.cropName} · {demand.buyerName}</p>
              </div>
              <button onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="mb-5 space-y-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm">
              <div className="flex justify-between gap-3"><span className="text-gray-500">Quantity Offered</span><strong>{Number(form.qty).toLocaleString()} {demand.unit}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-gray-500">Offered Price</span><strong className="text-green-700">₱{Number(form.price).toLocaleString()}/{demand.unit}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-gray-500">Fulfillment Date</span><strong>{form.fulfillmentDate}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-gray-500">Valid Until</span><strong>{form.validUntil}</strong></div>
              {form.variations && <div className="border-t border-green-200 pt-2"><span className="text-gray-500">Specification variation: </span>{form.variations}</div>}
            </div>
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              {offer
                ? `This will create Offer version ${offer.currentVersionNumber + 1}. Earlier versions remain in the audit history.`
                : 'This creates one active Offer for this Demand. You may revise or withdraw the unselected Offer later; withdrawal requires a reason.'}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('form')} className="btn-secondary flex-1 justify-center">Back</button>
              <button type="button" onClick={handleConfirm} className="btn-primary flex-1 justify-center">Confirm & {offer ? 'Revise Offer' : 'Make Offer'}</button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{offer ? 'Revise Offer' : 'Make Offer'}</h3>
                <p className="text-sm text-gray-500">{demand.cropName} — {demand.buyerName}</p>
              </div>
              <button onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            {!canTransact && <div className="mb-4"><TransactionAccessNotice role="supplier" compact /></div>}
            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="text-xs font-semibold text-blue-700">Buyer Target Price</div>
              <div className="mt-1 text-sm font-medium text-blue-900">{formatTargetPrice(demand.targetPriceProfile, demand.targetPrice)} / {demand.unit}</div>
              <p className="mt-1 text-xs text-blue-700">This is Buyer guidance, not a rigid price ceiling. Enter your own offered price.</p>
            </div>

            <form onSubmit={handleReview} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Offered Quantity ({demand.unit}) *</label>
                  <input type="number" className="input" value={form.qty} onChange={event => update('qty', event.target.value)} required />
                  {demand.minimumSupplierQuantity && <p className="mt-1 text-xs text-gray-400">Buyer minimum: {demand.minimumSupplierQuantity.toLocaleString()} {demand.unit}</p>}
                </div>
                <div>
                  <label className="label">Offered Price (₱/{demand.unit}) *</label>
                  <input type="number" className="input" value={form.price} onChange={event => update('price', event.target.value)} required />
                </div>
              </div>

              <div>
                <label className="label">Price Basis <span className="font-normal text-gray-400">(optional)</span></label>
                <input className="input" placeholder="e.g., farm-gate price, delivery included" value={form.priceBasis} onChange={event => update('priceBasis', event.target.value)} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="label">Fulfillment / Availability Date *</label><input type="date" className="input" value={form.fulfillmentDate} onChange={event => update('fulfillmentDate', event.target.value)} required /></div>
                <div><label className="label">Offer Valid Until *</label><input type="date" max={demand.expirationDate} className="input" value={form.validUntil} onChange={event => update('validUntil', event.target.value)} required /></div>
              </div>

              <div>
                <label className="label">Specification Confirmation *</label>
                <textarea className="input resize-none" rows={2} placeholder="Confirm how your crops meet the Buyer specifications." value={form.qualityConfirm} onChange={event => update('qualityConfirm', event.target.value)} required />
              </div>
              <div>
                <label className="label">Specification Variations / Deviations</label>
                <textarea className="input resize-none" rows={2} placeholder="State any variation clearly; leave blank if none." value={form.variations} onChange={event => update('variations', event.target.value)} />
              </div>
              <div>
                <label className="label">Commercial Remarks</label>
                <textarea className="input resize-none" rows={2} placeholder="Additional commercial or fulfillment notes." value={form.remarks} onChange={event => update('remarks', event.target.value)} />
              </div>
              <div>
                <label className="label">Evidence / Photo Labels <span className="font-normal text-gray-400">(prototype)</span></label>
                <input className="input" placeholder="e.g., harvest photo, moisture test; comma-separated" value={form.evidenceLabels} onChange={event => update('evidenceLabels', event.target.value)} />
                <p className="mt-1 text-xs text-gray-400">Gate 1 stores evidence references with the Offer version; binary upload remains a prototype placeholder.</p>
              </div>
              {offer && (
                <div>
                  <label className="label">Revision Note</label>
                  <input className="input" placeholder="Briefly explain the changed terms for Buyer review." value={form.changeReason} onChange={event => update('changeReason', event.target.value)} />
                </div>
              )}
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-800">
                Multiple Suppliers may submit confidential Offers to this Demand. Competing Supplier terms are never shown to you. An Offer is not a binding supply commitment; commitment occurs only after later Buyer Selection and mutual acceptance.
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={!canSubmit} className="btn-primary flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50">Review {offer ? 'Revision' : 'Offer'}</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
