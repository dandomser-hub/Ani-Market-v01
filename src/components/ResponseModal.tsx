import { useState } from 'react';
import type { DemandPost } from '../types';

interface Props {
  demand: DemandPost;
  onClose: () => void;
}

export default function ResponseModal({ demand, onClose }: Props) {
  const [form, setForm] = useState({
    qty: '',
    price: demand.targetPrice.toString(),
    fulfillmentDate: '',
    note: '',
    qualityConfirm: '',
    remarks: '',
  });
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const canSubmit = form.qty.trim() !== '' && form.price.trim() !== '' &&
    form.fulfillmentDate.trim() !== '' && form.qualityConfirm.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleConfirm = () => {
    alert('Response submitted! (Demo)');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        {step === 'confirm' ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Confirm Submission</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Crop</span><span className="font-medium">{demand.cropName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Qty Offered</span><span className="font-medium">{form.qty} {demand.unit}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Price Offered</span><span className="font-medium text-green-700">₱{Number(form.price).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fulfillment Date</span><span className="font-medium">{form.fulfillmentDate}</span></div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 mb-5">
              Once submitted, this response will be visible to the buyer. You cannot edit or retract it in this MVP.
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('form')} className="btn-secondary flex-1 justify-center">Back</button>
              <button type="button" onClick={handleConfirm} className="btn-primary flex-1 justify-center">Confirm & Submit</button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Submit Response</h3>
                <p className="text-sm text-gray-500">{demand.cropName} — {demand.buyerName}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            {demand.qualitySpecs && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs font-semibold text-blue-700 mb-1">Buyer Quality Requirements</div>
                <p className="text-xs text-blue-600">{demand.qualitySpecs}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Available Quantity ({demand.unit}) *</label>
                  <input type="number" className="input" placeholder={demand.quantity.toString()} value={form.qty} onChange={e => update('qty', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Offered Price (₱/{demand.unit}) *</label>
                  <input type="number" className="input" value={form.price} onChange={e => update('price', e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">Fulfillment Date *</label>
                <input type="date" className="input" value={form.fulfillmentDate} onChange={e => update('fulfillmentDate', e.target.value)} required />
              </div>
              <div>
                <label className="label">Pickup / Delivery Note</label>
                <input className="input" placeholder="e.g., Can deliver to Naga City" value={form.note} onChange={e => update('note', e.target.value)} />
              </div>
              <div>
                <label className="label">Quality Spec Confirmation *</label>
                <textarea className="input resize-none" rows={2} placeholder="Confirm you meet the buyer's quality specs..." value={form.qualityConfirm} onChange={e => update('qualityConfirm', e.target.value)} required />
              </div>
              <div>
                <label className="label">Remarks</label>
                <textarea className="input resize-none" rows={2} placeholder="Any additional notes..." value={form.remarks} onChange={e => update('remarks', e.target.value)} />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                By submitting, you confirm you are not responding to your own demand post. One demand may be matched to one supplier only (Lean MVP).
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={!canSubmit} className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed">Review & Submit</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
