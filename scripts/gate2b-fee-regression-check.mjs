import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const passes = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function requirePatterns(name, relativePath, patterns) {
  const content = read(relativePath);
  const missing = patterns.filter(pattern => !content.includes(pattern));
  if (missing.length) failures.push(`${name}: missing ${missing.join(', ')} in ${relativePath}`);
  else passes.push(name);
}

function forbidPatterns(name, relativePaths, patterns) {
  const hits = [];
  for (const relativePath of relativePaths) {
    const content = read(relativePath);
    for (const pattern of patterns) if (content.includes(pattern)) hits.push(`${relativePath}: ${pattern}`);
  }
  if (hits.length) failures.push(`${name}: forbidden behavior found -> ${hits.join(' | ')}`);
  else passes.push(name);
}

requirePatterns('Chunk 8 accepted baseline', 'docs/CHUNK8_PLATFORM_FEE_BASELINE.md', [
  'Success-Based Platform Fee = **Final Transaction Value × Applicable Platform Fee Rate**',
  'standard MVP rate is **3.00%**',
  'Supplier is the sole fee obligor',
  'Buyer → Supplier',
  'Supplier → Ani Market',
]);

requirePatterns('Platform fee domain types', 'src/types/platformFee.ts', [
  'FeeRateSchedule',
  'FeeRateSnapshot',
  'PlatformFeeObligation',
  'FeeLedgerEvent',
  'FeeDuePolicy',
  'FeeMaturityEvent',
  'PlatformFeeMaturitySummary',
  "'Rate Locked'",
  "'Fee Assessed — Not Yet Due'",
  "'Partially Due'",
  "'Due'",
  "'Partially Overdue'",
  "'Overdue'",
]);

requirePatterns('Effective-dated standard MVP rate', 'src/data/gate2bPlatformFeeData.ts', [
  'DEFAULT_MVP_FEE_RATE_PERCENT = 3',
  'getApplicableFeeRateSchedule',
  'effectiveFrom',
  'createFeeRateSchedule',
  'New fee-rate schedules must take effect on a future date.',
]);

requirePatterns('Immutable transaction fee-rate snapshot', 'src/data/gate2bPlatformFeeData.ts', [
  'lockFeeRateForTransaction',
  'Fee Rate Locked',
  'transaction.committedAt',
  'rateSnapshotId',
  'supplierId: transaction.supplierId',
]);

requirePatterns('Final Transaction Value assessment', 'src/data/gate2bPlatformFeeData.ts', [
  'assessPlatformFeeForTransaction',
  'transaction.activeCommittedQuantity > 0',
  'transaction.finalTransactionValue * locked.snapshot.ratePercent / 100',
  'Fee Assessed',
  'roundMoney',
]);

requirePatterns('Gate 1 transaction lifecycle hooks', 'src/data/gate1CommerceData.ts', [
  'lockFeeRateForTransaction(transaction)',
  'assessPlatformFeeForTransaction(updated)',
  'finalTransactionValue: (acceptedTotal + transaction.acceptedExcessQuantity) * transaction.finalTerms.agreedTransactionPrice',
]);

requirePatterns('Seven-day prospective due policy', 'src/data/gate2bPlatformFeeData.ts', [
  'DEFAULT_MVP_FEE_DUE_PERIOD_DAYS = 7',
  'DEFAULT_MVP_FEE_DUE_POLICY',
  'getApplicableFeeDuePolicy',
  'createFeeDuePolicy',
  'New fee-due policies must take effect on a future date.',
  'addCalendarDays',
]);

requirePatterns('Authoritative Supplier receipt maturity engine', 'src/data/gate2bPlatformFeeData.ts', [
  "CHUNK7_PAYMENT_STORAGE_KEY = 'ani-market-gate2a-payment-records'",
  "record.status === 'Supplier Confirmed Received'",
  'syncPlatformFeeMaturityForTransaction',
  'remainingEligibleValue',
  'Math.min(record.amount, remainingEligibleValue)',
  'targetMaturedFee',
  'Math.min(',
  'obligation.originalFeeAmount',
  "eventType: 'Fee Portion Matured'",
]);

requirePatterns('Prepayment and overpayment maturity boundary', 'src/data/gate2bPlatformFeeData.ts', [
  "'FTV Established After Prepayment'",
  'receiptConfirmedAt < obligation.assessedAt!',
  'obligation.finalTransactionValue ?? 0',
  'cumulativeEligibleReceipts',
  'cumulativeMaturedFee',
]);

requirePatterns('Chunk 7 confirmation hooks maturity without changing payment authority', 'src/data/gate2PaymentData.ts', [
  "status: 'Supplier Confirmed Received'",
  'syncPlatformFeeMaturityForTransaction(transaction);',
  'Only a Buyer-reported payment awaiting confirmation may be confirmed.',
  'Buyer refund confirmation does not demature an already matured Success-Based Platform Fee.',
]);

requirePatterns('Independent maturity deadlines and aging', 'src/data/gate2bPlatformFeeData.ts', [
  'buyerPaymentRecordId',
  'duePeriodDays',
  'dueAt',
  "'Current / Not Overdue'",
  "'1–7 Days Overdue'",
  "'8–30 Days Overdue'",
  "'31–60 Days Overdue'",
  "'More Than 60 Days Overdue'",
  'getPlatformFeeMaturitySummary',
]);

requirePatterns('Maturity idempotency', 'src/data/gate2bPlatformFeeData.ts', [
  'existingIds = new Set',
  'existingIds.has(record.id)',
  '`fee-maturity-${obligation.id}-${record.id}`',
]);

requirePatterns('Supplier pre-commit disclosure', 'src/pages/supplier/SupplierResponses.tsx', [
  'Success-Based Platform Fee:',
  'authoritative Final Transaction Value',
  'applicable rate is locked if Mutual Commitment is created',
]);

requirePatterns('Negotiation pre-commit disclosure', 'src/pages/shared/NegotiationWorkspace.tsx', [
  'Success-Based Platform Fee:',
  'Committed value alone is not the fee basis',
]);

requirePatterns('Read-only maturity and due visibility', 'src/pages/shared/Gate1TransactionWorkspace.tsx', [
  'Success-Based Platform Fee — Read Only',
  'Final Fee Obligation',
  'Matured Fee',
  'Not Yet Due',
  'Current Due',
  'Overdue',
  '2B-2 does not collect the fee or enforce delinquency',
]);

requirePatterns('Controlled admin rate and due schedules', 'src/pages/admin/AdminFeeSettings.tsx', [
  'Create Prospective Rate Schedule',
  'Create Prospective Due-Period Policy',
  'Existing Transaction snapshots and maturity deadlines remain immutable',
  'createFeeRateSchedule',
  'createFeeDuePolicy',
]);

requirePatterns('Approved 2B-2 controlled scope record', 'docs/GATE2B_2B2_SCOPE.md', [
  'Status: Approved for Implementation',
  'Fee Maturity and Due Logic',
  'seven calendar days',
  'Supplier-confirmed Buyer receipt',
  'does not collect the fee or enforce delinquency',
]);

forbidPatterns('Gate 2B fee engine does not use legacy transaction fee fields', [
  'src/data/gate2bPlatformFeeData.ts',
  'src/types/platformFee.ts',
], ['platformFeeRate', 'platformFeeAmount', 'totalAmount']);

forbidPatterns('2B-2 does not implement later collection, enforcement, dispute, tax, or gateway domains', [
  'src/data/gate2bPlatformFeeData.ts',
  'src/types/platformFee.ts',
  'src/pages/shared/Gate1TransactionWorkspace.tsx',
], [
  'Fee Payment Reference',
  'Supplier Reported Fee Payment Sent',
  'Ani Market Confirmed Received',
  'Fee Waiver',
  'Platform Fee Dispute',
  'Tax Document',
  'automatic debit',
  'split settlement',
  'webhook',
]);

if (failures.length) {
  console.error(`Gate 2B / 2B-2 platform fee regression contract FAILED (${failures.length} issue${failures.length === 1 ? '' : 's'}):`);
  failures.forEach(failure => console.error(` - ${failure}`));
  process.exit(1);
}

console.log(`Gate 2B / 2B-2 platform fee regression contract PASS (${passes.length} controls).`);
passes.forEach(pass => console.log(` - ${pass}`));
