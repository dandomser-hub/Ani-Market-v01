import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import DemandQuantityProgress from '../../components/DemandQuantityProgress';
import { useApp } from '../../context/AppContext';
import { getGate1Demands } from '../../data/gate1DemandData';
import { getGate1Offers } from '../../data/gate1OfferData';
import { acceptCurrentProposal, counterNegotiation, declineNegotiation, getCommitmentAcceptances, getCurrentNegotiationProposal, getGate1Transactions, getNegotiationProposals, getNegotiationThreads } from '../../data/gate1CommerceData';
import { getLiveSelections } from '../../data/gate1FlowData';
import type { MarketplaceRole } from '../../types';

export default function NegotiationWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, currentRole } = useApp();
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  void revision;

  const thread = getNegotiationThreads().find(item => item.id === id);
  const proposals = thread ? getNegotiationProposals(thread.id) : [];
  const currentProposal = thread ? getCurrentNegotiationProposal(thread.id) : undefined;
  const selection = thread ? getLiveSelections().find(item => item.id === thread.selectionId) : undefined;
  const demand = thread ? getGate1Demands().find(item => item.id === thread.demandId) : undefined;
  const offer = thread ? getGate1Offers().find(item => item.id === thread.offerId) : undefined;
  const acceptances = thread ? getCommitmentAcceptances(thread.id) : [];
  const transaction = thread ? getGate1Transactions().find(item => item.negotiationThreadId === thread.id) : undefined;

  if (!thread || !selection || !demand || !offer) return <div className="card mx-auto max-w-3xl">Negotiation not found.</div>;

  const actorRole = currentRole === 'buyer' || currentRole === 'supplier' ? currentRole as MarketplaceRole : undefined;
  const actorAuthorized = Boolean(currentUser && actorRole && currentUser.id === (actorRole === 'buyer' ? thread.buyerId : thread.supplierId));
  const receiverCanAct = Boolean(actorAuthorized && actorRole && currentProposal && currentProposal.status === 'Pending' && currentProposal.proposedByRole !== actorRole && thread.status === 'Active');
  const reservationExpired = selection.reservationExpiresAt <= new Date().toISOString() && selection.status !== 'Committed';

  const handleAccept = () => {
    if (!currentUser || !actorRole) return;
    const result = acceptCurrentProposal(thread.id, currentUser.id, actorRole);
    if ('error' in result) {
      setError(result.error ?? 'Unable to accept the current proposal.');
      setRevision(value => value + 1);
      return;
    }
    navigate(`/gate1-transactions/${result.transaction.id}`);
  };

  const handleCounter = () => {
    if (!currentUser || !actorRole || !currentProposal) return;
    const quantity = Number(window.prompt(`Counter quantity (${currentProposal.unit}). The original Selection reservation remains unchanged until Commitment.`, currentProposal.quantity.toString()));
    if (!quantity) return;
    const price = Number(window.prompt(`Counter price (₱/${currentProposal.unit})`, currentProposal.unitPrice.toString()));
    if (!price) return;
    const fulfillmentDate = window.prompt('Counter fulfillment date (YYYY-MM-DD)', currentProposal.fulfillmentDate);
    if (!fulfillmentDate) return;
    const specificationVariations = window.prompt('Specification variation, if any', currentProposal.specificationVariations ?? '') ?? '';
    const remarks = window.prompt('Commercial remarks, if any', '') ?? '';
    const result = counterNegotiation(thread.id, currentUser.id, actorRole, { quantity, unitPrice: price, fulfillmentDate, specificationVariations, remarks });
    if ('error' in result) setError(result.error ?? 'Unable to create the counter-proposal.');
    else {
      setError('');
      setRevision(value => value + 1);
    }
  };

  const handleDecline = () => {
    if (!currentUser || !actorRole) return;
    const reason = window.prompt('Reason for declining this negotiation:');
    if (!reason) return;
    const result = declineNegotiation(thread.id, currentUser.id, actorRole, reason);
    if ('error' in result) setError(result.error ?? 'Unable to decline this negotiation.');
    else navigate(actorRole === 'buyer' ? '/buyer/responses' : '/supplier/responses');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center gap-3"><Link to={currentRole === 'supplier' ? '/supplier/responses' : '/buyer/responses'} className="btn-ghost py-1.5 px-3"><ArrowLeft size={16} /> Back</Link><div><h1 className="text-xl font-bold text-gray-900">Negotiation Workspace</h1><p className="text-xs text-gray-500">{demand.cropName} · {offer.supplierName} · Selection {selection.id}</p></div><StatusBadge status={thread.status} size="md" /></div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {reservationExpired && thread.status === 'Active' && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">The Selection reservation has expired. This negotiation is stale and cannot create a Transaction without a fresh Selection/revalidation.</div>}
      <div className="card"><DemandQuantityProgress demandId={demand.id} unit={demand.unit} compact /></div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {currentProposal && <div className="card border-green-200"><div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="section-title">Current Actionable Proposal — v{currentProposal.versionNumber}</h2><p className="text-xs text-gray-500">Proposed by {currentProposal.proposedByRole} · {currentProposal.createdAt}</p></div><StatusBadge status={currentProposal.status} /></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><div><div className="text-xs text-gray-500">Quantity</div><div className="font-semibold">{currentProposal.quantity.toLocaleString()} {currentProposal.unit}</div></div><div><div className="text-xs text-gray-500">Unit Price</div><div className="font-semibold text-green-700">₱{currentProposal.unitPrice.toLocaleString()}</div></div><div><div className="text-xs text-gray-500">Value if committed</div><div className="font-semibold">₱{(currentProposal.quantity * currentProposal.unitPrice).toLocaleString()}</div></div><div><div className="text-xs text-gray-500">Fulfillment</div><div className="font-semibold">{currentProposal.fulfillmentDate}</div></div></div>{currentProposal.specificationVariations && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><strong>Specification variation:</strong> {currentProposal.specificationVariations}</div>}{currentProposal.remarks && <div className="mt-3 text-sm italic text-gray-500">“{currentProposal.remarks}”</div>}{receiverCanAct && !reservationExpired && <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4"><button onClick={handleAccept} className="btn-primary"><CheckCircle size={15} /> Accept Current Version</button><button onClick={handleCounter} className="btn-secondary"><RefreshCw size={15} /> Counter</button><button onClick={handleDecline} className="btn-danger"><XCircle size={15} /> Decline</button></div>}{actorAuthorized && currentProposal.proposedByRole === actorRole && thread.status === 'Active' && <p className="mt-4 text-xs text-gray-500">You proposed the current version and are already recorded as accepting it. Await the other party’s Accept / Counter / Decline action.</p>}</div>}
          <div className="card"><h2 className="section-title mb-4">Immutable Proposal History</h2><div className="space-y-3">{[...proposals].reverse().map(proposal => { const versionAcceptances = acceptances.filter(item => item.proposalVersion === proposal.versionNumber); return <div key={proposal.id} className="rounded-xl border border-gray-200 p-4"><div className="flex items-start justify-between gap-3"><div><strong>v{proposal.versionNumber}</strong> · {proposal.proposedByRole}<div className="text-xs text-gray-400">{proposal.createdAt}</div></div><StatusBadge status={proposal.status} /></div><div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4"><span>{proposal.quantity.toLocaleString()} {proposal.unit}</span><span>₱{proposal.unitPrice.toLocaleString()}</span><span>{proposal.fulfillmentDate}</span><span>{versionAcceptances.length} acceptance record{versionAcceptances.length !== 1 ? 's' : ''}</span></div>{proposal.remarks && <p className="mt-2 text-xs text-gray-500">{proposal.remarks}</p>}</div>; })}</div></div>
        </div>
        <div className="space-y-5"><div className="card"><h3 className="font-semibold text-gray-800">Reservation Control</h3><div className="mt-3 space-y-2 text-sm"><div><span className="text-xs text-gray-500 block">Original selected quantity</span>{selection.selectedQuantity.toLocaleString()} {selection.unit}</div><div><span className="text-xs text-gray-500 block">Expires</span>{new Date(selection.reservationExpiresAt).toLocaleString()}</div><div><span className="text-xs text-gray-500 block">Status</span><StatusBadge status={selection.status} /></div></div><p className="mt-3 text-xs text-gray-500">Counter-proposals do not reset, extend, or independently increase the reservation. A quantity increase is tested against live Remaining Quantity only when both parties accept the same version.</p></div><div className="card"><h3 className="font-semibold text-gray-800">Commitment Rule</h3><p className="mt-2 text-sm text-gray-600">Mutual Commitment exists only when Buyer and Supplier acceptance records point to the same current proposal version and quantity/eligibility revalidation passes atomically.</p>{transaction && <Link to={`/gate1-transactions/${transaction.id}`} className="btn-primary mt-4 w-full justify-center">Open Transaction</Link>}</div></div>
      </div>
    </div>
  );
}
