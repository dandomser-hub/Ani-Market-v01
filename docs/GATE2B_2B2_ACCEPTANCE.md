# Gate 2B — Increment 2B-2 Acceptance Record

**Increment:** 2B-2 — Fee Maturity and Due Logic  
**Gate:** Gate 2B — Chunk 8 Success-Based Platform Fee Collection  
**Status:** Accepted and Closed  
**Controlled base:** `ani-to-mvp-01` at `fbab3cb454c638b9522e5865aa25b659a219aef9`  
**Implementation branch:** `feature/gate2b-fee-maturity-due`  
**Implementation head before closure record:** `e549df8f71fea16f965e45547b0caf637f966a71`

## Accepted result

Increment 2B-2 establishes the authoritative fee-maturity and due-date layer on top of the 2B-1 Platform Fee domain without introducing fee collection or enforcement.

The accepted implementation includes:

- `FeeDuePolicy` with the default MVP period of seven calendar days and prospective effective-dated changes.
- Append-only `FeeMaturityEvent` records with independent due dates.
- Fee maturity triggered only by authoritative `Supplier Confirmed Received` Buyer-to-Supplier payment records, including Supplier-recorded Cash/COD receipt.
- Proportional cumulative fee maturity using the locked fee rate and authoritative Final Transaction Value.
- Cumulative rounding controls so total matured fee cannot exceed the Final Fee Obligation.
- Prepayment handling: confirmed Buyer receipts before Final Transaction Value exists do not mature a fee until Final Transaction Value becomes authoritative.
- Buyer overpayment cap: confirmed Buyer receipts beyond Final Transaction Value do not increase platform-fee maturity.
- Refund boundary: Buyer refunds do not silently reduce or reverse already matured platform fees.
- Idempotent payment-to-maturity processing.
- Financial states: `Assessed — Not Yet Due`, `Partially Due`, `Due`, `Partially Overdue`, and `Overdue`.
- Aging foundations for Current, 1–7 days, 8–30 days, 31–60 days, and over 60 days overdue.
- Read-only fee maturity and due-date visibility in the Transaction workspace.
- Controlled prospective due-period configuration in Admin Fee Settings.

## Source-of-truth boundaries preserved

- Chunk 6 / Gate 1 remains authoritative for Final Transaction Value.
- Chunk 7 / Gate 2A remains authoritative for Supplier-confirmed Buyer receipt records.
- Chunk 8 / Gate 2B is authoritative for fee maturity and platform-fee due dates.

2B-2 does not independently alter fulfillment, Final Transaction Value, Buyer payment confirmation, or refund records.

## Explicit exclusions retained

The following remain outside 2B-2 and are deferred to later Gate 2B increments:

- Fee Payment References.
- Supplier-to-Ani Market fee payment submission or collection.
- Proof-of-fee-payment upload.
- Ani Market confirmation of fee receipt.
- Fee-payment allocation and consolidated remittance.
- Unapplied billing credits.
- Supplier Billing workspace.
- Reminder and enforcement automation.
- Offer or commitment restriction.
- Supplier suspension/restoration.
- Waivers, adjustments, refunds, reallocations, and write-offs.
- Platform Fee Disputes.
- Tax documents and accounting export.
- Payment gateway/webhook collection.
- Automatic debit, split settlement, escrow, or Buyer-payment deduction.

## Validation

The implementation was validated in GitHub Actions run `34578490586` and completed successfully. The successful validation included:

- Gate 1 regression contract.
- Gate 2A payment regression contract.
- Gate 2B / 2B-2 platform-fee regression contract.
- TypeScript typecheck.
- Lint.
- Production build.
- Built-application smoke check.

## Closure decision

The project owner explicitly approved Increment 2B-2 for closure on 2026-09-11.

**Closure disposition:** Accepted and Closed.  
**Merge disposition:** Prepare a controlled pull request into `ani-to-mvp-01`; merge requires separate explicit approval.
