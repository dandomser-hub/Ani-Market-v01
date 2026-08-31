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

requirePatterns('Chunk 7 non-custodial controlled baseline', 'docs/CHUNK7_PAYMENT_MODEL_BASELINE.md', [
  'does not receive, hold, settle, release, or custody',
  'Payment Record / Evidence Ledger',
  'Chunk 8 Success-Based Platform Fee collection is explicitly outside Gate 2A',
]);

requirePatterns('Payment domain model', 'src/types/payment.ts', [
  'PaymentTermsSnapshot',
  'PaymentRecord',
  'RefundRecord',
  'PaymentReconciliation',
  'Buyer Reported Payment Sent',
  'Supplier Confirmed Received',
  'Buyer Confirmed Refund Received',
]);

requirePatterns('Bilateral payment terms and amendments', 'src/data/gate2PaymentData.ts', [
  'proposePaymentTerms',
  'acceptPaymentTerms',
  'Pending Agreement',
  'Superseded',
  'lockedAt',
]);

requirePatterns('Buyer report and Supplier receipt authority', 'src/data/gate2PaymentData.ts', [
  'reportPaymentSent',
  'confirmPaymentReceived',
  'Only the receiving Supplier may confirm this payment',
  'Buyer Reported Payment Sent',
  'Supplier Confirmed Received',
]);

requirePatterns('Cash COD direct receipt', 'src/data/gate2PaymentData.ts', [
  'recordCashReceived',
  "method: 'Cash / COD'",
  'Cash Received Recorded',
]);

requirePatterns('Payment immutability and withdrawal', 'src/data/gate2PaymentData.ts', [
  'immutableAt',
  'withdrawPaymentReport',
  'Withdrawal reason is required',
  'Confirmed or issue-raised payment records cannot be withdrawn',
]);

requirePatterns('Refund direction and Buyer confirmation', 'src/data/gate2PaymentData.ts', [
  'reportRefundSent',
  'confirmRefundReceived',
  'Only the receiving Buyer may confirm this refund',
]);

requirePatterns('Reconciliation equations', 'src/data/gate2PaymentData.ts', [
  'expectedPaymentAmount',
  'finalPayableAmount',
  'confirmedPaidAmount',
  'confirmedRefundAmount',
  'netConfirmedPaid',
  'outstandingBalance',
  'overpayment',
  'refundDue',
]);

requirePatterns('Payment can coexist with fulfillment', 'src/data/gate2PaymentData.ts', [
  'transaction.activeCommittedQuantity <= 0',
  'Expected Payment Amount',
  'Final Payable Amount',
]);

requirePatterns('Buyer Supplier payment workspace', 'src/pages/shared/PaymentWorkspace.tsx', [
  'Report External Payment Sent',
  'Confirm Received',
  'Record Cash / COD Received',
  'Refund Due',
  'Scope Boundary',
]);

requirePatterns('Admin evidence review cannot confirm receipt', 'src/pages/admin/AdminPaymentReview.tsx', [
  'Administrative evidence review only',
  'Admin does not confirm receipt',
  'Reviewed for Record',
  'Needs Clarification',
]);

requirePatterns('Active navigation uses Gate 2A payment center', 'src/components/AppSidebar.tsx', [
  "to: '/payments'",
  'Payments & Reconciliation',
  'Payment Evidence Review',
  'Fee Settings (Pending Chunk 8)',
]);

forbidPatterns('No legacy payment-proof navigation in active sidebar', ['src/components/AppSidebar.tsx'], [
  "to: '/payment-proof'",
  'Payment Proof / Refs (Legacy)',
]);

forbidPatterns('No Chunk 8 fee computation in Gate 2A payment engine/workspace', [
  'src/data/gate2PaymentData.ts',
  'src/pages/shared/PaymentCenter.tsx',
  'src/pages/admin/AdminPaymentReview.tsx',
], ['platformFeeRate', 'platformFeeAmount', 'collectPlatformFee', 'Pay Platform Fee']);

if (failures.length) {
  console.error(`Gate 2A payment regression contract FAILED (${failures.length} issue${failures.length === 1 ? '' : 's'}):`);
  failures.forEach(failure => console.error(` - ${failure}`));
  process.exit(1);
}

console.log(`Gate 2A payment regression contract PASS (${passes.length} controls).`);
passes.forEach(pass => console.log(` - ${pass}`));
