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
  "'Rate Locked'",
  "'Fee Assessed — Not Yet Due'",
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

requirePatterns('Supplier pre-commit disclosure', 'src/pages/supplier/SupplierResponses.tsx', [
  'Success-Based Platform Fee:',
  'authoritative Final Transaction Value',
  'applicable rate is locked if Mutual Commitment is created',
]);

requirePatterns('Negotiation pre-commit disclosure', 'src/pages/shared/NegotiationWorkspace.tsx', [
  'Success-Based Platform Fee:',
  'Committed value alone is not the fee basis',
]);

requirePatterns('Controlled admin rate schedule', 'src/pages/admin/AdminFeeSettings.tsx', [
  'Create Prospective Rate Schedule',
  'Existing committed Transactions retain their immutable rate snapshot',
  'createFeeRateSchedule',
]);

forbidPatterns('2B-1 fee engine does not use legacy transaction fee fields', [
  'src/data/gate2bPlatformFeeData.ts',
  'src/types/platformFee.ts',
], ['platformFeeRate', 'platformFeeAmount', 'totalAmount']);

forbidPatterns('2B-1 does not implement later collection or enforcement domains', [
  'src/data/gate2bPlatformFeeData.ts',
  'src/types/platformFee.ts',
], [
  'Fee Payment Reference',
  'Supplier Reported Fee Payment Sent',
  'Ani Market Confirmed Received',
  'Overdue',
  'Fee Waiver',
  'Platform Fee Dispute',
  'Tax Document',
  'webhook',
]);

if (failures.length) {
  console.error(`Gate 2B / 2B-1 platform fee regression contract FAILED (${failures.length} issue${failures.length === 1 ? '' : 's'}):`);
  failures.forEach(failure => console.error(` - ${failure}`));
  process.exit(1);
}

console.log(`Gate 2B / 2B-1 platform fee regression contract PASS (${passes.length} controls).`);
passes.forEach(pass => console.log(` - ${pass}`));
