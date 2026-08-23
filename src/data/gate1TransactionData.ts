import { getGate1Demands, saveGate1Demand } from './gate1DemandData';
import {
  getCurrentOfferVersion,
  getGate1Offers,
  getGate1Selections,
  saveGate1Offer,
  saveOfferEvent,
  saveSelection,
  saveSelectionEvent,
} from './gate1OfferData';
import type {
  CommitmentAcceptance,
  DemandQuantityState,
  DemandResidualWaiver,
  DemandToleranceAcceptance,
  FulfillmentRecord,
  Gate1Transaction,
  MarketplaceRole,
  NegotiationProposal,
  NegotiationThread,
  SelectedAllocation,
} from '../types';

const THREAD_KEY = 'ani-market-gate1-negotiation-threads';
const PROPOSAL_KEY = 'ani-market-gate1-negotiation-proposals';
const ACCEPTANCE_KEY = 'ani-market-gate1-commitment-acceptances';
const TRANSACTION_KEY = 'ani-market-gate1-transactions';
const FULFILLMENT_KEY = 'ani-market-gate1-fulfillment-records';
const WAIVER_KEY = 'ani-market-gate1-residual-waivers';
const TOLERANCE_KEY = 'ani-market-gate1-tolerance-acceptances';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function upsert<T extends { id: string }>(key: string, item: T) {
  const items = readJson<T[]>(key, []);
  const index = items.findIndex(existing => existing.id === item.id);
  if (index >= 0) items[index] = item;
  else items.push(item);
  writeJson(key, items);
}

export function getNegotiationThreads(): NegotiationThread[] {
  return readJson<NegotiationThread[]>(THREAD_KEY, []);
}

export function getNegotiationProposals(threadId?: string): NegotiationProposal[] {
  const items = readJson<NegotiationProposal[]>(PROPOSAL_KEY, []);
  return (threadId ? items.filter(item => item.threadId === threadId) : items)
    .sort((a, b) => a.versionNumber - b.versionNumber);
}

export function getCommitmentAcceptances(threadId?: string): CommitmentAcceptance[] {
  const items = readJson<CommitmentAcceptance[]>(ACCEPTANCE_KEY, []);
  return threadId ? items.filter(item => item.threadId === threadId) : items;
}

export function getGate1Transactions(): Gate1Transaction[] {
  return readJson<Gate1Transaction[]>(TRANSACTION_KEY, []);
}

export function getFulfillmentRecords(transactionId?: string): FulfillmentRecord[] {
  const items = readJson<FulfillmentRecord[]>(FULFILLMENT_KEY, []);
  return transactionId ? items.filter(item => item.transactionId === transactionId) : items;
}

export function getResidualWaivers(demandId?: string): DemandResidualWaiver[] {
  const items = readJson<DemandResidualWaiver[]>(WAIVER_KEY, []);
  return demandId ? items.filter(item => item.demandId === demandId) : items;
}

export function getToleranceAcceptances(demandId?: string): DemandToleranceAcceptance[] {
  const items = readJson<DemandToleranceAcceptance[]>(TOLERANCE_KEY, []);
  return demandId ? items.filter(item => item.demandId === demandId) : items;
}

function isReservationLive(selection: SelectedAllocation, now = new Date().toISOString()) {
  return ['Pending Supplier Confirmation', 'Negotiating', 'Ready for Commitment'].includes(selection.status) && selection.reservationExpiresAt > now;
}

function liveSelectionsForDemand(demandId: string, excludingSelectionId?: string) {
  return getGate1Selections().filter(selection =>
    selection.demandId === demandId &&
    selection.id !== excludingSelectionId &&
    isReservationLive(selection)
  );
}

function activeTransactionsForDemand(demandId: string) {
  return getGate1Transactions().filter(transaction =>
    transaction.demandId === demandId &&
    !['Cancelled'].includes(transaction.status)
  );
}

export function getDemandQuantityState(demandId: string): DemandQuantityState {
  const demand = getGate1Demands().find(item => item.id === demandId);
  if (!demand) {
    return {
      demandId,
      requestedQuantity: 0,
      historicalCommittedQuantity: 0,
      reservedQuantity: 0,
      activeCommittedQuantity: 0,
      fulfilledQuantity: 0,
      acceptedToleranceVariance: 0,
      waivedResidual: 0,
      remainingQuantity: 0,
      conservationTotal: 0,
      balanced: true,
    };
  }

  const transactions = activeTransactionsForDemand(demandId);
  const historicalCommittedQuantity = transactions.reduce((sum, transaction) => sum + transaction.historicalCommittedQuantity, 0);
  const fulfilledQuantity = transactions.reduce((sum, transaction) => sum + transaction.acceptedQuantity + transaction.acceptedExcessQuantity, 0);
  const activeCommittedQuantity = transactions.reduce((sum, transaction) => sum + transaction.activeCommittedQuantity, 0);
  const reservedQuantity = liveSelectionsForDemand(demandId).reduce((sum, selection) => sum + selection.selectedQuantity, 0);
  const acceptedToleranceVariance = getToleranceAcceptances(demandId).reduce((sum, item) => sum + item.quantity, 0);
  const waivedResidual = getResidualWaivers(demandId).reduce((sum, item) => sum + item.quantity, 0);
  const occupied = fulfilledQuantity + activeCommittedQuantity + reservedQuantity + acceptedToleranceVariance + waivedResidual;
  const remainingQuantity = Math.max(0, demand.quantity - occupied);
  const conservationTotal = occupied + remainingQuantity;

  return {
    demandId,
    requestedQuantity: demand.quantity,
    historicalCommittedQuantity,
    reservedQuantity,
    activeCommittedQuantity,
    fulfilledQuantity,
    acceptedToleranceVariance,
    waivedResidual,
    remainingQuantity,
    conservationTotal,
    balanced: Math.abs(conservationTotal - demand.quantity) < 0.000001,
  };
}

function syncDemandStatus(demandId: string) {
  const demand = getGate1Demands().find(item => item.id === demandId);
  if (!demand || ['Cancelled', 'Expired', 'Suspended'].includes(demand.status)) return;
  const state = getDemandQuantityState(demandId);
  let status = demand.status;
  if (state.remainingQuantity === 0 && state.reservedQuantity > 0 && state.activeCommittedQuantity === 0 && state.fulfilledQuantity === 0) status = 'Fully Reserved';
  else if (state.remainingQuantity === 0 && state.activeCommittedQuantity > 0 && state.reservedQuantity === 0 && state.fulfilledQuantity === 0) status = 'Fully Committed';
  else if (state.fulfilledQuantity >= demand.quantity) status = 'Fulfilled';
  else if (state.fulfilledQuantity > 0) status = 'Partially Fulfilled';
  else if (state.reservedQuantity > 0 || state.activeCommittedQuantity > 0) status = 'Partially Allocated';
  else if (demand.status !== 'Open for Offers') status = 'Open for Offers';
  if (status !== demand.status) saveGate1Demand({ ...demand, status, updatedAt: new Date().toISOString() });
}

function selectionOrError(selectionId: string) {
  const selection = getGate1Selections().find(item => item.id === selectionId);
  if (!selection) return { error: 'Selection not found.' } as const;
  if (selection.reservationExpiresAt <= new Date().toISOString() && selection.status !== 'Committed') {
    saveSelection({ ...selection, status: 'Expired', releasedAt: new Date().toISOString() });
    syncDemandStatus(selection.demandId);
    return { error: 'The Selection reservation has expired. Reselect and revalidate quantity before continuing.' } as const;
  }
  return { selection } as const;
}

function termsFromSelection(selection: SelectedAllocation) {
  const offer = getGate1Offers().find(item => item.id === selection.offerId);
  const offerVersion = offer ? getCurrentOfferVersion(offer) : undefined;
  const demand = getGate1Demands().find(item => item.id === selection.demandId);
  if (!offer || !offerVersion || !demand) return undefined;
  return { offer, offerVersion, demand };
}

function createThreadForSelection(selection: SelectedAllocation): { thread?: NegotiationThread; proposal?: NegotiationProposal; error?: string } {
  const existing = getNegotiationThreads().find(thread => thread.selectionId === selection.id && thread.status === 'Active');
  if (existing) {
    const proposal = getNegotiationProposals(existing.id).find(item => item.versionNumber === existing.currentProposalVersion);
    return { thread: existing, proposal };
  }
  const terms = termsFromSelection(selection);
  if (!terms) return { error: 'Offer or Demand terms are unavailable.' };
  const now = new Date().toISOString();
  const thread: NegotiationThread = {
    id: `neg-${selection.id}`,
    selectionId: selection.id,
    demandId: selection.demandId,
    offerId: selection.offerId,
    buyerId: selection.buyerId,
    supplierId: selection.supplierId,
    status: 'Active',
    currentProposalVersion: 1,
    createdAt: now,
  };
  const proposal: NegotiationProposal = {
    id: `${thread.id}-v1`,
    threadId: thread.id,
    versionNumber: 1,
    proposedById: selection.buyerId,
    proposedByRole: 'buyer',
    quantity: selection.selectedQuantity,
    unit: selection.unit,
    unitPrice: terms.offerVersion.offeredPrice,
    fulfillmentDate: terms.offerVersion.fulfillmentDate,
    specificationVariations: terms.offerVersion.specificationVariations,
    remarks: 'Buyer Selection of current Offer terms.',
    status: 'Pending',
    createdAt: now,
  };
  upsert(THREAD_KEY, thread);
  upsert(PROPOSAL_KEY, proposal);
  const acceptance: CommitmentAcceptance = {
    id: `acc-${thread.id}-buyer-v1`,
    threadId: thread.id,
    proposalVersion: 1,
    actorId: selection.buyerId,
    actorRole: 'buyer',
    acceptanceSource: 'Buyer Selection',
    acceptedAt: selection.selectedAt,
  };
  upsert(ACCEPTANCE_KEY, acceptance);
  saveSelection({ ...selection, status: 'Negotiating', negotiationThreadId: thread.id });
  saveSelectionEvent({ id: `se-${selection.id}-neg-${Date.now()}`, selectionId: selection.id, demandId: selection.demandId, offerId: selection.offerId, eventType: 'Negotiation Started', actorId: selection.buyerId, actorRole: 'buyer', createdAt: now });
  return { thread, proposal };
}

export function startCounterOffer(params: {
  selectionId: string;
  actorId: string;
  actorRole: MarketplaceRole;
  quantity: number;
  unitPrice: number;
  fulfillmentDate: string;
  specificationVariations?: string;
  remarks?: string;
}): { proposal?: NegotiationProposal; error?: string } {
  const found = selectionOrError(params.selectionId);
  if ('error' in found) return { error: found.error };
  const selection = found.selection;
  if (params.actorId !== selection.buyerId && params.actorId !== selection.supplierId) return { error: 'Only the selected Buyer or Supplier may negotiate.' };
  if (params.quantity <= 0 || params.unitPrice <= 0 || !params.fulfillmentDate) return { error: 'Quantity, price, and fulfillment date are required.' };
  const created = createThreadForSelection(selection);
  if (!created.thread) return { error: created.error ?? 'Unable to create negotiation.' };
  const thread = created.thread;
  const proposals = getNegotiationProposals(thread.id);
  const current = proposals.find(item => item.versionNumber === thread.currentProposalVersion);
  if (current && current.status === 'Pending') upsert(PROPOSAL_KEY, { ...current, status: 'Countered' as const });
  const nextVersion = thread.currentProposalVersion + 1;
  const now = new Date().toISOString();
  const proposal: NegotiationProposal = {
    id: `${thread.id}-v${nextVersion}-${Date.now()}`,
    threadId: thread.id,
    versionNumber: nextVersion,
    proposedById: params.actorId,
    proposedByRole: params.actorRole,
    quantity: params.quantity,
    unit: selection.unit,
    unitPrice: params.unitPrice,
    fulfillmentDate: params.fulfillmentDate,
    specificationVariations: params.specificationVariations?.trim() || undefined,
    remarks: params.remarks?.trim() || undefined,
    status: 'Pending',
    createdAt: now,
  };
  upsert(PROPOSAL_KEY, proposal);
  upsert(THREAD_KEY, { ...thread, currentProposalVersion: nextVersion, updatedAt: now });
  saveSelection({ ...selection, status: 'Negotiating', negotiationThreadId: thread.id });
  return { proposal };
}

function availableForCommit(selection: SelectedAllocation) {
  const demand = getGate1Demands().find(item => item.id === selection.demandId);
  if (!demand) return 0;
  const otherReserved = liveSelectionsForDemand(selection.demandId, selection.id).reduce((sum, item) => sum + item.selectedQuantity, 0);
  const state = getDemandQuantityState(selection.demandId);
  const occupiedWithoutThisReservation = state.fulfilledQuantity + state.activeCommittedQuantity + otherReserved + state.acceptedToleranceVariance + state.waivedResidual;
  return Math.max(0, demand.quantity - occupiedWithoutThisReservation);
}

function commitProposal(selection: SelectedAllocation, thread: NegotiationThread, proposal: NegotiationProposal, acceptingActorId: string, acceptingActorRole: MarketplaceRole, source: CommitmentAcceptance['acceptanceSource']): { transaction?: Gate1Transaction; error?: string } {
  if (thread.currentProposalVersion !== proposal.versionNumber || proposal.status !== 'Pending') return { error: 'Only the current actionable proposal may be accepted.' };
  if (proposal.proposedById === acceptingActorId) return { error: 'The proposing party cannot provide both sides of acceptance.' };
  if (proposal.quantity > availableForCommit(selection)) return { error: 'The proposed quantity is no longer fully available. Reselect or reduce quantity before commitment.' };
  const terms = termsFromSelection(selection);
  if (!terms) return { error: 'Offer or Demand terms are unavailable.' };
  const now = new Date().toISOString();
  const acceptance: CommitmentAcceptance = {
    id: `acc-${thread.id}-${acceptingActorRole}-v${proposal.versionNumber}-${Date.now()}`,
    threadId: thread.id,
    proposalVersion: proposal.versionNumber,
    actorId: acceptingActorId,
    actorRole: acceptingActorRole,
    acceptanceSource: source,
    acceptedAt: now,
  };
  upsert(ACCEPTANCE_KEY, acceptance);
  const acceptances = [...getCommitmentAcceptances(thread.id), acceptance].filter(item => item.proposalVersion === proposal.versionNumber);
  const hasBuyer = acceptances.some(item => item.actorRole === 'buyer');
  const hasSupplier = acceptances.some(item => item.actorRole === 'supplier');
  if (!hasBuyer || !hasSupplier) return { error: 'Both Buyer and Supplier acceptance are required for the same proposal version.' };

  upsert(PROPOSAL_KEY, { ...proposal, status: 'Accepted' as const });
  upsert(THREAD_KEY, { ...thread, status: 'Committed' as const, updatedAt: now, committedAt: now });

  const committedValue = proposal.quantity * proposal.unitPrice;
  const transactionId = `g1tx-${Date.now()}`;
  const transaction: Gate1Transaction = {
    id: transactionId,
    transactionReference: `ANI-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`,
    demandId: selection.demandId,
    offerId: selection.offerId,
    selectionId: selection.id,
    negotiationThreadId: thread.id,
    buyerId: selection.buyerId,
    supplierId: selection.supplierId,
    finalTerms: {
      buyerId: selection.buyerId,
      buyerName: terms.demand.buyerName,
      supplierId: selection.supplierId,
      supplierName: terms.offer.supplierName,
      supplierType: terms.offer.supplierType,
      cropName: terms.demand.cropName,
      cropCategory: terms.demand.cropCategory,
      variety: terms.demand.variety,
      specification: terms.demand.qualitySpecs,
      specificationVariations: proposal.specificationVariations,
      committedQuantity: proposal.quantity,
      unit: proposal.unit,
      agreedTransactionPrice: proposal.unitPrice,
      committedTransactionValue: committedValue,
      fulfillmentMethod: terms.demand.deliveryPreference,
      fulfillmentLocation: terms.demand.location,
      fulfillmentDate: proposal.fulfillmentDate,
      fulfillmentWindowEnd: terms.demand.fulfillmentWindowEnd,
      negotiationProposalVersion: proposal.versionNumber,
      offerVersionNumber: selection.offerVersionNumber,
      committedAt: now,
    },
    historicalCommittedQuantity: proposal.quantity,
    activeCommittedQuantity: proposal.quantity,
    presentedQuantity: 0,
    acceptedQuantity: 0,
    rejectedQuantity: 0,
    acceptedExcessQuantity: 0,
    releasedShortfallQuantity: 0,
    committedTransactionValue: committedValue,
    finalTransactionValue: 0,
    operationalContactReleased: true,
    status: 'Committed',
    committedAt: now,
  };
  upsert(TRANSACTION_KEY, transaction);
  saveSelection({ ...selection, selectedQuantity: proposal.quantity, status: 'Committed', negotiationThreadId: thread.id, transactionId });
  saveSelectionEvent({ id: `se-${selection.id}-commit-${Date.now()}`, selectionId: selection.id, demandId: selection.demandId, offerId: selection.offerId, eventType: 'Committed', actorId: acceptingActorId, actorRole: acceptingActorRole, createdAt: now });
  saveGate1Offer({ ...terms.offer, status: 'Selected', updatedAt: now });
  saveOfferEvent({ id: `oe-${terms.offer.id}-commit-${Date.now()}`, offerId: terms.offer.id, demandId: selection.demandId, supplierId: selection.supplierId, eventType: 'Committed', versionNumber: selection.offerVersionNumber, actorId: acceptingActorId, actorRole: acceptingActorRole, createdAt: now });
  syncDemandStatus(selection.demandId);
  return { transaction };
}

export function supplierConfirmSelection(selectionId: string, supplierId: string): { transaction?: Gate1Transaction; error?: string } {
  const found = selectionOrError(selectionId);
  if ('error' in found) return { error: found.error };
  if (found.selection.supplierId !== supplierId) return { error: 'Only the selected Supplier may confirm.' };
  const created = createThreadForSelection(found.selection);
  if (!created.thread || !created.proposal) return { error: created.error ?? 'Unable to prepare commitment.' };
  saveSelectionEvent({ id: `se-${selectionId}-supplier-confirm-${Date.now()}`, selectionId, demandId: found.selection.demandId, offerId: found.selection.offerId, eventType: 'Supplier Confirmed', actorId: supplierId, actorRole: 'supplier', createdAt: new Date().toISOString() });
  return commitProposal(found.selection, created.thread, created.proposal, supplierId, 'supplier', 'Supplier Confirmation');
}

export function acceptCurrentProposal(selectionId: string, actorId: string, actorRole: MarketplaceRole): { transaction?: Gate1Transaction; error?: string } {
  const found = selectionOrError(selectionId);
  if ('error' in found) return { error: found.error };
  const selection = found.selection;
  const thread = getNegotiationThreads().find(item => item.selectionId === selection.id && item.status === 'Active');
  if (!thread) return { error: 'No active negotiation exists.' };
  const proposal = getNegotiationProposals(thread.id).find(item => item.versionNumber === thread.currentProposalVersion);
  if (!proposal) return { error: 'Current proposal not found.' };
  const expectedActor = actorRole === 'buyer' ? selection.buyerId : selection.supplierId;
  if (expectedActor !== actorId) return { error: `Only the selected ${actorRole} may accept.` };
  return commitProposal(selection, thread, proposal, actorId, actorRole, 'Explicit Acceptance');
}

export function recordFulfillment(params: {
  transactionId: string;
  presentedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  actorId: string;
  remarks?: string;
}): { transaction?: Gate1Transaction; error?: string } {
  const transaction = getGate1Transactions().find(item => item.id === params.transactionId);
  if (!transaction) return { error: 'Transaction not found.' };
  if (params.actorId !== transaction.buyerId) return { error: 'Buyer confirmation is required for accepted fulfillment.' };
  if (params.presentedQuantity < 0 || params.acceptedQuantity < 0 || params.rejectedQuantity < 0) return { error: 'Quantities cannot be negative.' };
  if (params.acceptedQuantity + params.rejectedQuantity > params.presentedQuantity) return { error: 'Accepted plus rejected quantity cannot exceed presented quantity.' };

  const stateBefore = getDemandQuantityState(transaction.demandId);
  const contractOutstanding = Math.max(0, transaction.historicalCommittedQuantity - transaction.acceptedQuantity - transaction.acceptedExcessQuantity - transaction.releasedShortfallQuantity);
  const acceptedAgainstCommitment = Math.min(params.acceptedQuantity, contractOutstanding);
  const excessRequested = Math.max(0, params.acceptedQuantity - acceptedAgainstCommitment);
  const acceptedExcess = Math.min(excessRequested, stateBefore.remainingQuantity);
  const now = new Date().toISOString();
  const newAccepted = transaction.acceptedQuantity + acceptedAgainstCommitment;
  const newExcess = transaction.acceptedExcessQuantity + acceptedExcess;
  const outstanding = Math.max(0, transaction.historicalCommittedQuantity - newAccepted - transaction.releasedShortfallQuantity);
  const unitPrice = transaction.finalTerms.agreedTransactionPrice;
  const updated: Gate1Transaction = {
    ...transaction,
    presentedQuantity: transaction.presentedQuantity + params.presentedQuantity,
    acceptedQuantity: newAccepted,
    rejectedQuantity: transaction.rejectedQuantity + params.rejectedQuantity,
    acceptedExcessQuantity: newExcess,
    activeCommittedQuantity: outstanding,
    finalTransactionValue: (newAccepted + newExcess) * unitPrice,
    status: outstanding > 0 ? (newAccepted > 0 ? 'Partially Fulfilled' : 'In Fulfillment') : 'Fulfilled',
    updatedAt: now,
  };
  upsert(TRANSACTION_KEY, updated);
  upsert(FULFILLMENT_KEY, {
    id: `fr-${transaction.id}-${Date.now()}`,
    transactionId: transaction.id,
    presentedQuantity: params.presentedQuantity,
    acceptedQuantity: acceptedAgainstCommitment + acceptedExcess,
    rejectedQuantity: params.rejectedQuantity,
    remarks: params.remarks?.trim() || undefined,
    actorId: params.actorId,
    createdAt: now,
  } satisfies FulfillmentRecord);
  syncDemandStatus(transaction.demandId);
  return { transaction: updated };
}

export function releaseUnfulfilledCommitment(transactionId: string, quantity: number, reason: string): { transaction?: Gate1Transaction; error?: string } {
  const transaction = getGate1Transactions().find(item => item.id === transactionId);
  if (!transaction) return { error: 'Transaction not found.' };
  if (!reason.trim()) return { error: 'Release reason is required.' };
  if (quantity <= 0 || quantity > transaction.activeCommittedQuantity) return { error: 'Release quantity must be within the active committed outstanding quantity.' };
  const now = new Date().toISOString();
  const activeCommittedQuantity = transaction.activeCommittedQuantity - quantity;
  const updated: Gate1Transaction = {
    ...transaction,
    activeCommittedQuantity,
    releasedShortfallQuantity: transaction.releasedShortfallQuantity + quantity,
    status: activeCommittedQuantity === 0 && transaction.acceptedQuantity > 0 ? 'Partially Fulfilled' : transaction.status,
    updatedAt: now,
  };
  upsert(TRANSACTION_KEY, updated);
  syncDemandStatus(transaction.demandId);
  return { transaction: updated };
}

export function waiveResidual(demandId: string, buyerId: string, quantity: number, reason: string): { waiver?: DemandResidualWaiver; error?: string } {
  const demand = getGate1Demands().find(item => item.id === demandId);
  if (!demand || demand.buyerId !== buyerId) return { error: 'Only the Demand Buyer may waive residual sourcing.' };
  if (!reason.trim()) return { error: 'Residual waiver reason is required.' };
  const state = getDemandQuantityState(demandId);
  if (state.activeCommittedQuantity > 0 || state.reservedQuantity > 0) return { error: 'Resolve or release all active obligations before waiving residual quantity.' };
  if (quantity <= 0 || quantity > state.remainingQuantity) return { error: 'Waiver quantity must be within current Remaining Quantity.' };
  const waiver: DemandResidualWaiver = { id: `waiver-${demandId}-${Date.now()}`, demandId, quantity, reason: reason.trim(), buyerId, createdAt: new Date().toISOString() };
  upsert(WAIVER_KEY, waiver);
  const after = getDemandQuantityState(demandId);
  if (after.remainingQuantity === 0) saveGate1Demand({ ...demand, status: 'Closed — Accepted Partial Fulfillment', updatedAt: new Date().toISOString() });
  return { waiver };
}

export function acceptToleranceVariance(demandId: string, buyerId: string, quantity: number, toleranceLimitQuantity: number, reason: string): { acceptance?: DemandToleranceAcceptance; error?: string } {
  const demand = getGate1Demands().find(item => item.id === demandId);
  if (!demand || demand.buyerId !== buyerId) return { error: 'Only the Demand Buyer may accept tolerance variance.' };
  if (!reason.trim()) return { error: 'Tolerance acceptance reason is required.' };
  const state = getDemandQuantityState(demandId);
  if (state.activeCommittedQuantity > 0 || state.reservedQuantity > 0) return { error: 'Resolve active obligations before tolerance closure.' };
  if (quantity <= 0 || quantity > state.remainingQuantity || quantity > toleranceLimitQuantity) return { error: 'Tolerance quantity exceeds Remaining Quantity or the configured tolerance limit.' };
  const acceptance: DemandToleranceAcceptance = { id: `tol-${demandId}-${Date.now()}`, demandId, quantity, toleranceLimitQuantity, reason: reason.trim(), buyerId, createdAt: new Date().toISOString() };
  upsert(TOLERANCE_KEY, acceptance);
  const after = getDemandQuantityState(demandId);
  if (after.remainingQuantity === 0) saveGate1Demand({ ...demand, status: 'Closed — Fulfilled Within Tolerance', updatedAt: new Date().toISOString() });
  return { acceptance };
}
