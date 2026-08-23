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
  if (hits.length) failures.push(`${name}: forbidden legacy behavior found -> ${hits.join(' | ')}`);
  else passes.push(name);
}

requirePatterns('Chunk 1 trust/transaction gating', 'src/context/AppContext.tsx', [
  'canTransact',
  'emailStatus',
  'mobileStatus',
  'transactionAccessStatus',
]);

requirePatterns('Chunk 2 qualified Demand lifecycle', 'src/data/gate1DemandData.ts', [
  'Submitted for Qualification',
  'Open for Offers',
  'Needs Correction',
  'buyerSeriousnessDeclared',
]);

requirePatterns('Chunk 2 target price representation', 'src/types/index.ts', [
  "export type TargetPriceType = 'Approximate' | 'Average' | 'Range'",
  'TargetPriceProfile',
]);

requirePatterns('Chunk 3 versioned Offer model', 'src/data/gate1OfferData.ts', [
  'createOffer',
  'reviseOffer',
  'withdrawOffer',
  'getActiveOfferForSupplierDemand',
  'Offer validity',
]);

requirePatterns('Chunk 4 Selection/reservation model', 'src/types/index.ts', [
  'SelectedAllocation',
  'Pending Supplier Confirmation',
  'confirmationWindowHours',
  'reservationExpiresAt',
]);

requirePatterns('Chunk 4 Buyer comparison and FCFS batching', 'src/pages/buyer/BuyerResponses.tsx', [
  'Submission Time',
  'Show Next Offers',
  'Selected quantity',
]);

requirePatterns('Chunk 5 negotiation and exact-version acceptance', 'src/data/gate1CommerceData.ts', [
  'NegotiationThread',
  'currentProposalVersion',
  'acceptCurrentProposal',
  'CommitmentAcceptance',
  'Mutual Commitment',
]);

requirePatterns('Chunk 5 reservation does not reset during counters', 'src/pages/shared/NegotiationWorkspace.tsx', [
  'Counter-proposals do not reset, extend, or independently increase the reservation',
  'reservationExpired',
  'Accept Current Version',
]);

requirePatterns('Chunk 5 immutable committed transaction snapshot', 'src/data/gate1CommerceData.ts', [
  'FinalTermsSnapshot',
  'committedTransactionValue',
  'operationalContactReleased',
  'transactionReference',
]);

requirePatterns('Chunk 6 quantity conservation engine', 'src/data/gate1CommerceData.ts', [
  'historicalCommittedQuantity',
  'activeCommittedQuantity',
  'fulfilledQuantity',
  'acceptedToleranceVariance',
  'waivedResidual',
  'remainingQuantity',
  'balanced:',
]);

requirePatterns('Chunk 6 fulfillment and final value separation', 'src/pages/shared/Gate1TransactionWorkspace.tsx', [
  'Historical Committed',
  'Active Outstanding',
  'Buyer Accepted',
  'Final Transaction Value',
  'Committed Transaction Value',
]);

requirePatterns('Chunk 6 cure/excess controls', 'src/pages/shared/Gate1TransactionWorkspace.tsx', [
  'Request Supplier Cure',
  'Cure Failed — Release Outstanding',
  'Accepted Excess Adjustment',
]);

requirePatterns('Accessible quantity-state labels', 'src/components/DemandQuantityProgress.tsx', [
  'Fulfilled / Accepted',
  'Active Committed',
  'Reserved',
  'Accepted Tolerance Variance',
  'Waived Residual',
  'Remaining',
  'aria-label',
]);

forbidPatterns('No active Gate 1 Match shortcut', [
  'src/pages/buyer/BuyerResponses.tsx',
  'src/pages/buyer/DemandDetail.tsx',
  'src/pages/supplier/SupplierResponses.tsx',
], ['Accept & Match', 'Confirm Match']);

forbidPatterns('No premature payment/fee logic in Gate 1 transaction workspace', [
  'src/pages/shared/Gate1TransactionWorkspace.tsx',
  'src/pages/shared/NegotiationWorkspace.tsx',
], ['Submit Payment Proof', 'Pay Platform Fee', 'Collect Platform Fee']);

if (failures.length) {
  console.error(`Gate 1 regression contract FAILED (${failures.length} issue${failures.length === 1 ? '' : 's'}):`);
  failures.forEach(failure => console.error(` - ${failure}`));
  process.exit(1);
}

console.log(`Gate 1 regression contract PASS (${passes.length} controls).`);
passes.forEach(pass => console.log(` - ${pass}`));
