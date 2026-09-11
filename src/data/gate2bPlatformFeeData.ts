import type { Gate1Transaction } from '../types';
import type {
  FeeLedgerEvent,
  FeeRateSchedule,
  FeeRateSnapshot,
  PlatformFeeObligation,
} from '../types/platformFee';

const RATE_SCHEDULE_STORAGE_KEY = 'ani-market-gate2b-fee-rate-schedules';
const RATE_SNAPSHOT_STORAGE_KEY = 'ani-market-gate2b-fee-rate-snapshots';
const OBLIGATION_STORAGE_KEY = 'ani-market-gate2b-fee-obligations';
const LEDGER_STORAGE_KEY = 'ani-market-gate2b-fee-ledger-events';

export const DEFAULT_MVP_FEE_RATE_PERCENT = 3;
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

  const effectiveIso = params.effectiveFrom.length === 10
    ? `${params.effectiveFrom}T00:00:00.000Z`
    : new Date(params.effectiveFrom).toISOString();
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

export function assessPlatformFeeForTransaction(transaction: Gate1Transaction, actorId: string = 'system') {
  const locked = lockFeeRateForTransaction(transaction, actorId);
  if (transaction.activeCommittedQuantity > 0) {
    return { ...locked, deferred: true as const };
  }

  if (locked.obligation.status === 'Fee Assessed — Not Yet Due') {
    return { ...locked, obligation: locked.obligation, deferred: false as const };
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
    reason: 'Fee assessed from the authoritative Final Transaction Value. Maturity and collection are deferred to later Gate 2B increments.',
    createdAt: assessedAt,
  });

  return { snapshot: locked.snapshot, obligation, deferred: false as const };
}
