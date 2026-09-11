import type { Gate1Transaction } from '../types';
import type {
  FeeDuePolicy,
  FeeLedgerEvent,
  FeeMaturityAgingBucket,
  FeeMaturityEvent,
  FeeRateSchedule,
  FeeRateSnapshot,
  PlatformFeeMaturitySummary,
  PlatformFeeObligation,
  PlatformFeeObligationStatus,
} from '../types/platformFee';

const RATE_SCHEDULE_STORAGE_KEY = 'ani-market-gate2b-fee-rate-schedules';
const RATE_SNAPSHOT_STORAGE_KEY = 'ani-market-gate2b-fee-rate-snapshots';
const OBLIGATION_STORAGE_KEY = 'ani-market-gate2b-fee-obligations';
const LEDGER_STORAGE_KEY = 'ani-market-gate2b-fee-ledger-events';
const DUE_POLICY_STORAGE_KEY = 'ani-market-gate2b-fee-due-policies';
const MATURITY_STORAGE_KEY = 'ani-market-gate2b-fee-maturity-events';
const CHUNK7_PAYMENT_STORAGE_KEY = 'ani-market-gate2a-payment-records';

export const DEFAULT_MVP_FEE_RATE_PERCENT = 3;
export const DEFAULT_MVP_FEE_DUE_PERIOD_DAYS = 7;
export const PLATFORM_FEE_POLICY_VERSION = 'CHUNK8-v0.1';

export const DEFAULT_MVP_FEE_SCHEDULE: FeeRateSchedule = {
  id: 'fee-schedule-standard-mvp-3pct',
  name: 'Standard MVP Success-Based Platform Fee',
  ratePercent: DEFAULT_MVP_FEE_RATE_PERCENT,
  effectiveFrom: '2025-01-01T00:00:00.000Z',
  status: 'Active',
  scope: 'Standard MVP',
  createdBy: 'system',
  approvedBy: 'system',
  createdAt: '2026-09-11T00:00:00.000Z',
  reason: 'Approved Chunk 8 standard MVP rate.',
};

export const DEFAULT_MVP_FEE_DUE_POLICY: FeeDuePolicy = {
  id: 'fee-due-policy-standard-mvp-7-days',
  name: 'Standard MVP Fee Due Period',
  duePeriodDays: DEFAULT_MVP_FEE_DUE_PERIOD_DAYS,
  effectiveFrom: '2025-01-01T00:00:00.000Z',
  status: 'Active',
  scope: 'Standard MVP',
  createdBy: 'system',
  approvedBy: 'system',
  createdAt: '2026-09-11T00:00:00.000Z',
  reason: 'Approved Chunk 8 default payment period of seven calendar days after each fee maturity event.',
};

interface ConfirmedBuyerReceiptSource {
  id: string;
  transactionId: string;
  amount: number;
  method?: string;
  status: string;
  reportedById?: string;
  reportedAt: string;
  confirmedAt?: string;
}

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

function roundMoney(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function normalizeEffectiveIso(value: string) {
  return value.length === 10 ? `${value}T00:00:00.000Z` : new Date(value).toISOString();
}

function addCalendarDays(iso: string, days: number) {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export function getFeeRateSchedules(): FeeRateSchedule[] {
  const stored = readJson<FeeRateSchedule[]>(RATE_SCHEDULE_STORAGE_KEY, []);
  const schedules = stored.length ? stored : [DEFAULT_MVP_FEE_SCHEDULE];
  return [...schedules].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
}

export function getApplicableFeeRateSchedule(at: string = new Date().toISOString()): FeeRateSchedule {
  const eligible = getFeeRateSchedules()
    .filter(schedule => schedule.status !== 'Superseded')
    .filter(schedule => schedule.effectiveFrom <= at)
    .filter(schedule => !schedule.effectiveTo || schedule.effectiveTo > at)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  return eligible[0] ?? DEFAULT_MVP_FEE_SCHEDULE;
}

export function getApplicableFeeRatePercent(at?: string): number {
  return getApplicableFeeRateSchedule(at).ratePercent;
}

export function createFeeRateSchedule(params: {
  ratePercent: number;
  effectiveFrom: string;
  createdBy: string;
  reason: string;
}) {
  if (!Number.isFinite(params.ratePercent) || params.ratePercent < 0 || params.ratePercent > 100) {
    return { error: 'Fee rate must be between 0% and 100%.' } as const;
  }
  if (!params.effectiveFrom) return { error: 'Effective date is required.' } as const;
  if (!params.reason.trim()) return { error: 'Reason for the prospective rate schedule is required.' } as const;

  const effectiveIso = normalizeEffectiveIso(params.effectiveFrom);
  const today = new Date().toISOString().slice(0, 10);
  if (effectiveIso.slice(0, 10) <= today) {
    return { error: 'New fee-rate schedules must take effect on a future date.' } as const;
  }

  const schedules = getFeeRateSchedules();
  if (schedules.some(schedule => schedule.effectiveFrom === effectiveIso && schedule.status !== 'Superseded')) {
    return { error: 'A fee-rate schedule already exists for that effective date.' } as const;
  }

  const now = new Date().toISOString();
  const schedule: FeeRateSchedule = {
    id: `fee-schedule-${effectiveIso.slice(0, 10)}-${Date.now()}`,
    name: 'Standard MVP Success-Based Platform Fee',
    ratePercent: roundMoney(params.ratePercent),
    effectiveFrom: effectiveIso,
    status: 'Scheduled',
    scope: 'Standard MVP',
    createdBy: params.createdBy,
    createdAt: now,
    reason: params.reason.trim(),
  };
  const persisted = readJson<FeeRateSchedule[]>(RATE_SCHEDULE_STORAGE_KEY, []);
  const baseline = persisted.length ? persisted : [DEFAULT_MVP_FEE_SCHEDULE];
  writeJson(RATE_SCHEDULE_STORAGE_KEY, [...baseline, schedule]);
  return { schedule } as const;
}

export function getFeeDuePolicies(): FeeDuePolicy[] {
  const stored = readJson<FeeDuePolicy[]>(DUE_POLICY_STORAGE_KEY, []);
  const policies = stored.length ? stored : [DEFAULT_MVP_FEE_DUE_POLICY];
  return [...policies].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
}

export function getApplicableFeeDuePolicy(at: string = new Date().toISOString()): FeeDuePolicy {
  const eligible = getFeeDuePolicies()
    .filter(policy => policy.status !== 'Superseded')
    .filter(policy => policy.effectiveFrom <= at)
    .filter(policy => !policy.effectiveTo || policy.effectiveTo > at)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  return eligible[0] ?? DEFAULT_MVP_FEE_DUE_POLICY;
}

export function createFeeDuePolicy(params: {
  duePeriodDays: number;
  effectiveFrom: string;
  createdBy: string;
  reason: string;
}) {
  if (!Number.isInteger(params.duePeriodDays) || params.duePeriodDays < 1 || params.duePeriodDays > 365) {
    return { error: 'Fee due period must be a whole number from 1 to 365 calendar days.' } as const;
  }
  if (!params.effectiveFrom) return { error: 'Effective date is required.' } as const;
  if (!params.reason.trim()) return { error: 'Reason for the prospective due-period policy is required.' } as const;

  const effectiveIso = normalizeEffectiveIso(params.effectiveFrom);
  const today = new Date().toISOString().slice(0, 10);
  if (effectiveIso.slice(0, 10) <= today) {
    return { error: 'New fee-due policies must take effect on a future date.' } as const;
  }
  const policies = getFeeDuePolicies();
  if (policies.some(policy => policy.effectiveFrom === effectiveIso && policy.status !== 'Superseded')) {
    return { error: 'A fee-due policy already exists for that effective date.' } as const;
  }

  const now = new Date().toISOString();
  const policy: FeeDuePolicy = {
    id: `fee-due-policy-${effectiveIso.slice(0, 10)}-${Date.now()}`,
    name: 'Standard MVP Fee Due Period',
    duePeriodDays: params.duePeriodDays,
    effectiveFrom: effectiveIso,
    status: 'Scheduled',
    scope: 'Standard MVP',
    createdBy: params.createdBy,
    createdAt: now,
    reason: params.reason.trim(),
  };
  const persisted = readJson<FeeDuePolicy[]>(DUE_POLICY_STORAGE_KEY, []);
  const baseline = persisted.length ? persisted : [DEFAULT_MVP_FEE_DUE_POLICY];
  writeJson(DUE_POLICY_STORAGE_KEY, [...baseline, policy]);
  return { policy } as const;
}

export function getFeeRateSnapshots(transactionId?: string): FeeRateSnapshot[] {
  const items = readJson<FeeRateSnapshot[]>(RATE_SNAPSHOT_STORAGE_KEY, []);
  return transactionId ? items.filter(item => item.transactionId === transactionId) : items;
}

export function getFeeRateSnapshot(transactionId: string): FeeRateSnapshot | undefined {
  return getFeeRateSnapshots(transactionId)[0];
}

export function getPlatformFeeObligations(transactionId?: string): PlatformFeeObligation[] {
  const items = readJson<PlatformFeeObligation[]>(OBLIGATION_STORAGE_KEY, []);
  return transactionId ? items.filter(item => item.transactionId === transactionId) : items;
}

export function getPlatformFeeObligation(transactionId: string): PlatformFeeObligation | undefined {
  return getPlatformFeeObligations(transactionId)[0];
}

export function getFeeLedgerEvents(transactionId?: string): FeeLedgerEvent[] {
  const items = readJson<FeeLedgerEvent[]>(LEDGER_STORAGE_KEY, []);
  return (transactionId ? items.filter(item => item.transactionId === transactionId) : items)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function saveLedgerEvent(event: FeeLedgerEvent) {
  const existing = getFeeLedgerEvents().find(item => item.id === event.id);
  if (!existing) upsert(LEDGER_STORAGE_KEY, event);
}

export function getFeeMaturityEvents(transactionId?: string): FeeMaturityEvent[] {
  const items = readJson<FeeMaturityEvent[]>(MATURITY_STORAGE_KEY, []);
  return (transactionId ? items.filter(item => item.transactionId === transactionId) : items)
    .sort((a, b) => a.maturedAt.localeCompare(b.maturedAt));
}

function getConfirmedBuyerReceiptSources(transactionId: string): ConfirmedBuyerReceiptSource[] {
  return readJson<ConfirmedBuyerReceiptSource[]>(CHUNK7_PAYMENT_STORAGE_KEY, [])
    .filter(record => record.transactionId === transactionId)
    .filter(record => record.status === 'Supplier Confirmed Received' && Boolean(record.confirmedAt))
    .sort((a, b) => (a.confirmedAt ?? a.reportedAt).localeCompare(b.confirmedAt ?? b.reportedAt));
}

function agingBucketForDueAt(dueAt: string, at: string): FeeMaturityAgingBucket {
  if (dueAt >= at) return 'Current / Not Overdue';
  const elapsedMs = new Date(at).getTime() - new Date(dueAt).getTime();
  const daysOverdue = Math.max(1, Math.ceil(elapsedMs / 86_400_000));
  if (daysOverdue <= 7) return '1–7 Days Overdue';
  if (daysOverdue <= 30) return '8–30 Days Overdue';
  if (daysOverdue <= 60) return '31–60 Days Overdue';
  return 'More Than 60 Days Overdue';
}

function deriveObligationStatus(params: {
  obligation: PlatformFeeObligation;
  maturedAmount: number;
  currentDueAmount: number;
  overdueAmount: number;
  notYetDueAmount: number;
}): PlatformFeeObligationStatus {
  if (params.obligation.originalFeeAmount === undefined || !params.obligation.assessedAt) return 'Rate Locked';
  if (params.maturedAmount <= 0) return 'Fee Assessed — Not Yet Due';
  if (params.overdueAmount > 0) {
    return params.currentDueAmount > 0 || params.notYetDueAmount > 0 ? 'Partially Overdue' : 'Overdue';
  }
  return params.notYetDueAmount > 0 ? 'Partially Due' : 'Due';
}

export function getPlatformFeeMaturitySummary(transactionId: string, at: string = new Date().toISOString()): PlatformFeeMaturitySummary | undefined {
  const obligation = getPlatformFeeObligation(transactionId);
  if (!obligation) return undefined;
  const events = getFeeMaturityEvents(transactionId);
  const finalFeeObligation = roundMoney(obligation.originalFeeAmount ?? 0);
  const maturedAmount = roundMoney(events.reduce((sum, event) => sum + event.maturedFeeAmount, 0));
  const notYetDueAmount = roundMoney(Math.max(0, finalFeeObligation - maturedAmount));
  const currentEvents = events.filter(event => event.dueAt >= at);
  const overdueEvents = events.filter(event => event.dueAt < at);
  const currentDueAmount = roundMoney(currentEvents.reduce((sum, event) => sum + event.maturedFeeAmount, 0));
  const overdueAmount = roundMoney(overdueEvents.reduce((sum, event) => sum + event.maturedFeeAmount, 0));
  const nextDueAt = currentEvents.map(event => event.dueAt).sort()[0];
  const oldestDueAt = events.map(event => event.dueAt).sort()[0];
  const agingBuckets: Record<FeeMaturityAgingBucket, number> = {
    'Current / Not Overdue': 0,
    '1–7 Days Overdue': 0,
    '8–30 Days Overdue': 0,
    '31–60 Days Overdue': 0,
    'More Than 60 Days Overdue': 0,
  };
  events.forEach(event => {
    const bucket = agingBucketForDueAt(event.dueAt, at);
    agingBuckets[bucket] = roundMoney(agingBuckets[bucket] + event.maturedFeeAmount);
  });
  const status = deriveObligationStatus({ obligation, maturedAmount, currentDueAmount, overdueAmount, notYetDueAmount });
  return {
    transactionId,
    obligationId: obligation.id,
    finalFeeObligation,
    maturedAmount,
    notYetDueAmount,
    currentDueAmount,
    overdueAmount,
    nextDueAt,
    oldestDueAt,
    status,
    agingBuckets,
  };
}

export function lockFeeRateForTransaction(transaction: Gate1Transaction, actorId: string = 'system') {
  const existingSnapshot = getFeeRateSnapshot(transaction.id);
  const existingObligation = getPlatformFeeObligation(transaction.id);
  if (existingSnapshot && existingObligation) {
    return { snapshot: existingSnapshot, obligation: existingObligation } as const;
  }

  const schedule = getApplicableFeeRateSchedule(transaction.committedAt);
  const snapshot: FeeRateSnapshot = existingSnapshot ?? {
    id: `fee-rate-snapshot-${transaction.id}`,
    transactionId: transaction.id,
    scheduleId: schedule.id,
    supplierId: transaction.supplierId,
    ratePercent: schedule.ratePercent,
    policyVersion: PLATFORM_FEE_POLICY_VERSION,
    lockedAt: transaction.committedAt,
    createdAt: new Date().toISOString(),
  };
  if (!existingSnapshot) upsert(RATE_SNAPSHOT_STORAGE_KEY, snapshot);

  const obligation: PlatformFeeObligation = existingObligation ?? {
    id: `fee-obligation-${transaction.id}`,
    feeReference: `FEE-${transaction.transactionReference}`,
    transactionId: transaction.id,
    demandId: transaction.demandId,
    supplierId: transaction.supplierId,
    supplierDisplayName: transaction.finalTerms.supplierName,
    rateSnapshotId: snapshot.id,
    lockedRatePercent: snapshot.ratePercent,
    status: 'Rate Locked',
    createdAt: new Date().toISOString(),
  };
  if (!existingObligation) upsert(OBLIGATION_STORAGE_KEY, obligation);

  saveLedgerEvent({
    id: `fee-event-${transaction.id}-rate-locked`,
    obligationId: obligation.id,
    transactionId: transaction.id,
    eventType: 'Fee Rate Locked',
    ratePercent: snapshot.ratePercent,
    actorId,
    actorRole: actorId === 'system' ? 'system' : 'admin',
    reason: `Applicable fee rate locked from schedule ${schedule.id} at Mutual Commitment.`,
    createdAt: transaction.committedAt,
  });

  return { snapshot, obligation } as const;
}

export function syncPlatformFeeMaturityForTransaction(transaction: Gate1Transaction, actorId: string = 'system') {
  const obligation = getPlatformFeeObligation(transaction.id);
  if (!obligation || obligation.originalFeeAmount === undefined || !obligation.assessedAt || transaction.activeCommittedQuantity > 0) {
    return { deferred: true as const, summary: obligation ? getPlatformFeeMaturitySummary(transaction.id) : undefined };
  }

  const existingEvents = getFeeMaturityEvents(transaction.id);
  const existingIds = new Set(existingEvents.map(event => event.buyerPaymentRecordId));
  let cumulativeEligibleReceipts = roundMoney(existingEvents.reduce((sum, event) => sum + event.eligibleReceiptAmount, 0));
  let cumulativeMaturedFee = roundMoney(existingEvents.reduce((sum, event) => sum + event.maturedFeeAmount, 0));
  const confirmedReceipts = getConfirmedBuyerReceiptSources(transaction.id);

  confirmedReceipts.forEach(record => {
    if (existingIds.has(record.id)) return;
    const remainingEligibleValue = roundMoney(Math.max(0, (obligation.finalTransactionValue ?? 0) - cumulativeEligibleReceipts));
    const eligibleReceiptAmount = roundMoney(Math.min(record.amount, remainingEligibleValue));
    if (eligibleReceiptAmount <= 0) return;

    cumulativeEligibleReceipts = roundMoney(cumulativeEligibleReceipts + eligibleReceiptAmount);
    const targetMaturedFee = roundMoney(Math.min(
      obligation.originalFeeAmount ?? 0,
      cumulativeEligibleReceipts * obligation.lockedRatePercent / 100,
    ));
    const maturedFeeAmount = roundMoney(Math.max(0, targetMaturedFee - cumulativeMaturedFee));
    if (maturedFeeAmount <= 0) return;

    const receiptConfirmedAt = record.confirmedAt ?? record.reportedAt;
    const maturedAt = receiptConfirmedAt < obligation.assessedAt! ? obligation.assessedAt! : receiptConfirmedAt;
    const duePolicy = getApplicableFeeDuePolicy(maturedAt);
    const dueAt = addCalendarDays(maturedAt, duePolicy.duePeriodDays);
    const triggerType = receiptConfirmedAt < obligation.assessedAt!
      ? 'FTV Established After Prepayment' as const
      : record.method === 'Cash / COD' && record.reportedById === transaction.supplierId
        ? 'Cash Received' as const
        : 'Supplier Confirmed Receipt' as const;
    cumulativeMaturedFee = roundMoney(cumulativeMaturedFee + maturedFeeAmount);

    const event: FeeMaturityEvent = {
      id: `fee-maturity-${obligation.id}-${record.id}`,
      obligationId: obligation.id,
      transactionId: transaction.id,
      buyerPaymentRecordId: record.id,
      triggerType,
      eligibleReceiptAmount,
      cumulativeEligibleReceipts,
      maturedFeeAmount,
      cumulativeMaturedFee,
      maturedAt,
      duePolicyId: duePolicy.id,
      duePeriodDays: duePolicy.duePeriodDays,
      dueAt,
      createdAt: new Date().toISOString(),
    };
    upsert(MATURITY_STORAGE_KEY, event);
    saveLedgerEvent({
      id: `fee-event-${transaction.id}-matured-${record.id}`,
      obligationId: obligation.id,
      transactionId: transaction.id,
      eventType: 'Fee Portion Matured',
      amount: maturedFeeAmount,
      ratePercent: obligation.lockedRatePercent,
      sourceRecordId: record.id,
      dueAt,
      actorId,
      actorRole: actorId === 'system' ? 'system' : 'admin',
      reason: `Fee portion matured from ${triggerType}. Buyer refunds do not independently demature this fee portion.`,
      createdAt: maturedAt,
    });
  });

  const summary = getPlatformFeeMaturitySummary(transaction.id);
  if (summary && obligation.status !== summary.status) {
    upsert(OBLIGATION_STORAGE_KEY, { ...obligation, status: summary.status });
  }
  return { deferred: false as const, summary };
}

export function assessPlatformFeeForTransaction(transaction: Gate1Transaction, actorId: string = 'system') {
  const locked = lockFeeRateForTransaction(transaction, actorId);
  if (transaction.activeCommittedQuantity > 0) {
    return { ...locked, deferred: true as const };
  }

  if (locked.obligation.originalFeeAmount !== undefined && locked.obligation.assessedAt) {
    const maturity = syncPlatformFeeMaturityForTransaction(transaction, actorId);
    return {
      ...locked,
      obligation: getPlatformFeeObligation(transaction.id) ?? locked.obligation,
      maturity,
      deferred: false as const,
    };
  }

  const assessedAt = new Date().toISOString();
  const originalFeeAmount = roundMoney(transaction.finalTransactionValue * locked.snapshot.ratePercent / 100);
  const obligation: PlatformFeeObligation = {
    ...locked.obligation,
    finalTransactionValue: roundMoney(transaction.finalTransactionValue),
    originalFeeAmount,
    status: 'Fee Assessed — Not Yet Due',
    assessedAt,
  };
  upsert(OBLIGATION_STORAGE_KEY, obligation);

  saveLedgerEvent({
    id: `fee-event-${transaction.id}-assessed`,
    obligationId: obligation.id,
    transactionId: transaction.id,
    eventType: 'Fee Assessed',
    amount: originalFeeAmount,
    finalTransactionValue: obligation.finalTransactionValue,
    ratePercent: obligation.lockedRatePercent,
    actorId,
    actorRole: actorId === 'system' ? 'system' : 'admin',
    reason: 'Fee assessed from the authoritative Final Transaction Value. Maturity depends only on authoritative Supplier-confirmed Buyer receipt.',
    createdAt: assessedAt,
  });

  const maturity = syncPlatformFeeMaturityForTransaction(transaction, actorId);
  return {
    snapshot: locked.snapshot,
    obligation: getPlatformFeeObligation(transaction.id) ?? obligation,
    maturity,
    deferred: false as const,
  };
}
