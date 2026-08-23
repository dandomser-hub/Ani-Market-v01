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

requirePatterns('Chunk 2 qualification engine', 'src/data/gate1DemandData.ts', [
  'qualifyDemand',
  'Open for Offers',
  'Needs Correction',
  'buyerSeriousnessDeclared',
  'commodity-enabled',
  'location-service-area-enabled',
]);

requirePatterns('Chunk 2 controlled Demand lifecycle', 'src/types/index.ts', [
  'Submitted for Qualification',
  'Open for Offers',
  'Offer Window Closed',
  'Cancelled',
  'Expired',
  'Suspended',
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
  'validUntil',
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
  'Quantity to Select',
  'Reserve Selection',
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

requirePatterns('Chunk 5 immutable snapshot type', 'src/types/index.ts', [
  'FinalTermsSnapshot',
  'committedQuantity',
  'agreedTransactionPrice',
  'committedTransactionValue',
]);

requirePatterns('Chunk 5 transaction creation carries immutable terms/contact release', 'src/data/gate1CommerceData.ts', [
  'finalTerms',
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

requirePatterns('Gate 1 admin boundary excludes authoritative fee monitoring', 'src/pages/admin/AdminMatches.tsx', [
  'Selections & Commitments',
  'Payment and Success-Based Platform Fee workflows remain outside Gate 1 Chunks 1–6',
  'Legacy Match Records — historical prototype only',
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
