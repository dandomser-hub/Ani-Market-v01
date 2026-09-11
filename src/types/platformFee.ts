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

export type FeeDuePolicyStatus = 'Active' | 'Scheduled' | 'Superseded';

export interface FeeDuePolicy {
  id: string;
  name: string;
  duePeriodDays: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: FeeDuePolicyStatus;
  scope: 'Standard MVP';
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  reason?: string;
}

export type PlatformFeeObligationStatus =
  | 'Rate Locked'
  | 'Fee Assessed — Not Yet Due'
  | 'Partially Due'
  | 'Due'
  | 'Partially Overdue'
  | 'Overdue';

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

export type FeeMaturityTriggerType =
  | 'Supplier Confirmed Receipt'
  | 'Cash Received'
  | 'FTV Established After Prepayment';

export interface FeeMaturityEvent {
  id: string;
  obligationId: string;
  transactionId: string;
  buyerPaymentRecordId: string;
  triggerType: FeeMaturityTriggerType;
  eligibleReceiptAmount: number;
  cumulativeEligibleReceipts: number;
  maturedFeeAmount: number;
  cumulativeMaturedFee: number;
  maturedAt: string;
  duePolicyId: string;
  duePeriodDays: number;
  dueAt: string;
  createdAt: string;
}

export type FeeMaturityAgingBucket =
  | 'Current / Not Overdue'
  | '1–7 Days Overdue'
  | '8–30 Days Overdue'
  | '31–60 Days Overdue'
  | 'More Than 60 Days Overdue';

export interface PlatformFeeMaturitySummary {
  transactionId: string;
  obligationId: string;
  finalFeeObligation: number;
  maturedAmount: number;
  notYetDueAmount: number;
  currentDueAmount: number;
  overdueAmount: number;
  nextDueAt?: string;
  oldestDueAt?: string;
  status: PlatformFeeObligationStatus;
  agingBuckets: Record<FeeMaturityAgingBucket, number>;
}

export type FeeLedgerEventType =
  | 'Fee Rate Locked'
  | 'Fee Assessed'
  | 'Fee Portion Matured';

export interface FeeLedgerEvent {
  id: string;
  obligationId: string;
  transactionId: string;
  eventType: FeeLedgerEventType;
  amount?: number;
  finalTransactionValue?: number;
  ratePercent?: number;
  sourceRecordId?: string;
  dueAt?: string;
  actorId: string;
  actorRole: 'system' | 'admin' | 'buyer' | 'supplier';
  reason?: string;
  createdAt: string;
}
