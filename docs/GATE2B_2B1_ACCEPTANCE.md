# Gate 2B — Increment 2B-1 Acceptance Record

**Increment:** 2B-1 — Platform Fee Domain Foundation  
**Gate:** Gate 2B — Chunk 8 Success-Based Platform Fee Collection  
**Status:** Accepted and Closed  
**Approval Date:** 2026-09-11  
**Implementation Branch:** `feature/gate2b-platform-fee-foundation`  
**Base Branch:** `ani-to-mvp-01`

## Accepted Result

Increment 2B-1 establishes the authoritative Platform Fee domain foundation for Ani Market without implementing later fee-maturity, collection, enforcement, dispute, tax-document, or gateway functions.

The accepted implementation provides:

- an effective-dated Success-Based Platform Fee rate schedule with the standard MVP rate of 3.00%;
- an immutable transaction-level fee-rate snapshot created at Mutual Commitment;
- Supplier-only platform-fee liability per committed Supplier Transaction;
- a transaction-level Platform Fee Obligation;
- fee assessment from the authoritative Final Transaction Value using the locked rate;
- two-decimal monetary rounding and zero-value handling;
- append-only `Fee Rate Locked` and `Fee Assessed` ledger events;
- prospective-only fee-rate changes without retroactive alteration of existing Transaction snapshots;
- Supplier fee-rate disclosure before Mutual Commitment;
- controlled Admin fee-rate schedule management; and
- a dedicated Gate 2B regression contract and CI validation path.

## Governing Calculation

`Success-Based Platform Fee = Final Transaction Value × Locked Platform Fee Rate`

The fee engine does not use Demand value, Buyer target price, Offer value, selected quantity, reserved quantity, Historical Committed Transaction Value, rejected quantity, waived residual, tolerance-only variance, or other non-final commercial values as the fee basis.

## Architectural Boundaries Preserved

Increment 2B-1 consumes authoritative commercial value from the Gate 1 / Chunk 6 Transaction and fulfillment domain. It does not independently recompute accepted commercial quantity.

The Buyer-to-Supplier Payment Record / Evidence Ledger introduced under Gate 2A / Chunk 7 remains a separate financial domain. Increment 2B-1 does not collect, receive, hold, settle, release, or custody Buyer funds.

Legacy Match-stage fee fields and computations remain historical prototype behavior only and are not authoritative for the new Platform Fee domain.

## Explicitly Deferred Beyond 2B-1

The following are not part of this accepted increment and remain for succeeding Gate 2B increments:

- proportional fee maturity;
- seven-calendar-day due periods;
- Supplier-to-Ani Market payment collection;
- Fee Payment References;
- partial or consolidated fee remittances;
- payment allocation and confirmation;
- overdue aging and enforcement;
- billing credits, waivers, adjustments, refunds, and write-offs;
- Platform Fee Disputes;
- statutory tax-document generation;
- accounting-system integration;
- automated payment-gateway collection;
- split payments, escrow, Buyer-payment interception, or automatic fee deduction.

## Validation and Closure Evidence

The final Gate 2B CI run for the increment passed all required controls:

- Gate 1 regression contract;
- Gate 2A payment regression contract;
- Gate 2B / 2B-1 platform-fee regression contract;
- TypeScript typecheck;
- lint;
- production build; and
- built-application smoke check.

The implementation was accepted for closure after controlled review. This acceptance record closes Increment 2B-1 only. Merge into `ani-to-mvp-01` remains a separate controlled approval gate.

## Next Increment

After the controlled merge gate, proceed to **Gate 2B Increment 2B-2 — Fee Maturity and Due Logic**.
