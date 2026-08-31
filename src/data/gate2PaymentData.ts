import { getGate1Transactions } from './gate1CommerceData';
import type { Gate1Transaction } from '../types';
import type {
  PaymentEvidenceReview,
  PaymentEvent,
  PaymentMethod,
  PaymentRecord,
  PaymentReconciliation,
  PaymentScheduleStage,
  PaymentTermsSnapshot,
  PaymentTermsType,
  RefundRecord,
} from '../types/payment';

const TERMS_STORAGE_KEY = 'ani-market-gate2a-payment-terms';
const PAYMENT_STORAGE_KEY = 'ani-market-gate2a-payment-records';
const REFUND_STORAGE_KEY = 'ani-market-gate2a-refund-records';
const EVENT_STORAGE_KEY = 'ani-market-gate2a-payment-events';
const REVIEW_STORAGE_KEY = 'ani-market-gate2a-payment-evidence-reviews';

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

function getTransaction(transactionId: string): Gate1Transaction | undefined {
  return getGate1Transactions().find(item => item.id === transactionId);
}

function isParticipant(transaction: Gate1Transaction, actorId: string, role: 'buyer' | 'supplier') {
  return role === 'buyer' ? transaction.buyerId === actorId : transaction.supplierId === actorId;
}

function saveEvent(event: PaymentEvent) {
  upsert(EVENT_STORAGE_KEY, event);
}

export function getPaymentEvents(transactionId?: string): PaymentEvent[] {
  const items = readJson<PaymentEvent[]>(EVENT_STORAGE_KEY, []);
  return (transactionId ? items.filter(item => item.transactionId === transactionId) : items)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPaymentTermsVersions(transactionId?: string): PaymentTermsSnapshot[] {
  const items = readJson<PaymentTermsSnapshot[]>(TERMS_STORAGE_KEY, []);
  return (transactionId ? items.filter(item => item.transactionId === transactionId) : items)
    .sort((a, b) => a.versionNumber - b.versionNumber);
}

export function getCurrentPaymentTerms(transactionId: string): PaymentTermsSnapshot | undefined {
  const versions = getPaymentTermsVersions(transactionId);
  return versions[versions.length - 1];
}

export function getAgreedPaymentTerms(transactionId: string): PaymentTermsSnapshot | undefined {
  return getPaymentTermsVersions(transactionId).filter(item => item.status === 'Agreed').at(-1);
}

export function buildPaymentSchedule(
  termsType: PaymentTermsType,
  expectedAmount: number,
  options?: { advancePercent?: number; creditDays?: number; dueDate?: string },
): PaymentScheduleStage[] {
  const make = (id: string, label: string, percentage: number, dueBasis: PaymentScheduleStage['dueBasis'], extra?: Partial<PaymentScheduleStage>): PaymentScheduleStage => ({
    id,
    label,
    percentage,
    amount: Math.round(expectedAmount * percentage / 100 * 100) / 100,
    dueBasis,
    ...extra,
  });

  switch (termsType) {
    case 'Full Prepayment':
      return [make('stage-1', 'Full payment', 100, 'On Commitment')];
    case 'Payment on Buyer Acceptance':
      return [make('stage-1', 'Full payment', 100, 'On Buyer Acceptance')];
    case 'Cash on Delivery':
      return [make('stage-1', 'Cash / COD payment', 100, 'On Delivery')];
    case 'Advance + Balance': {
      const advance = Math.max(1, Math.min(99, options?.advancePercent ?? 20));
      return [
        make('stage-1', 'Advance / deposit', advance, 'On Commitment'),
        make('stage-2', 'Balance', 100 - advance, 'On Buyer Acceptance'),
      ];
    }
    case 'Credit Terms': {
      const days = Math.max(1, options?.creditDays ?? 15);
      return [make('stage-1', `Net ${days}`, 100, 'Days After Buyer Acceptance', { daysAfterAcceptance: days })];
    }
    case 'Staged / Milestone':
      return [make('stage-1', 'Per mutually agreed staged schedule', 100, 'Per Agreed Schedule')];
    case 'Other Agreed Arrangement':
      return [make('stage-1', 'Per mutually agreed arrangement', 100, options?.dueDate ? 'Fixed Date' : 'Per Agreed Schedule', { dueDate: options?.dueDate })];
  }
}

export function proposePaymentTerms(params: {
  transactionId: string;
  actorId: string;
  actorRole: 'buyer' | 'supplier';
  termsType: PaymentTermsType;
  preferredMethod?: PaymentMethod;
  schedule: PaymentScheduleStage[];
  notes?: string;
}) {
  const transaction = getTransaction(params.transactionId);
  if (!transaction) return { error: 'Transaction not found.' };
  if (!isParticipant(transaction, params.actorId, params.actorRole)) return { error: 'Only a Transaction participant may propose payment terms.' };
  if (params.schedule.length === 0) return { error: 'At least one payment schedule stage is required.' };
  if (params.schedule.some(stage => (stage.percentage ?? 0) <= 0 && (stage.amount ?? 0) <= 0)) return { error: 'Every payment schedule stage must have a positive amount or percentage.' };

  const versions = getPaymentTermsVersions(params.transactionId);
  const latest = versions.at(-1);
  const now = new Date().toISOString();
  if (latest?.status === 'Pending Agreement') {
    upsert(TERMS_STORAGE_KEY, { ...latest, status: 'Superseded' });
    saveEvent({ id: `pe-${latest.id}-superseded-${Date.now()}`, transactionId: params.transactionId, eventType: 'Payment Terms Superseded', actorId: params.actorId, actorRole: params.actorRole, createdAt: now });
  }

  const snapshot: PaymentTermsSnapshot = {
    id: `pts-${params.transactionId}-v${versions.length + 1}-${Date.now()}`,
    transactionId: params.transactionId,
    versionNumber: versions.length + 1,
    termsType: params.termsType,
    preferredMethod: params.preferredMethod,
    schedule: params.schedule,
    notes: params.notes?.trim() || undefined,
    proposedById: params.actorId,
    proposedByRole: params.actorRole,
    buyerAcceptedAt: params.actorRole === 'buyer' ? now : undefined,
    supplierAcceptedAt: params.actorRole === 'supplier' ? now : undefined,
    status: 'Pending Agreement',
    createdAt: now,
  };
  upsert(TERMS_STORAGE_KEY, snapshot);
  saveEvent({ id: `pe-${snapshot.id}-proposed`, transactionId: params.transactionId, recordId: snapshot.id, eventType: 'Payment Terms Proposed', actorId: params.actorId, actorRole: params.actorRole, createdAt: now });
  return { terms: snapshot };
}

export function acceptPaymentTerms(transactionId: string, actorId: string, actorRole: 'buyer' | 'supplier') {
  const transaction = getTransaction(transactionId);
  const terms = getCurrentPaymentTerms(transactionId);
  if (!transaction || !terms) return { error: 'Pending payment terms were not found.' };
  if (!isParticipant(transaction, actorId, actorRole)) return { error: 'Only a Transaction participant may accept payment terms.' };
  if (terms.status !== 'Pending Agreement') return { error: 'Only pending payment terms may be accepted.' };
  const now = new Date().toISOString();
  const updated: PaymentTermsSnapshot = {
    ...terms,
    buyerAcceptedAt: actorRole === 'buyer' ? now : terms.buyerAcceptedAt,
    supplierAcceptedAt: actorRole === 'supplier' ? now : terms.supplierAcceptedAt,
  };
  if (updated.buyerAcceptedAt && updated.supplierAcceptedAt) {
    const priorAgreed = getPaymentTermsVersions(transactionId).filter(item => item.status === 'Agreed');
    priorAgreed.forEach(item => upsert(TERMS_STORAGE_KEY, { ...item, status: 'Superseded' }));
    updated.status = 'Agreed';
    updated.lockedAt = now;
  }
  upsert(TERMS_STORAGE_KEY, updated);
  saveEvent({ id: `pe-${terms.id}-accepted-${actorRole}-${Date.now()}`, transactionId, recordId: terms.id, eventType: 'Payment Terms Accepted', actorId, actorRole, createdAt: now });
  return { terms: updated };
}

export function getPaymentRecords(transactionId?: string): PaymentRecord[] {
  const items = readJson<PaymentRecord[]>(PAYMENT_STORAGE_KEY, []);
  return (transactionId ? items.filter(item => item.transactionId === transactionId) : items)
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
}

export function reportPaymentSent(params: {
  transactionId: string;
  buyerId: string;
  amount: number;
  method: PaymentMethod;
  externalReference?: string;
  evidenceReference?: string;
  notes?: string;
}) {
  const transaction = getTransaction(params.transactionId);
  if (!transaction || transaction.buyerId !== params.buyerId) return { error: 'Only the Transaction Buyer may report Buyer-to-Supplier payment sent.' };
  if (!getAgreedPaymentTerms(params.transactionId)) return { error: 'Both parties must agree on payment terms before recording payment.' };
  if (params.amount <= 0) return { error: 'Payment amount must be greater than zero.' };
  const now = new Date().toISOString();
  const record: PaymentRecord = {
    id: `pay-${params.transactionId}-${Date.now()}`,
    transactionId: params.transactionId,
    payerId: transaction.buyerId,
    payeeId: transaction.supplierId,
    amount: params.amount,
    method: params.method,
    externalReference: params.externalReference?.trim() || undefined,
    evidenceReference: params.evidenceReference?.trim() || undefined,
    notes: params.notes?.trim() || undefined,
    status: 'Buyer Reported Payment Sent',
    reportedById: params.buyerId,
    reportedAt: now,
  };
  upsert(PAYMENT_STORAGE_KEY, record);
  saveEvent({ id: `pe-${record.id}-reported`, transactionId: record.transactionId, recordId: record.id, eventType: 'Payment Reported Sent', actorId: params.buyerId, actorRole: 'buyer', createdAt: now });
  return { record };
}

export function recordCashReceived(params: {
  transactionId: string;
  supplierId: string;
  amount: number;
  externalReference?: string;
  notes?: string;
}) {
  const transaction = getTransaction(params.transactionId);
  if (!transaction || transaction.supplierId !== params.supplierId) return { error: 'Only the Transaction Supplier may record cash received.' };
  if (!getAgreedPaymentTerms(params.transactionId)) return { error: 'Both parties must agree on payment terms before recording payment.' };
  if (params.amount <= 0) return { error: 'Payment amount must be greater than zero.' };
  const now = new Date().toISOString();
  const record: PaymentRecord = {
    id: `pay-cash-${params.transactionId}-${Date.now()}`,
    transactionId: params.transactionId,
    payerId: transaction.buyerId,
    payeeId: transaction.supplierId,
    amount: params.amount,
    method: 'Cash / COD',
    externalReference: params.externalReference?.trim() || undefined,
    notes: params.notes?.trim() || undefined,
    status: 'Supplier Confirmed Received',
    reportedById: params.supplierId,
    reportedAt: now,
    confirmedById: params.supplierId,
    confirmedAt: now,
    immutableAt: now,
  };
  upsert(PAYMENT_STORAGE_KEY, record);
  saveEvent({ id: `pe-${record.id}-cash`, transactionId: record.transactionId, recordId: record.id, eventType: 'Cash Received Recorded', actorId: params.supplierId, actorRole: 'supplier', createdAt: now });
  return { record };
}

export function confirmPaymentReceived(recordId: string, supplierId: string) {
  const record = getPaymentRecords().find(item => item.id === recordId);
  const transaction = record ? getTransaction(record.transactionId) : undefined;
  if (!record || !transaction || transaction.supplierId !== supplierId) return { error: 'Only the receiving Supplier may confirm this payment.' };
  if (record.status !== 'Buyer Reported Payment Sent') return { error: 'Only a Buyer-reported payment awaiting confirmation may be confirmed.' };
  const now = new Date().toISOString();
  const updated: PaymentRecord = { ...record, status: 'Supplier Confirmed Received', confirmedById: supplierId, confirmedAt: now, immutableAt: now };
  upsert(PAYMENT_STORAGE_KEY, updated);
  saveEvent({ id: `pe-${record.id}-confirmed-${Date.now()}`, transactionId: record.transactionId, recordId: record.id, eventType: 'Payment Confirmed Received', actorId: supplierId, actorRole: 'supplier', createdAt: now });
  return { record: updated };
}

export function withdrawPaymentReport(recordId: string, buyerId: string, reason: string) {
  const record = getPaymentRecords().find(item => item.id === recordId);
  const transaction = record ? getTransaction(record.transactionId) : undefined;
  if (!record || !transaction || transaction.buyerId !== buyerId) return { error: 'Only the reporting Buyer may withdraw this payment report.' };
  if (record.status !== 'Buyer Reported Payment Sent') return { error: 'Confirmed or issue-raised payment records cannot be withdrawn.' };
  if (!reason.trim()) return { error: 'Withdrawal reason is required.' };
  const now = new Date().toISOString();
  const updated: PaymentRecord = { ...record, status: 'Withdrawn Before Confirmation', withdrawalReason: reason.trim(), withdrawnAt: now };
  upsert(PAYMENT_STORAGE_KEY, updated);
  saveEvent({ id: `pe-${record.id}-withdrawn-${Date.now()}`, transactionId: record.transactionId, recordId: record.id, eventType: 'Payment Report Withdrawn', actorId: buyerId, actorRole: 'buyer', reason: reason.trim(), createdAt: now });
  return { record: updated };
}

export function raisePaymentIssue(recordId: string, supplierId: string, note: string) {
  const record = getPaymentRecords().find(item => item.id === recordId);
  const transaction = record ? getTransaction(record.transactionId) : undefined;
  if (!record || !transaction || transaction.supplierId !== supplierId) return { error: 'Only the receiving Supplier may raise a receipt issue on this payment.' };
  if (record.status !== 'Buyer Reported Payment Sent') return { error: 'Only an unconfirmed Buyer-reported payment may be flagged.' };
  if (!note.trim()) return { error: 'Issue details are required.' };
  const now = new Date().toISOString();
  const updated: PaymentRecord = { ...record, status: 'Payment Issue Raised', issueNote: note.trim(), issueRaisedAt: now };
  upsert(PAYMENT_STORAGE_KEY, updated);
  saveEvent({ id: `pe-${record.id}-issue-${Date.now()}`, transactionId: record.transactionId, recordId: record.id, eventType: 'Payment Issue Raised', actorId: supplierId, actorRole: 'supplier', reason: note.trim(), createdAt: now });
  return { record: updated };
}

export function getRefundRecords(transactionId?: string): RefundRecord[] {
  const items = readJson<RefundRecord[]>(REFUND_STORAGE_KEY, []);
  return (transactionId ? items.filter(item => item.transactionId === transactionId) : items)
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
}

export function reportRefundSent(params: {
  transactionId: string;
  supplierId: string;
  amount: number;
  method: PaymentMethod;
  reason: string;
  externalReference?: string;
  evidenceReference?: string;
}) {
  const transaction = getTransaction(params.transactionId);
  if (!transaction || transaction.supplierId !== params.supplierId) return { error: 'Only the Transaction Supplier may report Supplier-to-Buyer refund sent.' };
  const reconciliation = getPaymentReconciliation(params.transactionId);
  if (params.amount <= 0) return { error: 'Refund amount must be greater than zero.' };
  if (reconciliation.refundDue <= 0) return { error: 'No reconciled refund is currently due for this Transaction.' };
  if (params.amount > reconciliation.refundDue) return { error: `Refund amount cannot exceed the current refund due of ₱${reconciliation.refundDue.toLocaleString()}.` };
  if (!params.reason.trim()) return { error: 'Refund reason is required.' };
  const now = new Date().toISOString();
  const record: RefundRecord = {
    id: `refund-${params.transactionId}-${Date.now()}`,
    transactionId: params.transactionId,
    payerId: transaction.supplierId,
    payeeId: transaction.buyerId,
    amount: params.amount,
    method: params.method,
    reason: params.reason.trim(),
    externalReference: params.externalReference?.trim() || undefined,
    evidenceReference: params.evidenceReference?.trim() || undefined,
    status: 'Supplier Reported Refund Sent',
    reportedById: params.supplierId,
    reportedAt: now,
  };
  upsert(REFUND_STORAGE_KEY, record);
  saveEvent({ id: `pe-${record.id}-reported`, transactionId: record.transactionId, recordId: record.id, eventType: 'Refund Reported Sent', actorId: params.supplierId, actorRole: 'supplier', createdAt: now });
  return { record };
}

export function confirmRefundReceived(recordId: string, buyerId: string) {
  const record = getRefundRecords().find(item => item.id === recordId);
  const transaction = record ? getTransaction(record.transactionId) : undefined;
  if (!record || !transaction || transaction.buyerId !== buyerId) return { error: 'Only the receiving Buyer may confirm this refund.' };
  if (record.status !== 'Supplier Reported Refund Sent') return { error: 'Only a Supplier-reported refund awaiting confirmation may be confirmed.' };
  const now = new Date().toISOString();
  const updated: RefundRecord = { ...record, status: 'Buyer Confirmed Refund Received', confirmedById: buyerId, confirmedAt: now, immutableAt: now };
  upsert(REFUND_STORAGE_KEY, updated);
  saveEvent({ id: `pe-${record.id}-confirmed-${Date.now()}`, transactionId: record.transactionId, recordId: record.id, eventType: 'Refund Confirmed Received', actorId: buyerId, actorRole: 'buyer', createdAt: now });
  return { record: updated };
}

export function raiseRefundIssue(recordId: string, buyerId: string, note: string) {
  const record = getRefundRecords().find(item => item.id === recordId);
  const transaction = record ? getTransaction(record.transactionId) : undefined;
  if (!record || !transaction || transaction.buyerId !== buyerId) return { error: 'Only the receiving Buyer may raise an issue on this refund.' };
  if (record.status !== 'Supplier Reported Refund Sent') return { error: 'Only an unconfirmed Supplier-reported refund may be flagged.' };
  if (!note.trim()) return { error: 'Issue details are required.' };
  const now = new Date().toISOString();
  const updated: RefundRecord = { ...record, status: 'Refund Issue Raised', issueNote: note.trim(), issueRaisedAt: now };
  upsert(REFUND_STORAGE_KEY, updated);
  saveEvent({ id: `pe-${record.id}-issue-${Date.now()}`, transactionId: record.transactionId, recordId: record.id, eventType: 'Refund Issue Raised', actorId: buyerId, actorRole: 'buyer', reason: note.trim(), createdAt: now });
  return { record: updated };
}

function paymentIsDue(transaction: Gate1Transaction, terms: PaymentTermsSnapshot | undefined) {
  if (!terms || terms.status !== 'Agreed') return false;
  if (terms.termsType === 'Full Prepayment' || terms.termsType === 'Advance + Balance') return true;
  if (terms.termsType === 'Payment on Buyer Acceptance') return transaction.activeCommittedQuantity <= 0;
  if (terms.termsType === 'Cash on Delivery') return transaction.presentedQuantity > 0 || transaction.activeCommittedQuantity <= 0;
  if (terms.termsType === 'Credit Terms') {
    const fixed = terms.schedule.find(stage => stage.dueDate)?.dueDate;
    return fixed ? fixed <= new Date().toISOString().slice(0, 10) : transaction.activeCommittedQuantity <= 0;
  }
  const fixed = terms.schedule.find(stage => stage.dueDate)?.dueDate;
  return fixed ? fixed <= new Date().toISOString().slice(0, 10) : true;
}

export function getPaymentReconciliation(transactionId: string): PaymentReconciliation {
  const transaction = getTransaction(transactionId);
  if (!transaction) {
    return {
      transactionId,
      expectedPaymentAmount: 0,
      finalPayableAmount: 0,
      reconciliationTargetAmount: 0,
      reconciliationBasis: 'Expected Payment Amount',
      finalPayableFinalized: false,
      confirmedPaidAmount: 0,
      confirmedRefundAmount: 0,
      netConfirmedPaid: 0,
      outstandingBalance: 0,
      overpayment: 0,
      refundDue: 0,
      status: 'Payment Terms Pending',
    };
  }
  const expectedPaymentAmount = transaction.committedTransactionValue;
  const finalPayableAmount = transaction.finalTransactionValue;
  const finalPayableFinalized = transaction.activeCommittedQuantity <= 0;
  const reconciliationTargetAmount = finalPayableFinalized ? finalPayableAmount : expectedPaymentAmount;
  const reconciliationBasis = finalPayableFinalized ? 'Final Payable Amount' as const : 'Expected Payment Amount' as const;
  const confirmedPaidAmount = getPaymentRecords(transactionId)
    .filter(item => item.status === 'Supplier Confirmed Received')
    .reduce((sum, item) => sum + item.amount, 0);
  const confirmedRefundAmount = getRefundRecords(transactionId)
    .filter(item => item.status === 'Buyer Confirmed Refund Received')
    .reduce((sum, item) => sum + item.amount, 0);
  const netConfirmedPaid = Math.max(0, confirmedPaidAmount - confirmedRefundAmount);
  const outstandingBalance = Math.max(0, reconciliationTargetAmount - netConfirmedPaid);
  const overpayment = Math.max(0, netConfirmedPaid - reconciliationTargetAmount);
  const refundDue = overpayment;
  const paymentIssue = getPaymentRecords(transactionId).some(item => item.status === 'Payment Issue Raised') || getRefundRecords(transactionId).some(item => item.status === 'Refund Issue Raised');
  const pendingReported = getPaymentRecords(transactionId).some(item => item.status === 'Buyer Reported Payment Sent');
  const terms = getAgreedPaymentTerms(transactionId);

  let status: PaymentReconciliation['status'];
  if (!terms) status = 'Payment Terms Pending';
  else if (paymentIssue) status = 'Payment Issue Raised';
  else if (refundDue > 0) status = 'Overpayment / Refund Due';
  else if (pendingReported) status = 'Payment Reported — Awaiting Confirmation';
  else if (reconciliationTargetAmount > 0 && outstandingBalance === 0) status = 'Paid in Full — Supplier Confirmed';
  else if (netConfirmedPaid > 0) status = 'Partially Paid — Supplier Confirmed';
  else if (paymentIsDue(transaction, terms)) status = 'Payment Due';
  else status = 'Not Yet Due';

  return {
    transactionId,
    expectedPaymentAmount,
    finalPayableAmount,
    reconciliationTargetAmount,
    reconciliationBasis,
    finalPayableFinalized,
    confirmedPaidAmount,
    confirmedRefundAmount,
    netConfirmedPaid,
    outstandingBalance,
    overpayment,
    refundDue,
    status,
  };
}

export function getPaymentEvidenceReviews(recordId?: string): PaymentEvidenceReview[] {
  const items = readJson<PaymentEvidenceReview[]>(REVIEW_STORAGE_KEY, []);
  return (recordId ? items.filter(item => item.recordId === recordId) : items)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function reviewPaymentEvidence(params: {
  transactionId: string;
  recordId: string;
  recordType: 'Payment' | 'Refund';
  status: PaymentEvidenceReview['status'];
  notes?: string;
  adminId: string;
}) {
  const transaction = getTransaction(params.transactionId);
  if (!transaction) return { error: 'Transaction not found.' };
  const recordExists = params.recordType === 'Payment'
    ? getPaymentRecords(params.transactionId).some(item => item.id === params.recordId)
    : getRefundRecords(params.transactionId).some(item => item.id === params.recordId);
  if (!recordExists) return { error: 'Evidence record not found.' };
  const review: PaymentEvidenceReview = {
    id: `review-${params.recordId}-${Date.now()}`,
    transactionId: params.transactionId,
    recordId: params.recordId,
    recordType: params.recordType,
    status: params.status,
    notes: params.notes?.trim() || undefined,
    adminId: params.adminId,
    createdAt: new Date().toISOString(),
  };
  upsert(REVIEW_STORAGE_KEY, review);
  return { review };
}
