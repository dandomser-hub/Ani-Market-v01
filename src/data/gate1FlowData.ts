import { getGate1Demands, saveGate1Demand } from './gate1DemandData';
import {
  getCurrentOfferVersion,
  getDemandOffers,
  getGate1Offers,
  getGate1Selections,
  saveGate1Offer,
  saveOfferEvent,
  saveSelection,
  saveSelectionEvent,
} from './gate1OfferData';
import {
  getDemandQuantityState,
  getGate1Transactions,
  getOfferCommittedQuantity,
  releaseOutstandingCommitment,
} from './gate1CommerceData';
import type { DemandPost, Offer, SelectedAllocation } from '../types';

const CURE_STORAGE_KEY = 'ani-market-gate1-cure-records';

interface CureRecord {
  id: string;
  transactionId: string;
  status: 'Requested' | 'Failed' | 'Resolved';
  reason: string;
  buyerId: string;
  requestedAt: string;
  resolvedAt?: string;
}

function readCures(): CureRecord[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(window.localStorage.getItem(CURE_STORAGE_KEY) ?? '[]') as CureRecord[]; }
  catch { return []; }
}

function saveCure(record: CureRecord) {
  if (typeof window === 'undefined') return;
  const records = readCures();
  const index = records.findIndex(item => item.id === record.id);
  if (index >= 0) records[index] = record;
  else records.push(record);
  window.localStorage.setItem(CURE_STORAGE_KEY, JSON.stringify(records));
}

export function getCureRecord(transactionId: string) {
  return readCures().filter(item => item.transactionId === transactionId).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))[0];
}

function selectionReservationIsActive(selection: SelectedAllocation) {
  return ['Pending Supplier Confirmation', 'Negotiating', 'Ready for Commitment'].includes(selection.status) && selection.reservationExpiresAt > new Date().toISOString();
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

export function getLiveSelections(): SelectedAllocation[] {
  const now = new Date().toISOString();
  return getGate1Selections().map(selection => {
    if (!['Pending Supplier Confirmation', 'Negotiating', 'Ready for Commitment'].includes(selection.status) || selection.reservationExpiresAt > now) return selection;
    const expired = { ...selection, status: 'Expired' as const, releasedAt: selection.releasedAt ?? now };
    saveSelection(expired);
    const offer = getGate1Offers().find(item => item.id === selection.offerId);
    if (offer && !offer.legacyResponseId) {
      saveGate1Offer({ ...offer, status: 'Active', updatedAt: now });
      saveOfferEvent({ id: `oe-${offer.id}-release-${Date.now()}`, offerId: offer.id, demandId: offer.demandId, supplierId: offer.supplierId, eventType: 'Selection Released', reason: 'Reservation expired.', actorId: 'system', actorRole: 'admin', createdAt: now });
    }
    saveSelectionEvent({ id: `se-${selection.id}-expired-${Date.now()}`, selectionId: selection.id, demandId: selection.demandId, offerId: selection.offerId, eventType: 'Expired', actorId: 'system', actorRole: 'admin', createdAt: now });
    syncDemandStatus(selection.demandId);
    return expired;
  });
}

export function getCommerceOfferSelectableQuantity(offer: Offer): number {
  const version = getCurrentOfferVersion(offer);
  if (!version || !['Active', 'Selected'].includes(offer.status)) return 0;
  const committed = getOfferCommittedQuantity(offer.id);
  const reserved = getLiveSelections().filter(item => item.offerId === offer.id && selectionReservationIsActive(item)).reduce((sum, item) => sum + item.selectedQuantity, 0);
  const offerResidual = Math.max(0, version.offeredQuantity - committed - reserved);
  const demandRemaining = getDemandQuantityState(offer.demandId).remainingQuantity;
  return Math.min(offerResidual, demandRemaining);
}

export function getCommerceShortlistedOffers(demandId: string, batchesShown = 1) {
  const active = getDemandOffers(demandId).filter(offer => ['Active', 'Selected'].includes(offer.status));
  const remaining = getDemandQuantityState(demandId).remainingQuantity;
  let covered = 0;
  let initialBatchSize = 0;
  for (const offer of active) {
    initialBatchSize += 1;
    covered += getCommerceOfferSelectableQuantity(offer);
    if (covered >= remaining && remaining > 0) break;
  }
  if (initialBatchSize === 0 && active.length > 0) initialBatchSize = 1;
  const visibleCount = Math.min(active.length, initialBatchSize * Math.max(1, batchesShown));
  return { visible: active.slice(0, visibleCount), hiddenCount: Math.max(0, active.length - visibleCount), initialBatchSize };
}

function residualWouldBeAvoidablyStranded(demand: DemandPost, offer: Offer, selectedQuantity: number) {
  const minimum = demand.minimumSupplierQuantity;
  if (!minimum) return false;
  const currentRemaining = getDemandQuantityState(demand.id).remainingQuantity;
  const residual = currentRemaining - selectedQuantity;
  if (residual <= 0 || residual >= minimum) return false;
  const otherOffersCanMeetMinimum = getDemandOffers(demand.id).some(other => other.id !== offer.id && getCommerceOfferSelectableQuantity(other) >= minimum);
  return otherOffersCanMeetMinimum;
}

export function createCommerceSelection(params: {
  demand: DemandPost;
  offer: Offer;
  buyerId: string;
  selectedQuantity: number;
  confirmationWindowHours: 4 | 8 | 12 | 16 | 20 | 24;
}): { selection?: SelectedAllocation; error?: string } {
  const { demand, offer, buyerId, selectedQuantity, confirmationWindowHours } = params;
  if (demand.buyerId !== buyerId) return { error: 'Only the Demand Buyer may select Supplier Offers.' };
  if (!['Open for Offers', 'Partially Allocated', 'Fully Reserved'].includes(demand.status)) return { error: 'Demand is not currently open for Selection.' };
  if (offer.demandId !== demand.id || !['Active', 'Selected'].includes(offer.status)) return { error: 'Offer is not eligible for Selection.' };
  if (getLiveSelections().some(item => item.offerId === offer.id && selectionReservationIsActive(item))) return { error: 'This Offer already has an active Buyer Selection.' };
  const version = getCurrentOfferVersion(offer);
  if (!version || version.validUntil < new Date().toISOString().slice(0, 10)) return { error: 'Offer is unavailable or expired.' };
  const selectable = getCommerceOfferSelectableQuantity(offer);
  if (selectedQuantity <= 0 || selectedQuantity > selectable) return { error: `Selected quantity must be between 1 and ${selectable.toLocaleString()} ${offer.unit}.` };
  const state = getDemandQuantityState(demand.id);
  if (demand.minimumSupplierQuantity && selectedQuantity < demand.minimumSupplierQuantity && state.remainingQuantity >= demand.minimumSupplierQuantity) return { error: `Selected quantity must meet the Buyer minimum of ${demand.minimumSupplierQuantity.toLocaleString()} ${demand.unit}.` };
  if (residualWouldBeAvoidablyStranded(demand, offer, selectedQuantity)) {
    const safeQuantity = Math.max(0, state.remainingQuantity - (demand.minimumSupplierQuantity ?? 0));
    return { error: `This allocation would strand a residual below the Buyer minimum. Select no more than ${safeQuantity.toLocaleString()} ${demand.unit}, or fully cover the Remaining Quantity if this Offer can do so.` };
  }

  const selectedAt = new Date();
  const selection: SelectedAllocation = {
    id: `sel-g1-${Date.now()}`,
    demandId: demand.id,
    offerId: offer.id,
    offerVersionNumber: offer.currentVersionNumber,
    buyerId,
    supplierId: offer.supplierId,
    selectedQuantity,
    unit: offer.unit,
    confirmationWindowHours,
    selectedAt: selectedAt.toISOString(),
    reservationExpiresAt: new Date(selectedAt.getTime() + confirmationWindowHours * 60 * 60 * 1000).toISOString(),
    status: 'Pending Supplier Confirmation',
  };
  saveSelection(selection);
  saveGate1Offer({ ...offer, status: 'Selected', updatedAt: selectedAt.toISOString() });
  saveOfferEvent({ id: `oe-${offer.id}-selected-${Date.now()}`, offerId: offer.id, demandId: demand.id, supplierId: offer.supplierId, eventType: 'Selected', versionNumber: offer.currentVersionNumber, actorId: buyerId, actorRole: 'buyer', createdAt: selectedAt.toISOString() });
  saveSelectionEvent({ id: `se-${selection.id}-selected`, selectionId: selection.id, demandId: demand.id, offerId: offer.id, eventType: 'Selected', actorId: buyerId, actorRole: 'buyer', createdAt: selectedAt.toISOString() });
  syncDemandStatus(demand.id);
  return { selection };
}

export function withdrawCommerceSelection(selectionId: string, buyerId: string, reason: string) {
  const selection = getLiveSelections().find(item => item.id === selectionId);
  if (!selection) return { error: 'Selection not found.' };
  if (selection.buyerId !== buyerId) return { error: 'Only the Buyer may withdraw this Selection.' };
  if (!['Pending Supplier Confirmation', 'Negotiating'].includes(selection.status)) return { error: 'Only a pending or negotiating Selection may be withdrawn before Commitment.' };
  if (!reason.trim()) return { error: 'Withdrawal reason is required.' };
  const now = new Date().toISOString();
  const updated = { ...selection, status: 'Withdrawn by Buyer' as const, buyerWithdrawalReason: reason.trim(), releasedAt: now };
  saveSelection(updated);
  const offer = getGate1Offers().find(item => item.id === selection.offerId);
  if (offer && !offer.legacyResponseId) saveGate1Offer({ ...offer, status: 'Active', updatedAt: now });
  saveSelectionEvent({ id: `se-${selection.id}-withdraw-${Date.now()}`, selectionId: selection.id, demandId: selection.demandId, offerId: selection.offerId, eventType: 'Buyer Withdrawn', reason: reason.trim(), actorId: buyerId, actorRole: 'buyer', createdAt: now });
  syncDemandStatus(selection.demandId);
  return { selection: updated };
}

export function declineCommerceSelection(selectionId: string, supplierId: string, reason: string) {
  const selection = getLiveSelections().find(item => item.id === selectionId);
  if (!selection) return { error: 'Selection not found.' };
  if (selection.supplierId !== supplierId) return { error: 'Only the selected Supplier may decline this Selection.' };
  if (!['Pending Supplier Confirmation', 'Negotiating'].includes(selection.status)) return { error: 'Only a pending or negotiating Selection may be declined before Commitment.' };
  if (!reason.trim()) return { error: 'Decline reason is required.' };
  const now = new Date().toISOString();
  const updated = { ...selection, status: 'Declined by Supplier' as const, supplierDeclineReason: reason.trim(), releasedAt: now };
  saveSelection(updated);
  const offer = getGate1Offers().find(item => item.id === selection.offerId);
  if (offer && !offer.legacyResponseId) saveGate1Offer({ ...offer, status: 'Active', updatedAt: now });
  saveSelectionEvent({ id: `se-${selection.id}-decline-${Date.now()}`, selectionId: selection.id, demandId: selection.demandId, offerId: selection.offerId, eventType: 'Supplier Declined', reason: reason.trim(), actorId: supplierId, actorRole: 'supplier', createdAt: now });
  syncDemandStatus(selection.demandId);
  return { selection: updated };
}

export function requestSupplierCure(transactionId: string, buyerId: string, reason: string) {
  const transaction = getGate1Transactions().find(item => item.id === transactionId);
  if (!transaction || transaction.buyerId !== buyerId) return { error: 'Only the Transaction Buyer may request a cure.' };
  if (transaction.activeCommittedQuantity <= 0) return { error: 'There is no outstanding committed quantity requiring cure.' };
  if (!reason.trim()) return { error: 'Cure request reason is required.' };
  const existing = getCureRecord(transactionId);
  if (existing?.status === 'Requested') return { record: existing };
  const record: CureRecord = { id: `cure-${transactionId}-${Date.now()}`, transactionId, status: 'Requested', reason: reason.trim(), buyerId, requestedAt: new Date().toISOString() };
  saveCure(record);
  return { record };
}

export function releaseOutstandingAfterCure(transactionId: string, buyerId: string, reason: string) {
  const cure = getCureRecord(transactionId);
  if (!cure || cure.status !== 'Requested') return { error: 'A Supplier cure opportunity must be recorded before outstanding quantity can be released.' };
  const result = releaseOutstandingCommitment(transactionId, buyerId, reason);
  if ('error' in result) return result;
  saveCure({ ...cure, status: 'Failed', resolvedAt: new Date().toISOString() });
  return result;
}

export function resolveCureIfFulfilled(transactionId: string) {
  const cure = getCureRecord(transactionId);
  const transaction = getGate1Transactions().find(item => item.id === transactionId);
  if (cure?.status === 'Requested' && transaction && transaction.activeCommittedQuantity <= 0) saveCure({ ...cure, status: 'Resolved', resolvedAt: new Date().toISOString() });
}
