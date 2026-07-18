import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Package, DollarSign, User,
  AlertTriangle, CheckCircle, Image as ImageIcon, X, ZoomIn,
} from 'lucide-react';
import { mockDemandPosts, mockResponses, mockTransactions } from '../../data/mockData';
import { sampleResponsePhotos, type SupplierResponsePhoto } from '../../data/sampleResponsePhotos';
import StatusBadge from '../../components/StatusBadge';

export default function DemandDetail() {
  const { id } = useParams();
  const demand = mockDemandPosts.find(d => d.id === id) ?? mockDemandPosts[0];
  const responses = mockResponses.filter(r => r.demandId === demand.id);
  const matchedTx = mockTransactions.find(t => t.demandId === demand.id);

  const [confirmMatchId, setConfirmMatchId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<SupplierResponsePhoto | null>(null);

  const isMatchable = demand.status === 'Response Received';
  const isMatched = demand.status === 'Matched' || demand.status === 'In Transaction';
  const isActionable = !['Completed', 'Cancelled', 'Expired', 'Matched', 'In Transaction'].includes(demand.status);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="Supplier product photo preview"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-white text-gray-700 shadow-lg flex items-center justify-center hover:bg-gray-100"
              aria-label="Close photo preview"
            >
              <X size={20} />
            </button>
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
              className="w-full max-h-[75vh] object-contain rounded-2xl bg-white shadow-2xl"
            />
            <div className="mt-3 bg-white rounded-xl px-4 py-3 text-sm text-gray-700 shadow-lg">
              {selectedPhoto.caption}
            </div>
          </div>
        </div>
      )}

      {confirmMatchId && (() => {
        const r = responses.find(resp => resp.id === confirmMatchId)!;
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Match</h3>
              <p className="text-sm text-gray-600 mb-4">
                You are about to match this demand with <strong>{r.supplierName}</strong>. This action is irreversible in this MVP — all other pending responses will be automatically declined.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">Supplier</span><span className="font-medium">{r.supplierName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Offered Qty</span><span className="font-medium">{r.availableQuantity.toLocaleString()} {r.unit}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Offered Price</span><span className="font-semibold text-green-700">₱{r.offeredPrice.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Fulfillment Date</span><span className="font-medium">{r.fulfillmentDate}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmMatchId(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button
                  onClick={() => { alert('Match confirmed! Transaction created. (Demo)'); setConfirmMatchId(null); }}
                  className="btn-primary flex-1 justify-center"
                >
                  <CheckCircle size={15} /> Confirm Match
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/buyer/demands" className="btn-ghost py-1.5 px-3">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{demand.cropName}</h1>
        <StatusBadge status={demand.status} size="md" />
        {responses.length > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
            {responses.length} response{responses.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card">
            <h2 className="section-title mb-4">Demand Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: <Package size={16} className="text-gray-400" />, label: 'Category', value: demand.cropCategory },
                { icon: <Package size={16} className="text-gray-400" />, label: 'Variety', value: demand.variety || '—' },
                { icon: <Package size={16} className="text-gray-400" />, label: 'Quantity', value: `${demand.quantity.toLocaleString()} ${demand.unit}` },
                { icon: <DollarSign size={16} className="text-gray-400" />, label: 'Target Price', value: `₱${demand.targetPrice.toLocaleString()}/${demand.unit}` },
                { icon: <MapPin size={16} className="text-gray-400" />, label: 'Location', value: demand.location },
                { icon: <Package size={16} className="text-gray-400" />, label: 'Delivery Pref.', value: demand.deliveryPreference },
                { icon: <Calendar size={16} className="text-gray-400" />, label: 'Required Date', value: demand.requiredDate },
                { icon: <Calendar size={16} className="text-gray-400" />, label: 'Expiration', value: demand.expirationDate },
                { icon: <User size={16} className="text-gray-400" />, label: 'Buyer Type', value: demand.buyerType },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">{row.icon}{row.label}</div>
                  <div className="text-sm font-medium text-gray-900">{row.value}</div>
                </div>
              ))}
            </div>

            {demand.qualitySpecs && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Quality Specifications</div>
                <p className="text-sm text-gray-700">{demand.qualitySpecs}</p>
              </div>
            )}
            {demand.notes && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-1">Notes</div>
                <p className="text-sm text-gray-700">{demand.notes}</p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Supplier Responses ({responses.length})</h2>
              {isMatchable && <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">Action required — review photos and accept one to match</span>}
            </div>
            {responses.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No responses yet. Your demand post is visible to verified suppliers.</div>
            ) : (
              <div className="space-y-4">
                {responses.map(r => {
                  const priceDelta = r.offeredPrice - demand.targetPrice;
                  const photos = sampleResponsePhotos[r.id] ?? [];

                  return (
                    <div key={r.id} className={`rounded-xl border p-4 ${r.status === 'Matched' ? 'border-green-300 bg-green-50' : r.status === 'Rejected' ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-gray-200 bg-white'}`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{r.supplierName}</div>
                          <div className="text-xs text-gray-500 capitalize">{r.supplierType.replace('_', ' ')}</div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-xs text-gray-500 block">Offered Qty</span>
                          {r.availableQuantity.toLocaleString()} {r.unit}
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Offered Price</span>
                          <span className="font-semibold text-green-700">₱{r.offeredPrice.toLocaleString()}</span>
                          <span className={`text-xs block ${priceDelta <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                            {priceDelta === 0 ? 'at target' : priceDelta < 0 ? `₱${Math.abs(priceDelta).toLocaleString()} below` : `₱${priceDelta.toLocaleString()} above`}
                          </span>
                        </div>
                        <div><span className="text-xs text-gray-500 block">Fulfillment Date</span>{r.fulfillmentDate}</div>
                        <div><span className="text-xs text-gray-500 block">Submitted</span>{r.createdAt}</div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon size={15} className="text-green-600" />
                          <span className="text-xs font-semibold text-gray-700">Supplier Product Photos ({photos.length})</span>
                        </div>
                        {photos.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {photos.map(photo => (
                              <button
                                type="button"
                                key={photo.src}
                                onClick={() => setSelectedPhoto(photo)}
                                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                                aria-label={`View ${photo.alt}`}
                              >
                                <img
                                  src={photo.src}
                                  alt={photo.alt}
                                  className="w-full aspect-[4/3] object-cover transition-transform duration-200 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1">
                                    <ZoomIn size={13} /> View photo
                                  </span>
                                </div>
                                <div className="p-2 text-xs text-gray-600 line-clamp-2">{photo.caption}</div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-4">
                            No product photos were included in this supplier response.
                          </div>
                        )}
                      </div>

                      {r.qualityConfirmation && (
                        <div className="text-xs bg-green-50 border border-green-100 rounded p-2 mb-2">
                          <span className="font-medium text-green-700">Quality confirmed: </span>
                          <span className="text-green-600">{r.qualityConfirmation}</span>
                        </div>
                      )}
                      {r.remarks && <p className="text-xs text-gray-500 italic mb-2">"{r.remarks}"</p>}
                      {isMatchable && r.status === 'Pending' && (
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => setConfirmMatchId(r.id)} className="btn-primary text-xs py-1.5">
                            <CheckCircle size={13} /> Accept & Match
                          </button>
                          <button onClick={() => alert('Response declined (Demo)')} className="btn-danger text-xs py-1.5">Decline</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">Status Timeline</h3>
            <div className="space-y-3">
              {[
                { label: 'Demand Created', date: demand.createdAt, done: true },
                { label: 'Posted / Open', date: demand.createdAt, done: demand.status !== 'Draft' },
                { label: 'Response Received', date: responses[0]?.createdAt, done: demand.responseCount > 0 },
                { label: 'Matched', date: matchedTx?.matchedAt ?? '', done: isMatched || demand.status === 'Completed' },
                { label: 'In Transaction', date: '', done: demand.status === 'In Transaction' || demand.status === 'Completed' },
                { label: 'Completed', date: '', done: demand.status === 'Completed' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border-2 ${item.done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`} />
                  <div>
                    <div className={`text-sm font-medium ${item.done ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</div>
                    {item.date && item.done && <div className="text-xs text-gray-400">{item.date}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isMatched && matchedTx && (
            <Link to={`/transactions/${matchedTx.id}`} className="btn-primary w-full justify-center">
              View Transaction Workspace
            </Link>
          )}

          <div className="card border-red-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" /> Actions
            </h3>
            <div className="space-y-2">
              {isActionable && (
                <button onClick={() => alert('Demand withdrawn. (Demo)')} className="btn-danger w-full justify-center text-xs">
                  Withdraw Demand
                </button>
              )}
              {isMatched && (
                <button
                  onClick={() => alert('Cancellation request submitted. Admin will review. (Demo)')}
                  className="btn-danger w-full justify-center text-xs bg-orange-600 hover:bg-orange-700"
                >
                  Request Cancellation
                </button>
              )}
              {isMatched && (
                <Link to="/disputes" className="btn-danger w-full justify-center text-xs bg-red-700 hover:bg-red-800">
                  Raise Dispute
                </Link>
              )}
              {!isActionable && !isMatched && (
                <p className="text-xs text-gray-400 text-center py-2">No actions available for this status.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
