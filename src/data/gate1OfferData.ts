import { mockResponses } from './mockData';
import { getGate1Demands, saveGate1Demand } from './gate1DemandData';
import type {
  DemandPost,
  Offer,
  OfferEvent,
  OfferVersion,
  SelectedAllocation,
  SelectionEvent,
  SupplierResponse,
  SupplierType,
} from '../types';

const OFFER_STORAGE_KEY = 'ani-market-gate1-offers';
const OFFER_VERSION_STORAGE_KEY = 'ani-market-gate1-offer-versions';
const OFFER_EVENT_STORAGE_KEY = 'ani-market-gate1-offer-events';
const SELECTION_STORAGE_KEY = 'ani-market-gate1-selections';
const SELECTION_EVENT_STORAGE_KEY = 'ani-market-gate1-selection-events';

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

function legacyOfferStatus(response: SupplierResponse): Offer['status'] {
  if (response.status === 'Rejected') return 'Not Selected';
  if (response.status === 'Matched' || response.status === 'Accepted') return 'Selected';
  return 'Active';
}

function legacyOffer(response: SupplierResponse): Offer {
  return {
    id: `offer-${response.id}`,
    demandId: response.demandId,
    supplierId: response.supplierId,
    supplierName: response.supplierName,
    supplierType: response.supplierType,
    originalOfferedQuantity: response.availableQuantity,
    unit: response.unit,
    currentVersionNumber: 1,
    status: legacyOfferStatus(response),
    submittedAt: response.createdAt,
    legacyResponseId: response.id,
  };
}

function legacyOfferVersion(response: SupplierResponse): OfferVersion {
  const demand = getGate1Demands().find(item => item.id === response.demandId);
  return {
    id: `ov-${response.id}-1`,
    offerId: `offer-${response.id}`,
    versionNumber: 1,
    offeredQuantity: response.availableQuantity,
    unit: response.unit,
    offeredPrice: response.offeredPrice,
    fulfillmentDate: response.fulfillmentDate,
    specificationConfirmation: response.qualityConfirmation,
    remarks: [response.pickupDeliveryNote, response.remarks].filter(Boolean).join(' · '),
    evidence: [],
    validUntil: demand?.expirationDate ?? response.fulfillmentDate,
    createdAt: response.createdAt,
  };
}

function baselineOffers(): Offer[] {
  return mockResponses.map(legacyOffer);
}

function baselineOfferVersions(): OfferVersion[] {
  return mockResponses.map(legacyOfferVersion);
}

function mergeById<T extends { id: string }>(baseline: T[], persisted: T[]): T[] {
  const byId = new Map<string, T>();
  baseline.forEach(item => byId.set(item.id, item));
  persisted.forEach(item => byId.set(item.id, item));
  return Array.from(byId.values());
}

export function getGate1Offers(): Offer[] {
  const persisted = readJson<Offer[]>(OFFER_STORAGE_KEY, []);
  const offers = mergeById(baselineOffers(), persisted);
  const today = new Date().toISOString().slice(0, 10);
  const versions = getOfferVersions();
  return offers.map(offer => {
    if (offer.status !== 'Active' && offer.status !== 'Selected') return offer;
    const current = versions.find(version => version.offerId === offer.id && version.versionNumber === offer.currentVersionNumber);
    return current && current.validUntil < today ? { ...offer, status: 'Expired' as const } : offer;
  });
}

export function getOfferVersions(offerId?: string): OfferVersion[] {
  const persisted = readJson<OfferVersion[]>(OFFER_VERSION_STORAGE_KEY, []);
  const versions = mergeById(baselineOfferVersions(), persisted);
  return offerId ? versions.filter(version => version.offerId === offerId).sort((a, b) => a.versionNumber - b.versionNumber) : versions;
}

export function getCurrentOfferVersion(offer: Offer): OfferVersion | undefined {
  return getOfferVersions(offer.id).find(version => version.versionNumber === offer.currentVersionNumber);
}

export function getOfferEvents(offerId?: string): OfferEvent[] {
  const events = readJson<OfferEvent[]>(OFFER_EVENT_STORAGE_KEY, []);
  return offerId ? events.filter(event => event.offerId === offerId) : events;
}

export function saveGate1Offer(offer: Offer) {
  const persisted = readJson<Offer[]>(OFFER_STORAGE_KEY, []);
  const index = persisted.findIndex(item => item.id === offer.id);
  if (index >= 0) persisted[index] = offer;
  else persisted.push(offer);
  writeJson(OFFER_STORAGE_KEY, persisted);
}

export function saveOfferVersion(version: OfferVersion) {
  const persisted = readJson<OfferVersion[]>(OFFER_VERSION_STORAGE_KEY, []);
  const index = persisted.findIndex(item => item.id === version.id);
  if (index >= 0) persisted[index] = version;
  else persisted.push(version);
  writeJson(OFFER_VERSION_STORAGE_KEY, persisted);
}

export function saveOfferEvent(event: OfferEvent) {
  const events = readJson<OfferEvent[]>(OFFER_EVENT_STORAGE_KEY, []);
  events.push(event);
  writeJson(OFFER_EVENT_STORAGE_KEY, events);
}

export function getActiveOfferForSupplierDemand(supplierId: string, demandId: string): Offer | undefined {
  return getGate1Offers().find(offer =>
    offer.supplierId === supplierId &&
    offer.demandId === demandId &&
    (offer.status === 'Active' || offer.status === 'Selected')
  );
}

export interface OfferInput {
  offeredQuantity: number;
  unit: string;
  offeredPrice: number;
  priceBasis?: string;
  fulfillmentDate: string;
  specificationConfirmation: string;
  specificationVariations?: string;
  remarks?: string;
  validUntil: string;
  evidenceLabels?: string[];
}

function validateOfferInput(demand: DemandPost, input: OfferInput): string[] {
  const errors: string[] = [];
  if (!['Open for Offers', 'Partially Allocated', 'Open', 'Posted', 'Response Received'].includes(demand.status)) errors.push('Demand is not open for Supplier Offers.');
  if (input.offeredQuantity <= 0) errors.push('Offered quantity must be greater than zero.');
  if (demand.minimumSupplierQuantity && input.offeredQuantity < demand.minimumSupplierQuantity) errors.push(`Offer must meet the Buyer minimum of ${demand.minimumSupplierQuantity.toLocaleString()} ${demand.unit}.`);
  if (input.offeredPrice <= 0) errors.push('Offered price must be greater than zero.');
  if (!input.fulfillmentDate) errors.push('Fulfillment date is required.');
  if (!input.specificationConfirmation.trim()) errors.push('Specification confirmation is required.');
  if (!input.validUntil) errors.push('Offer validity date is required.');
  if (input.validUntil > demand.expirationDate) errors.push('Offer validity cannot extend beyond the Demand offer deadline.');
  return errors;
}

export function createOffer(params: {
  demand: DemandPost;
  supplierId: string;
  supplierName: string;
  supplierType: SupplierType;
  input: OfferInput;
}): { offer?: Offer; version?: OfferVersion; errors: string[] } {
  const { demand, supplierId, supplierName, supplierType, input } = params;
  const errors = validateOfferInput(demand, input);
  if (demand.buyerId === supplierId) errors.push('A Supplier cannot submit an Offer to their own Demand.');
  if (getActiveOfferForSupplierDemand(supplierId, demand.id)) errors.push('You already have an active Offer for this Demand. Revise the existing Offer instead.');
  if (errors.length > 0) return { errors };

  const now = new Date().toISOString();
  const offerId = `offer-g1-${Date.now()}`;
  const offer: Offer = {
    id: offerId,
    demandId: demand.id,
    supplierId,
    supplierName,
    supplierType,
    originalOfferedQuantity: input.offeredQuantity,
    unit: input.unit,
    currentVersionNumber: 1,
    status: 'Active',
    submittedAt: now,
  };
  const version: OfferVersion = {
    id: `${offerId}-v1`,
    offerId,
    versionNumber: 1,
    offeredQuantity: input.offeredQuantity,
    unit: input.unit,
    offeredPrice: input.offeredPrice,
    priceBasis: input.priceBasis?.trim() || undefined,
    fulfillmentDate: input.fulfillmentDate,
    specificationConfirmation: input.specificationConfirmation.trim(),
    specificationVariations: input.specificationVariations?.trim() || undefined,
    remarks: input.remarks?.trim() || undefined,
    evidence: (input.evidenceLabels ?? []).filter(Boolean).map((label, index) => ({ id: `${offerId}-e${index + 1}`, type: 'Photo' as const, label })),
    validUntil: input.validUntil,
    createdAt: now,
  };
  saveGate1Offer(offer);
  saveOfferVersion(version);
  saveOfferEvent({ id: `oe-${offerId}-submitted`, offerId, demandId: demand.id, supplierId, eventType: 'Submitted', versionNumber: 1, actorId: supplierId, actorRole: 'supplier', createdAt: now });
  saveGate1Demand({ ...demand, responseCount: demand.responseCount + 1, materialTermsLocked: true, updatedAt: now });
  return { offer, version, errors: [] };
}

export function reviseOffer(offerId: string, input: OfferInput, changeReason?: string): { offer?: Offer; version?: OfferVersion; errors: string[] } {
  const offer = getGate1Offers().find(item => item.id === offerId);
  if (!offer) return { errors: ['Offer not found.'] };
  if (offer.status !== 'Active') return { errors: ['Only an active, unselected Offer may be revised.'] };
  if (getGate1Selections().some(selection => selection.offerId === offer.id && selectionIsActive(selection))) return { errors: ['Offer terms are locked while a Buyer Selection is active.'] };
  const demand = getGate1Demands().find(item => item.id === offer.demandId);
  if (!demand) return { errors: ['Demand not found.'] };
  const errors = validateOfferInput(demand, input);
  if (errors.length > 0) return { errors };

  const nextVersionNumber = offer.currentVersionNumber + 1;
  const now = new Date().toISOString();
  const version: OfferVersion = {
    id: `${offer.id}-v${nextVersionNumber}-${Date.now()}`,
    offerId: offer.id,
    versionNumber: nextVersionNumber,
    offeredQuantity: input.offeredQuantity,
    unit: input.unit,
    offeredPrice: input.offeredPrice,
    priceBasis: input.priceBasis?.trim() || undefined,
    fulfillmentDate: input.fulfillmentDate,
    specificationConfirmation: input.specificationConfirmation.trim(),
    specificationVariations: input.specificationVariations?.trim() || undefined,
    remarks: input.remarks?.trim() || undefined,
    evidence: (input.evidenceLabels ?? []).filter(Boolean).map((label, index) => ({ id: `${offer.id}-v${nextVersionNumber}-e${index + 1}`, type: 'Photo' as const, label })),
    validUntil: input.validUntil,
    changeReason: changeReason?.trim() || undefined,
    createdAt: now,
  };
  const revised = { ...offer, currentVersionNumber: nextVersionNumber, updatedAt: now };
  saveOfferVersion(version);
  saveGate1Offer(revised);
  saveOfferEvent({ id: `oe-${offer.id}-v${nextVersionNumber}-${Date.now()}`, offerId: offer.id, demandId: offer.demandId, supplierId: offer.supplierId, eventType: 'Revised', versionNumber: nextVersionNumber, reason: changeReason?.trim() || undefined, actorId: offer.supplierId, actorRole: 'supplier', createdAt: now });
  return { offer: revised, version, errors: [] };
}

export function withdrawOffer(offerId: string, reason: string): { offer?: Offer; error?: string } {
  const offer = getGate1Offers().find(item => item.id === offerId);
  if (!offer) return { error: 'Offer not found.' };
  if (offer.status !== 'Active') return { error: 'Only an active, unselected Offer may be withdrawn.' };
  if (!reason.trim()) return { error: 'Withdrawal reason is required.' };
  if (getGate1Selections().some(selection => selection.offerId === offer.id && selectionIsActive(selection))) return { error: 'Release the active Buyer Selection before withdrawing this Offer.' };
  const now = new Date().toISOString();
  const withdrawn = { ...offer, status: 'Withdrawn' as const, withdrawnAt: now, withdrawalReason: reason.trim(), updatedAt: now };
  saveGate1Offer(withdrawn);
  saveOfferEvent({ id: `oe-${offer.id}-withdraw-${Date.now()}`, offerId: offer.id, demandId: offer.demandId, supplierId: offer.supplierId, eventType: 'Withdrawn', reason: reason.trim(), actorId: offer.supplierId, actorRole: 'supplier', createdAt: now });
  return { offer: withdrawn };
}

function selectionIsActive(selection: SelectedAllocation): boolean {
  if (selection.status !== 'Pending Supplier Confirmation' && selection.status !== 'Ready for Commitment') return false;
  return selection.status === 'Ready for Commitment' || selection.reservationExpiresAt > new Date().toISOString();
}

export function getGate1Selections(): SelectedAllocation[] {
  const selections = readJson<SelectedAllocation[]>(SELECTION_STORAGE_KEY, []);
  const now = new Date().toISOString();
  return selections.map(selection =>
    selection.status === 'Pending Supplier Confirmation' && selection.reservationExpiresAt <= now
      ? { ...selection, status: 'Expired' as const, releasedAt: selection.releasedAt ?? now }
      : selection
  );
}

export function saveSelection(selection: SelectedAllocation) {
  const selections = readJson<SelectedAllocation[]>(SELECTION_STORAGE_KEY, []);
  const index = selections.findIndex(item => item.id === selection.id);
  if (index >= 0) selections[index] = selection;
  else selections.push(selection);
  writeJson(SELECTION_STORAGE_KEY, selections);
}

export function getSelectionEvents(selectionId?: string): SelectionEvent[] {
  const events = readJson<SelectionEvent[]>(SELECTION_EVENT_STORAGE_KEY, []);
  return selectionId ? events.filter(event => event.selectionId === selectionId) : events;
}

export function saveSelectionEvent(event: SelectionEvent) {
  const events = readJson<SelectionEvent[]>(SELECTION_EVENT_STORAGE_KEY, []);
  events.push(event);
  writeJson(SELECTION_EVENT_STORAGE_KEY, events);
}

export function getDemandReservedQuantity(demandId: string): number {
  return getGate1Selections().filter(selection => selection.demandId === demandId && selectionIsActive(selection)).reduce((sum, selection) => sum + selection.selectedQuantity, 0);
}

export function getDemandRemainingForSelection(demandId: string): number {
  const demand = getGate1Demands().find(item => item.id === demandId);
  if (!demand) return 0;
  return Math.max(0, demand.quantity - getDemandReservedQuantity(demandId));
}

export function getOfferReservedQuantity(offerId: string): number {
  return getGate1Selections().filter(selection => selection.offerId === offerId && selectionIsActive(selection)).reduce((sum, selection) => sum + selection.selectedQuantity, 0);
}

export function getOfferSelectableQuantity(offer: Offer): number {
  const current = getCurrentOfferVersion(offer);
  if (!current || (offer.status !== 'Active' && offer.status !== 'Selected')) return 0;
  const offerAvailable = Math.max(0, current.offeredQuantity - getOfferReservedQuantity(offer.id));
  return Math.min(offerAvailable, getDemandRemainingForSelection(offer.demandId));
}

export function getDemandOffers(demandId: string): Offer[] {
  return getGate1Offers().filter(offer => offer.demandId === demandId && offer.status !== 'Draft').sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
}

export function getShortlistedDemandOffers(demandId: string, batchesShown = 1): { visible: Offer[]; hiddenCount: number; initialBatchSize: number } {
  const active = getDemandOffers(demandId).filter(offer => offer.status === 'Active' || offer.status === 'Selected');
  const remaining = getDemandRemainingForSelection(demandId);
  let covered = 0;
  let initialBatchSize = 0;
  for (const offer of active) {
    initialBatchSize += 1;
    covered += getOfferSelectableQuantity(offer);
    if (covered >= remaining && remaining > 0) break;
  }
  if (initialBatchSize === 0 && active.length > 0) initialBatchSize = 1;
  const visibleCount = Math.min(active.length, initialBatchSize * Math.max(1, batchesShown));
  return { visible: active.slice(0, visibleCount), hiddenCount: Math.max(0, active.length - visibleCount), initialBatchSize };
}

export function createSelection(params: {
  demand: DemandPost;
  offer: Offer;
  buyerId: string;
  selectedQuantity: number;
  confirmationWindowHours: 4 | 8 | 12 | 16 | 20 | 24;
}): { selection?: SelectedAllocation; error?: string } {
  const { demand, offer, buyerId, selectedQuantity, confirmationWindowHours } = params;
  if (demand.buyerId !== buyerId) return { error: 'Only the Demand Buyer may select Supplier Offers.' };
  if (!['Open for Offers', 'Partially Allocated', 'Open', 'Posted', 'Response Received'].includes(demand.status)) return { error: 'Demand is not currently open for selection.' };
  if (offer.demandId !== demand.id) return { error: 'Offer does not belong to this Demand.' };
  if (offer.status !== 'Active' && offer.status !== 'Selected') return { error: 'Offer is not eligible for selection.' };
  if (getGate1Selections().some(selection => selection.offerId === offer.id && selectionIsActive(selection))) return { error: 'This Offer already has an active Buyer Selection. Release or resolve it before selecting another allocation from the same Offer.' };
  const current = getCurrentOfferVersion(offer);
  if (!current) return { error: 'Current Offer version is unavailable.' };
  if (current.validUntil < new Date().toISOString().slice(0, 10)) return { error: 'Offer has expired.' };
  if (selectedQuantity <= 0) return { error: 'Selected quantity must be greater than zero.' };
  const selectable = getOfferSelectableQuantity(offer);
  if (selectedQuantity > selectable) return { error: `Only ${selectable.toLocaleString()} ${offer.unit} is currently selectable from this Offer.` };
  if (demand.minimumSupplierQuantity && selectedQuantity < demand.minimumSupplierQuantity && getDemandRemainingForSelection(demand.id) >= demand.minimumSupplierQuantity) return { error: `Selected quantity must meet the Buyer minimum of ${demand.minimumSupplierQuantity.toLocaleString()} ${demand.unit}.` };

  const selectedAt = new Date();
  const reservationExpiresAt = new Date(selectedAt.getTime() + confirmationWindowHours * 60 * 60 * 1000).toISOString();
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
    reservationExpiresAt,
    status: 'Pending Supplier Confirmation',
  };
  saveSelection(selection);
  saveGate1Offer({ ...offer, status: 'Selected', updatedAt: selectedAt.toISOString() });
  saveOfferEvent({ id: `oe-${offer.id}-selected-${Date.now()}`, offerId: offer.id, demandId: demand.id, supplierId: offer.supplierId, eventType: 'Selected', versionNumber: offer.currentVersionNumber, actorId: buyerId, actorRole: 'buyer', createdAt: selectedAt.toISOString() });
  saveSelectionEvent({ id: `se-${selection.id}-selected`, selectionId: selection.id, demandId: demand.id, offerId: offer.id, eventType: 'Selected', actorId: buyerId, actorRole: 'buyer', createdAt: selectedAt.toISOString() });
  return { selection };
}

export function withdrawSelection(selectionId: string, buyerId: string, reason: string): { selection?: SelectedAllocation; error?: string } {
  const selection = getGate1Selections().find(item => item.id === selectionId);
  if (!selection) return { error: 'Selection not found.' };
  if (selection.buyerId !== buyerId) return { error: 'Only the Buyer may withdraw this Selection.' };
  if (selection.status !== 'Pending Supplier Confirmation') return { error: 'Only a pending Selection may be withdrawn.' };
  if (!reason.trim()) return { error: 'Withdrawal reason is required.' };
  const now = new Date().toISOString();
  const updated = { ...selection, status: 'Withdrawn by Buyer' as const, buyerWithdrawalReason: reason.trim(), releasedAt: now };
  saveSelection(updated);
  saveSelectionEvent({ id: `se-${selection.id}-withdraw-${Date.now()}`, selectionId: selection.id, demandId: selection.demandId, offerId: selection.offerId, eventType: 'Buyer Withdrawn', reason: reason.trim(), actorId: buyerId, actorRole: 'buyer', createdAt: now });
  return { selection: updated };
}

export function declineSelection(selectionId: string, supplierId: string, reason: string): { selection?: SelectedAllocation; error?: string } {
  const selection = getGate1Selections().find(item => item.id === selectionId);
  if (!selection) return { error: 'Selection not found.' };
  if (selection.supplierId !== supplierId) return { error: 'Only the selected Supplier may decline this Selection.' };
  if (selection.status !== 'Pending Supplier Confirmation') return { error: 'Only a pending Selection may be declined.' };
  if (!reason.trim()) return { error: 'Decline reason is required.' };
  const now = new Date().toISOString();
  const updated = { ...selection, status: 'Declined by Supplier' as const, supplierDeclineReason: reason.trim(), releasedAt: now };
  saveSelection(updated);
  saveSelectionEvent({ id: `se-${selection.id}-decline-${Date.now()}`, selectionId: selection.id, demandId: selection.demandId, offerId: selection.offerId, eventType: 'Supplier Declined', reason: reason.trim(), actorId: supplierId, actorRole: 'supplier', createdAt: now });
  return { selection: updated };
}
