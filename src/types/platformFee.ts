export type FeeRateScheduleStatus = 'Active' | 'Scheduled' | 'Superseded';

export interface FeeRateSchedule {
  id: string;
  name: string;
  ratePercent: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: FeeRateScheduleStatus;
  scope: 'Standard MVP';
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  reason?: string;
}

export interface FeeRateSnapshot {
  id: string;
  transactionId: string;
  scheduleId: string;
  supplierId: string;
  ratePercent: number;
  policyVersion: string;
  lockedAt: string;
  createdAt: string;
}

export type PlatformFeeObligationStatus =
  | 'Rate Locked'
  | 'Fee Assessed — Not Yet Due';

export interface PlatformFeeObligation {
  id: string;
  feeReference: string;
  transactionId: string;
  demandId: string;
  supplierId: string;
  supplierDisplayName: string;
  rateSnapshotId: string;
  lockedRatePercent: number;
  finalTransactionValue?: number;
  originalFeeAmount?: number;
  status: PlatformFeeObligationStatus;
  createdAt: string;
  assessedAt?: string;
}

export type FeeLedgerEventType =
  | 'Fee Rate Locked'
  | 'Fee Assessed';

export interface FeeLedgerEvent {
  id: string;
  obligationId: string;
  transactionId: string;
  eventType: FeeLedgerEventType;
  amount?: number;
  finalTransactionValue?: number;
  ratePercent?: number;
  actorId: string;
  actorRole: 'system' | 'admin' | 'buyer' | 'supplier';
  reason?: string;
  createdAt: string;
}
