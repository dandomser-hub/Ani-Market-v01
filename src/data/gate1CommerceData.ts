import { mockUsers } from './mockData';
import { getGate1Demands, saveGate1Demand } from './gate1DemandData';
import { enrichUserWithGate1Trust, getPrototypeUsers } from './gate1TrustData';
import {
  getGate1Offers,
  getGate1Selections,
  getOfferVersions,
  saveGate1Offer,
  saveOfferEvent,
  saveSelection,
  saveSelectionEvent,
} from './gate1OfferData';
import type {
  AcceptedExcessAdjustment,
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

const THREAD_STORAGE_KEY = 'ani-market-gate1-negotiation-threads';
const PROPOSAL_STORAGE_KEY = 'ani-market-gate1-negotiation-proposals';
const ACCEPTANCE_STORAGE_KEY = 'ani-market-gate1-commitment-acceptances';
const TRANSACTION_STORAGE_KEY = 'ani-market-gate1-transactions';
const FULFILLMENT_STORAGE_KEY = 'ani-market-gate1-fulfillment-records';
const EXCESS_STORAGE_KEY = 'ani-market-gate1-excess-adjustments';
const WAIVER_STORAGE_KEY = 'ani-market-gate1-residual-waivers';
const TOLERANCE_STORAGE_KEY = 'ani-market-gate1-tolerance-acceptances';

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

function allMarketplaceUsers() {
  const byId = new Map(mockUsers.map(user => [user.id, user]));
  getPrototypeUsers().forEach(user => byId.set(user.id, user));
  return Array.from(byId.values()).map(enrichUserWithGate1Trust);
}

export function participantCanTransact(userId: string, role: MarketplaceRole): boolean {
  const user = allMarketplaceUsers().find(item => item.id === userId);
  if (!user || user.accountStatus !== 'Active') return false;
  const accountVerified = user.accountVerification?.emailStatus === 'Verified' && user.accountVerification?.mobileStatus === 'Verified';
  const roleState = user.roleVerifications?.[role];
  return Boolean(accountVerified && roleState?.profileCompleteness === 'Complete' && roleState.marketplaceVerificationStatus === 'Verified' && roleState.transactionAccessStatus === 'Enabled');
}

export function getNegotiationThreads(): NegotiationThread[] {
  return readJson<NegotiationThread[]>(THREAD_STORAGE_KEY, []);
}

export function getNegotiationProposals(threadId?: string): NegotiationProposal[] {
  const proposals = readJson<NegotiationProposal[]>(PROPOSAL_STORAGE_KEY, []);
  return (threadId ? proposals.filter(item => item.threadId === threadId) : proposals).sort((a, b) => a.versionNumber - b.versionNumber);
}

export function getCurrentNegotiationProposal(threadId: string): NegotiationProposal | undefined {
  const thread = getNegotiationThreads().find(item => item.id === threadId);
  return thread ? getNegotiationProposals(threadId).find(item => item.versionNumber === thread.currentProposalVersion) : undefined;
}

export function getCommitmentAcceptances(threadId?: string): CommitmentAcceptance[] {
  const records = readJson<CommitmentAcceptance[]>(ACCEPTANCE_STORAGE_KEY, []);
  return threadId ? records.filter(item => item.threadId === threadId) : records;
}

export function getGate1Transactions(): Gate1Transaction[] {
  return readJson<Gate1Transaction[]>(TRANSACTION_STORAGE_KEY, []);
}

export function getFulfillmentRecords(transactionId?: string): FulfillmentRecord[] {
  const records = readJson<FulfillmentRecord[]>(FULFILLMENT_STORAGE_KEY, []);
  return transactionId ? records.filter(item => item.transactionId === transactionId) : records;
}

export function getAcceptedExcessAdjustments(transactionId?: string): AcceptedExcessAdjustment[] {
  const records = readJson<AcceptedExcessAdjustment[]>(EXCESS_STORAGE_KEY, []);
  return transactionId ? records.filter(item => item.transactionId === transactionId) : records;
}

export function getResidualWaivers(demandId?: string): DemandResidualWaiver[] {
  const records = readJson<DemandResidualWaiver[]>(WAIVER_STORAGE_KEY, []);
  return demandId ? records.filter(item => item.demandId === demandId) : records;
}

export function getToleranceAcceptances(demandId?: string): DemandToleranceAcceptance[] {
  const records = readJson<DemandToleranceAcceptance[]>(TOLERANCE_STORAGE_KEY, []);
  return demandId ? records.filter(item => item.demandId === demandId) : records;
}

function selectionReservationIsActive(selection: SelectedAllocation) {
  return ['Pending Supplier Confirmation', 'Negotiating', 'Ready for Commitment'].includes(selection.status) && selection.reservationExpiresAt > new Date().toISOString();
}

export function getDemandQuantityState(demandId: string): DemandQuantityState {
  const demand = getGate1Demands().find(item => item.id === demandId);
  const requestedQuantity = demand?.quantity ?? 0;
  const transactions = getGate1Transactions().filter(item => item.demandId === demandId && item.status !== 'Cancelled');
  const historicalCommittedQuantity = transactions.reduce((sum, item) => sum + item.historicalCommittedQuantity, 0);
  const activeCommittedQuantity = transactions.reduce((sum, item) => sum + item.activeCommittedQuantity, 0);
  const fulfilledQuantity = transactions.reduce((sum, item) => sum + item.acceptedQuantity + item.acceptedExcessQuantity, 0);
  const reservedQuantity = getGate1Selections().filter(item => item.demandId === demandId && selectionReservationIsActive(item)).reduce((sum, item) => sum + item.selectedQuantity, 0);
  const waivedResidual = getResidualWaivers(demandId).reduce((sum, item) => sum + item.quantity, 0);
  const acceptedToleranceVariance = getToleranceAcceptances(demandId).reduce((sum, item) => sum + item.quantity, 0);
  const covered = fulfilledQuantity + activeCommittedQuantity + reservedQuantity + waivedResidual + acceptedToleranceVariance;
  const remainingQuantity = Math.max(0, requestedQuantity - covered);
  const conservationTotal = covered + remainingQuantity;
  return {
    demandId,
    requestedQuantity,
    historicalCommittedQuantity,
    reservedQuantity,
    activeCommittedQuantity,
    fulfilledQuantity,
    acceptedToleranceVariance,
    waivedResidual,
    remainingQuantity,
    conservationTotal,
    balanced: Math.abs(conservationTotal - requestedQuantity) < 0.000001,
  };
}

export function getOfferCommittedQuantity(offerId: string): number {
  return getGate1Transactions().filter(item => item.offerId === offerId && item.status !== 'Cancelled').reduce((sum, item) => sum + item.historicalCommittedQuantity, 0);
}

function syncDemandStatus(demandId: string) {
  const demand = getGate1Demands().find(item => item.id === demandId);
  if (!demand || !demand.qualification) return;
  const state = getDemandQuantityState(demandId);
  let status = demand.status;
  if (state.remainingQuantity === 0 && state.waivedResidual > 0 && state.reservedQuantity === 0 && state.activeCommittedQuantity === 0) status = 'Closed — Accepted Partial Fulfillment';
  else if (state.remainingQuantity === 0 && state.acceptedToleranceVariance > 0 && state.reservedQuantity === 0 && state.activeCommittedQuantity === 0) status = 'Closed — Fulfilled Within Tolerance';
  else if (state.fulfilledQuantity >= state.requestedQuantity && state.requestedQuantity > 0) status = 'Fulfilled';
  else if (state.fulfilledQuantity > 0 && state.activeCommittedQuantity > 0) status = 'Partially Fulfilled';
  else if (state.remainingQuantity === 0 && state.reservedQuantity > 0) status = 'Fully Reserved';
  else if (state.remainingQuantity === 0 && state.reservedQuantity === 0 && state.activeCommittedQuantity > 0) status = 'Fully Committed';
  else if (state.reservedQuantity > 0 || state.activeCommittedQuantity > 0 || state.fulfilledQuantity > 0) status = 'Partially Allocated';
  else if (!['Cancelled', 'Expired', 'Suspended'].includes(demand.status)) status = 'Open for Offers';
  if (status !== demand.status) saveGate1Demand({ ...demand, status, updatedAt: new Date().toISOString() });
}

function saveThread(thread: NegotiationThread) { upsert(THREAD_STORAGE_KEY, thread); }
function saveProposal(proposal: NegotiationProposal) { upsert(PROPOSAL_STORAGE_KEY, proposal); }
function saveAcceptance(record: CommitmentAcceptance) { upsert(ACCEPTANCE_STORAGE_KEY, record); }
function saveTransaction(transaction: Gate1Transaction) { upsert(TRANSACTION_STORAGE_KEY, transaction); }

function activeSelection(selectionId: string) {
  const selection = getGate1Selections().find(item => item.id === selectionId);
  if (!selection) return { error: 'Selection not found.' } as const;
  if (!selectionReservationIsActive(selection)) return { error: 'Selection reservation has expired or is no longer active.' } as const;
  return { selection } as const;
}

function selectedOfferTerms(selection: SelectedAllocation) {
  const offer = getGate1Offers().find(item => item.id === selection.offerId);
  const version = offer ? getOfferVersions(offer.id).find(item => item.versionNumber === selection.offerVersionNumber) : undefined;
  return offer && version ? { offer, version } : undefined;
}

export interface NegotiatedTermsInput {
  quantity: number;
  unitPrice: number;
  fulfillmentDate: string;
  specificationVariations?: string;
  remarks?: string;
}

function validateNegotiatedTerms(selection: SelectedAllocation, input: NegotiatedTermsInput): string[] {
  const errors: string[] = [];
  if (input.quantity <= 0) errors.push('Proposed quantity must be greater than zero.');
  if (input.unitPrice <= 0) errors.push('Proposed price must be greater than zero.');
  if (!input.fulfillmentDate) errors.push('Fulfillment date is required.');
  const demand = getGate1Demands().find(item => item.id === selection.demandId);
  if (demand?.minimumSupplierQuantity && input.quantity < demand.minimumSupplierQuantity && getDemandQuantityState(selection.demandId).remainingQuantity >= demand.minimumSupplierQuantity) errors.push(`Proposed quantity must meet the Buyer minimum of ${demand.minimumSupplierQuantity.toLocaleString()} ${selection.unit}.`);
  return errors;
}

function appendProposal(thread: NegotiationThread, actorId: string, actorRole: MarketplaceRole, input: NegotiatedTermsInput) {
  const selection = getGate1Selections().find(item => item.id === thread.selectionId);
  if (!selection) return { error: 'Selection not found.' };
  if (actorId !== (actorRole === 'buyer' ? selection.buyerId : selection.supplierId)) return { error: 'Actor is not authorized for this negotiation.' };
  const errors = validateNegotiatedTerms(selection, input);
  if (errors.length) return { error: errors.join(' ') };
  const current = getCurrentNegotiationProposal(thread.id);
  if (current?.status === 'Pending') saveProposal({ ...current, status: 'Countered' });
  const nextVersion = thread.currentProposalVersion + 1;
  const now = new Date().toISOString();
  const proposal: NegotiationProposal = {
    id: `${thread.id}-p${nextVersion}-${Date.now()}`,
    threadId: thread.id,
    versionNumber: nextVersion,
    proposedById: actorId,
    proposedByRole: actorRole,
    quantity: input.quantity,
    unit: selection.unit,
    unitPrice: input.unitPrice,
    fulfillmentDate: input.fulfillmentDate,
    specificationVariations: input.specificationVariations?.trim() || undefined,
    remarks: input.remarks?.trim() || undefined,
    status: 'Pending',
    createdAt: now,
  };
  saveProposal(proposal);
  saveAcceptance({ id: `ca-${thread.id}-p${nextVersion}-${actorId}`, threadId: thread.id, proposalVersion: nextVersion, actorId, actorRole, acceptanceSource: 'Explicit Acceptance', acceptedAt: now });
  const updatedThread = { ...thread, currentProposalVersion: nextVersion, status: 'Active' as const, updatedAt: now };
  saveThread(updatedThread);
  return { thread: updatedThread, proposal };
}

export function startNegotiation(selectionId: string, actorId: string, actorRole: MarketplaceRole, input?: Partial<NegotiatedTermsInput>) {
  const active = activeSelection(selectionId);
  if ('error' in active) return { error: active.error };
  const selection = active.selection;
  if (actorId !== (actorRole === 'buyer' ? selection.buyerId : selection.supplierId)) return { error: 'Actor is not authorized for this Selection.' };
  const existing = getNegotiationThreads().find(item => item.selectionId === selectionId && item.status === 'Active');
  if (existing) return { thread: existing, proposal: getCurrentNegotiationProposal(existing.id) };
  const terms = selectedOfferTerms(selection);
  if (!terms) return { error: 'Selected Offer terms are unavailable.' };
  const now = new Date().toISOString();
  const thread: NegotiationThread = { id: `neg-g1-${Date.now()}`, selectionId, demandId: selection.demandId, offerId: selection.offerId, buyerId: selection.buyerId, supplierId: selection.supplierId, status: 'Active', currentProposalVersion: 0, createdAt: now };
  saveThread(thread);
  const appended = appendProposal(thread, actorId, actorRole, {
    quantity: input?.quantity ?? selection.selectedQuantity,
    unitPrice: input?.unitPrice ?? terms.version.offeredPrice,
    fulfillmentDate: input?.fulfillmentDate ?? terms.version.fulfillmentDate,
    specificationVariations: input?.specificationVariations ?? terms.version.specificationVariations,
    remarks: input?.remarks,
  });
  if ('error' in appended) return appended;
  saveSelection({ ...selection, status: 'Negotiating', negotiationThreadId: thread.id });
  saveSelectionEvent({ id: `se-${selection.id}-neg-${Date.now()}`, selectionId: selection.id, demandId: selection.demandId, offerId: selection.offerId, eventType: 'Negotiation Started', actorId, actorRole, createdAt: now });
  syncDemandStatus(selection.demandId);
  return appended;
}

export function counterNegotiation(threadId: string, actorId: string, actorRole: MarketplaceRole, input: NegotiatedTermsInput) {
  const thread = getNegotiationThreads().find(item => item.id === threadId);
  if (!thread || thread.status !== 'Active') return { error: 'Active negotiation not found.' };
  const active = activeSelection(thread.selectionId);
  if ('error' in active) {
    saveThread({ ...thread, status: 'Stale', updatedAt: new Date().toISOString() });
    return { error: active.error };
  }
  return appendProposal(thread, actorId, actorRole, input);
}

function createCommitmentTransaction(thread: NegotiationThread, proposal: NegotiationProposal) {
  const active = activeSelection(thread.selectionId);
  if ('error' in active) return { error: active.error };
  let selection = active.selection;
  const demand = getGate1Demands().find(item => item.id === selection.demandId);
  const offer = getGate1Offers().find(item => item.id === selection.offerId);
  const selectedOfferVersion = offer ? getOfferVersions(offer.id).find(item => item.versionNumber === selection.offerVersionNumber) : undefined;
  if (!demand || !offer || !selectedOfferVersion) return { error: 'Demand or selected Offer terms are unavailable.' };
  if (!participantCanTransact(selection.buyerId, 'buyer') || !participantCanTransact(selection.supplierId, 'supplier')) return { error: 'Both parties must remain transaction-enabled at Commitment.' };
  if (!['Open for Offers', 'Partially Allocated', 'Fully Reserved'].includes(demand.status)) return { error: 'Demand state no longer permits Commitment.' };

  const quantityState = getDemandQuantityState(demand.id);
  const additionalQuantityNeeded = Math.max(0, proposal.quantity - selection.selectedQuantity);
  if (additionalQuantityNeeded > quantityState.remainingQuantity) return { error: `Negotiated quantity requires ${additionalQuantityNeeded.toLocaleString()} additional ${selection.unit}, but only ${quantityState.remainingQuantity.toLocaleString()} remains available.` };
  const offerAlreadyCommitted = getOfferCommittedQuantity(offer.id);
  if (proposal.quantity + offerAlreadyCommitted > selectedOfferVersion.offeredQuantity) return { error: 'Negotiated quantity exceeds the Supplier Offer quantity still available for commitment.' };
  if (demand.minimumSupplierQuantity && proposal.quantity < demand.minimumSupplierQuantity && quantityState.remainingQuantity + selection.selectedQuantity >= demand.minimumSupplierQuantity) return { error: `Committed quantity must meet the Buyer minimum of ${demand.minimumSupplierQuantity.toLocaleString()} ${demand.unit}.` };
  const acceptances = getCommitmentAcceptances(thread.id).filter(item => item.proposalVersion === proposal.versionNumber);
  if (!acceptances.some(item => item.actorRole === 'buyer') || !acceptances.some(item => item.actorRole === 'supplier')) return { error: 'Mutual Commitment requires Buyer and Supplier acceptance of the same proposal version.' };

  const now = new Date().toISOString();
  const transactionId = `txn-g1-${Date.now()}`;
  selection = { ...selection, selectedQuantity: proposal.quantity, status: 'Committed', transactionId };
  const committedValue = proposal.quantity * proposal.unitPrice;
  const transaction: Gate1Transaction = {
    id: transactionId,
    transactionReference: `AM-${now.slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-6)}`,
    demandId: demand.id,
    offerId: offer.id,
    selectionId: selection.id,
    negotiationThreadId: thread.id,
    buyerId: selection.buyerId,
    supplierId: selection.supplierId,
    finalTerms: {
      buyerId: selection.buyerId,
      buyerName: demand.buyerName,
      supplierId: selection.supplierId,
      supplierName: offer.supplierName,
      supplierType: offer.supplierType,
      cropName: demand.cropName,
      cropCategory: demand.cropCategory,
      variety: demand.variety,
      specification: demand.qualitySpecs,
      specificationVariations: proposal.specificationVariations,
      committedQuantity: proposal.quantity,
      unit: selection.unit,
      agreedTransactionPrice: proposal.unitPrice,
      committedTransactionValue: committedValue,
      fulfillmentMethod: demand.deliveryPreference,
      fulfillmentLocation: demand.location,
      fulfillmentDate: proposal.fulfillmentDate,
      fulfillmentWindowEnd: demand.fulfillmentWindowEnd,
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
  saveSelection(selection);
  saveTransaction(transaction);
  saveThread({ ...thread, status: 'Committed', committedAt: now, updatedAt: now });
  saveProposal({ ...proposal, status: 'Accepted' });
  saveGate1Offer({ ...offer, status: 'Active', updatedAt: now });
  saveSelectionEvent({ id: `se-${selection.id}-committed-${Date.now()}`, selectionId: selection.id, demandId: selection.demandId, offerId: selection.offerId, eventType: 'Committed', actorId: 'system', actorRole: 'admin', createdAt: now });
  saveOfferEvent({ id: `oe-${offer.id}-committed-${Date.now()}`, offerId: offer.id, demandId: demand.id, supplierId: offer.supplierId, eventType: 'Committed', versionNumber: selection.offerVersionNumber, actorId: 'system', actorRole: 'admin', createdAt: now });
  syncDemandStatus(demand.id);
  return { transaction };
}

export function confirmSelectionDirect(selectionId: string, supplierId: string) {
  const active = activeSelection(selectionId);
  if ('error' in active) return { error: active.error };
  const selection = active.selection;
  if (selection.supplierId !== supplierId) return { error: 'Only the selected Supplier may confirm this Selection.' };
  const terms = selectedOfferTerms(selection);
  if (!terms) return { error: 'Selected Offer terms are unavailable.' };
  const now = new Date().toISOString();
  const existing = getNegotiationThreads().find(item => item.selectionId === selectionId);
  const thread: NegotiationThread = existing ?? { id: `neg-g1-${Date.now()}`, selectionId, demandId: selection.demandId, offerId: selection.offerId, buyerId: selection.buyerId, supplierId: selection.supplierId, status: 'Active', currentProposalVersion: 1, createdAt: now };
  const proposal: NegotiationProposal = getCurrentNegotiationProposal(thread.id) ?? {
    id: `${thread.id}-p1`,
    threadId: thread.id,
    versionNumber: 1,
    proposedById: selection.buyerId,
    proposedByRole: 'buyer',
    quantity: selection.selectedQuantity,
    unit: selection.unit,
    unitPrice: terms.version.offeredPrice,
    fulfillmentDate: terms.version.fulfillmentDate,
    specificationVariations: terms.version.specificationVariations,
    remarks: 'Buyer selected the Supplier Offer without changing commercial terms.',
    status: 'Pending',
    createdAt: selection.selectedAt,
  };
  saveThread(thread);
  saveProposal(proposal);
  saveAcceptance({ id: `ca-${thread.id}-p1-buyer`, threadId: thread.id, proposalVersion: 1, actorId: selection.buyerId, actorRole: 'buyer', acceptanceSource: 'Buyer Selection', acceptedAt: selection.selectedAt });
  saveAcceptance({ id: `ca-${thread.id}-p1-supplier`, threadId: thread.id, proposalVersion: 1, actorId: supplierId, actorRole: 'supplier', acceptanceSource: 'Supplier Confirmation', acceptedAt: now });
  saveSelection({ ...selection, status: 'Ready for Commitment', negotiationThreadId: thread.id });
  saveSelectionEvent({ id: `se-${selection.id}-confirmed-${Date.now()}`, selectionId: selection.id, demandId: selection.demandId, offerId: selection.offerId, eventType: 'Supplier Confirmed', actorId: supplierId, actorRole: 'supplier', createdAt: now });
  return createCommitmentTransaction(thread, proposal);
}

export function acceptCurrentProposal(threadId: string, actorId: string, actorRole: MarketplaceRole) {
  const thread = getNegotiationThreads().find(item => item.id === threadId);
  if (!thread || thread.status !== 'Active') return { error: 'Active negotiation not found.' };
  const active = activeSelection(thread.selectionId);
  if ('error' in active) return { error: active.error };
  const selection = active.selection;
  if (actorId !== (actorRole === 'buyer' ? selection.buyerId : selection.supplierId)) return { error: 'Actor is not authorized for this negotiation.' };
  const proposal = getCurrentNegotiationProposal(threadId);
  if (!proposal || proposal.status !== 'Pending') return { error: 'There is no current actionable proposal.' };
  if (proposal.proposedByRole === actorRole) return { error: 'The proposer has already accepted these terms by submitting them. The receiving party must accept or counter.' };
  const now = new Date().toISOString();
  saveAcceptance({ id: `ca-${thread.id}-p${proposal.versionNumber}-${actorId}`, threadId: thread.id, proposalVersion: proposal.versionNumber, actorId, actorRole, acceptanceSource: 'Explicit Acceptance', acceptedAt: now });
  saveSelection({ ...selection, status: 'Ready for Commitment', negotiationThreadId: thread.id });
  saveSelectionEvent({ id: `se-${selection.id}-ready-${Date.now()}`, selectionId: selection.id, demandId: selection.demandId, offerId: selection.offerId, eventType: 'Ready for Commitment', actorId, actorRole, createdAt: now });
  return createCommitmentTransaction(thread, proposal);
}

export function declineNegotiation(threadId: string, actorId: string, actorRole: MarketplaceRole, reason: string) {
  if (!reason.trim()) return { error: 'Decline reason is required.' };
  const thread = getNegotiationThreads().find(item => item.id === threadId);
  if (!thread || thread.status !== 'Active') return { error: 'Active negotiation not found.' };
  const selection = getGate1Selections().find(item => item.id === thread.selectionId);
  if (!selection) return { error: 'Selection not found.' };
  if (actorId !== (actorRole === 'buyer' ? selection.buyerId : selection.supplierId)) return { error: 'Actor is not authorized for this negotiation.' };
  const now = new Date().toISOString();
  const proposal = getCurrentNegotiationProposal(thread.id);
  if (proposal) saveProposal({ ...proposal, status: 'Declined' });
  saveThread({ ...thread, status: 'Declined', updatedAt: now });
  saveSelection({ ...selection, status: actorRole === 'buyer' ? 'Withdrawn by Buyer' : 'Declined by Supplier', releasedAt: now, buyerWithdrawalReason: actorRole === 'buyer' ? reason.trim() : selection.buyerWithdrawalReason, supplierDeclineReason: actorRole === 'supplier' ? reason.trim() : selection.supplierDeclineReason });
  const offer = getGate1Offers().find(item => item.id === selection.offerId);
  if (offer && !offer.legacyResponseId) saveGate1Offer({ ...offer, status: 'Active', updatedAt: now });
  syncDemandStatus(selection.demandId);
  return { success: true };
}

export function recordFulfillment(params: { transactionId: string; buyerId: string; presentedQuantity: number; acceptedQuantity: number; rejectedQuantity: number; remarks?: string }) {
  const transaction = getGate1Transactions().find(item => item.id === params.transactionId);
  if (!transaction) return { error: 'Gate 1 Transaction not found.' };
  if (transaction.buyerId !== params.buyerId) return { error: 'Only the Transaction Buyer may record acceptance.' };
  if (params.presentedQuantity <= 0) return { error: 'Presented quantity must be greater than zero.' };
  if (params.acceptedQuantity < 0 || params.rejectedQuantity < 0 || params.acceptedQuantity + params.rejectedQuantity > params.presentedQuantity) return { error: 'Accepted and rejected quantities must be non-negative and cannot exceed presented quantity.' };
  if (params.acceptedQuantity > transaction.activeCommittedQuantity) return { error: 'Normal acceptance cannot exceed the active committed obligation. Record excess separately through Accepted Excess Adjustment.' };
  const now = new Date().toISOString();
  const acceptedTotal = transaction.acceptedQuantity + params.acceptedQuantity;
  const activeCommittedQuantity = Math.max(0, transaction.activeCommittedQuantity - params.acceptedQuantity);
  const updated: Gate1Transaction = {
    ...transaction,
    presentedQuantity: transaction.presentedQuantity + params.presentedQuantity,
    acceptedQuantity: acceptedTotal,
    rejectedQuantity: transaction.rejectedQuantity + params.rejectedQuantity,
    activeCommittedQuantity,
    finalTransactionValue: (acceptedTotal + transaction.acceptedExcessQuantity) * transaction.finalTerms.agreedTransactionPrice,
    status: activeCommittedQuantity > 0 ? 'Partially Fulfilled' : 'Fulfilled',
    updatedAt: now,
  };
  saveTransaction(updated);
  upsert(FULFILLMENT_STORAGE_KEY, { id: `fr-${transaction.id}-${Date.now()}`, transactionId: transaction.id, presentedQuantity: params.presentedQuantity, acceptedQuantity: params.acceptedQuantity, rejectedQuantity: params.rejectedQuantity, remarks: params.remarks?.trim() || undefined, actorId: params.buyerId, createdAt: now });
  syncDemandStatus(transaction.demandId);
  return { transaction: updated };
}

export function releaseOutstandingCommitment(transactionId: string, buyerId: string, reason: string) {
  const transaction = getGate1Transactions().find(item => item.id === transactionId);
  if (!transaction) return { error: 'Gate 1 Transaction not found.' };
  if (transaction.buyerId !== buyerId) return { error: 'Only the Buyer may release an unresolved outstanding obligation after cure failure.' };
  if (!reason.trim()) return { error: 'Release reason is required.' };
  if (transaction.activeCommittedQuantity <= 0) return { error: 'There is no outstanding committed quantity to release.' };
  const now = new Date().toISOString();
  const releasedQuantity = transaction.activeCommittedQuantity;
  const updated: Gate1Transaction = { ...transaction, activeCommittedQuantity: 0, releasedShortfallQuantity: transaction.releasedShortfallQuantity + releasedQuantity, status: transaction.acceptedQuantity + transaction.acceptedExcessQuantity > 0 ? 'Partially Fulfilled' : 'Committed', updatedAt: now };
  saveTransaction(updated);
  upsert(FULFILLMENT_STORAGE_KEY, { id: `fr-${transaction.id}-release-${Date.now()}`, transactionId: transaction.id, presentedQuantity: 0, acceptedQuantity: 0, rejectedQuantity: 0, remarks: `Outstanding ${releasedQuantity.toLocaleString()} ${transaction.finalTerms.unit} released after cure failure: ${reason.trim()}`, actorId: buyerId, createdAt: now });
  syncDemandStatus(transaction.demandId);
  return { transaction: updated, releasedQuantity };
}

export function acceptExcessAdjustment(transactionId: string, buyerId: string, quantity: number, reason: string, amendedUnitPrice?: number) {
  const transaction = getGate1Transactions().find(item => item.id === transactionId);
  if (!transaction) return { error: 'Gate 1 Transaction not found.' };
  if (transaction.buyerId !== buyerId) return { error: 'Only the Buyer may accept excess quantity.' };
  if (!reason.trim() || quantity <= 0) return { error: 'Positive excess quantity and reason are required.' };
  const state = getDemandQuantityState(transaction.demandId);
  if (quantity > state.remainingQuantity) return { error: `Excess acceptance is limited to the legitimate outstanding Demand of ${state.remainingQuantity.toLocaleString()} ${transaction.finalTerms.unit}.` };
  const unitPrice = amendedUnitPrice && amendedUnitPrice > 0 ? amendedUnitPrice : transaction.finalTerms.agreedTransactionPrice;
  const now = new Date().toISOString();
  const adjustment: AcceptedExcessAdjustment = { id: `exa-${transaction.id}-${Date.now()}`, transactionId, quantity, unitPrice, reason: reason.trim(), buyerId, createdAt: now };
  upsert(EXCESS_STORAGE_KEY, adjustment);
  const updated = { ...transaction, acceptedExcessQuantity: transaction.acceptedExcessQuantity + quantity, finalTransactionValue: transaction.finalTransactionValue + quantity * unitPrice, updatedAt: now };
  saveTransaction(updated);
  syncDemandStatus(transaction.demandId);
  return { transaction: updated, adjustment };
}

export function waiveResidual(demandId: string, buyerId: string, quantity: number, reason: string) {
  const demand = getGate1Demands().find(item => item.id === demandId);
  if (!demand || demand.buyerId !== buyerId) return { error: 'Only the Demand Buyer may waive residual sourcing.' };
  if (!reason.trim() || quantity <= 0) return { error: 'Positive waiver quantity and reason are required.' };
  const state = getDemandQuantityState(demandId);
  if (state.reservedQuantity > 0 || state.activeCommittedQuantity > 0) return { error: 'Residual Waiver is available only after active reservations and committed obligations are resolved.' };
  if (quantity > state.remainingQuantity) return { error: `Waiver cannot exceed Remaining Quantity of ${state.remainingQuantity.toLocaleString()} ${demand.unit}.` };
  const record: DemandResidualWaiver = { id: `rw-${demandId}-${Date.now()}`, demandId, quantity, reason: reason.trim(), buyerId, createdAt: new Date().toISOString() };
  upsert(WAIVER_STORAGE_KEY, record);
  syncDemandStatus(demandId);
  return { record };
}

export function acceptToleranceVariance(demandId: string, buyerId: string, quantity: number, toleranceLimitQuantity: number, reason: string) {
  const demand = getGate1Demands().find(item => item.id === demandId);
  if (!demand || demand.buyerId !== buyerId) return { error: 'Only the Demand Buyer may accept a tolerance variance.' };
  if (!reason.trim() || quantity <= 0 || toleranceLimitQuantity <= 0) return { error: 'Positive variance, configured tolerance limit, and reason are required.' };
  const state = getDemandQuantityState(demandId);
  if (state.reservedQuantity > 0 || state.activeCommittedQuantity > 0) return { error: 'Tolerance closure is available only after active obligations are resolved.' };
  if (quantity > state.remainingQuantity) return { error: 'Tolerance variance cannot exceed Remaining Quantity.' };
  if (quantity > toleranceLimitQuantity) return { error: 'Variance exceeds the configured tolerance limit for this decision.' };
  const record: DemandToleranceAcceptance = { id: `ta-${demandId}-${Date.now()}`, demandId, quantity, toleranceLimitQuantity, reason: reason.trim(), buyerId, createdAt: new Date().toISOString() };
  upsert(TOLERANCE_STORAGE_KEY, record);
  syncDemandStatus(demandId);
  return { record };
}
