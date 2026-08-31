export type PaymentMethod =
  | 'Bank Transfer'
  | 'GCash'
  | 'Maya'
  | 'QR Ph'
  | 'Cash / COD'
  | 'Check'
  | 'Other External Method';

export type PaymentTermsType =
  | 'Full Prepayment'
  | 'Payment on Buyer Acceptance'
  | 'Cash on Delivery'
  | 'Advance + Balance'
  | 'Staged / Milestone'
  | 'Credit Terms'
  | 'Other Agreed Arrangement';

export type PaymentTermsStatus = 'Pending Agreement' | 'Agreed' | 'Superseded';

export interface PaymentScheduleStage {
  id: string;
  label: string;
  percentage?: number;
  amount?: number;
  dueBasis:
    | 'On Commitment'
    | 'Before Fulfillment'
    | 'On Delivery'
    | 'On Buyer Acceptance'
    | 'Days After Buyer Acceptance'
    | 'Fixed Date'
    | 'Per Agreed Schedule';
  daysAfterAcceptance?: number;
  dueDate?: string;
}

export interface PaymentTermsSnapshot {
  id: string;
  transactionId: string;
  versionNumber: number;
  termsType: PaymentTermsType;
  preferredMethod?: PaymentMethod;
  schedule: PaymentScheduleStage[];
  notes?: string;
  proposedById: string;
  proposedByRole: 'buyer' | 'supplier';
  buyerAcceptedAt?: string;
  supplierAcceptedAt?: string;
  status: PaymentTermsStatus;
  createdAt: string;
  lockedAt?: string;
}

export type PaymentRecordStatus =
  | 'Buyer Reported Payment Sent'
  | 'Supplier Confirmed Received'
  | 'Withdrawn Before Confirmation'
  | 'Payment Issue Raised';

export interface PaymentRecord {
  id: string;
  transactionId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  method: PaymentMethod;
  externalReference?: string;
  evidenceReference?: string;
  notes?: string;
  status: PaymentRecordStatus;
  reportedById: string;
  reportedAt: string;
  confirmedById?: string;
  confirmedAt?: string;
  withdrawalReason?: string;
  withdrawnAt?: string;
  issueNote?: string;
  issueRaisedAt?: string;
  immutableAt?: string;
}

export type RefundRecordStatus =
  | 'Supplier Reported Refund Sent'
  | 'Buyer Confirmed Refund Received'
  | 'Refund Issue Raised';

export interface RefundRecord {
  id: string;
  transactionId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  method: PaymentMethod;
  reason: string;
  externalReference?: string;
  evidenceReference?: string;
  status: RefundRecordStatus;
  reportedById: string;
  reportedAt: string;
  confirmedById?: string;
  confirmedAt?: string;
  issueNote?: string;
  issueRaisedAt?: string;
  immutableAt?: string;
}

export type PaymentEventType =
  | 'Payment Terms Proposed'
  | 'Payment Terms Accepted'
  | 'Payment Terms Superseded'
  | 'Payment Reported Sent'
  | 'Payment Confirmed Received'
  | 'Cash Received Recorded'
  | 'Payment Report Withdrawn'
  | 'Payment Issue Raised'
  | 'Refund Reported Sent'
  | 'Refund Confirmed Received'
  | 'Refund Issue Raised';

export interface PaymentEvent {
  id: string;
  transactionId: string;
  recordId?: string;
  eventType: PaymentEventType;
  actorId: string;
  actorRole: 'buyer' | 'supplier' | 'admin';
  reason?: string;
  createdAt: string;
}

export type PaymentReconciliationStatus =
  | 'Payment Terms Pending'
  | 'Not Yet Due'
  | 'Payment Due'
  | 'Payment Reported — Awaiting Confirmation'
  | 'Partially Paid — Supplier Confirmed'
  | 'Paid in Full — Supplier Confirmed'
  | 'Overpayment / Refund Due'
  | 'Payment Issue Raised';

export interface PaymentReconciliation {
  transactionId: string;
  expectedPaymentAmount: number;
  finalPayableAmount: number;
  reconciliationTargetAmount: number;
  reconciliationBasis: 'Expected Payment Amount' | 'Final Payable Amount';
  finalPayableFinalized: boolean;
  confirmedPaidAmount: number;
  confirmedRefundAmount: number;
  netConfirmedPaid: number;
  outstandingBalance: number;
  overpayment: number;
  refundDue: number;
  status: PaymentReconciliationStatus;
}

export interface PaymentEvidenceReview {
  id: string;
  transactionId: string;
  recordId: string;
  recordType: 'Payment' | 'Refund';
  status: 'Reviewed for Record' | 'Needs Clarification';
  notes?: string;
  adminId: string;
  createdAt: string;
}
