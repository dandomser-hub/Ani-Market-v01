# Ani Market Gate 2A — Buyer-to-Supplier Payment & Reconciliation QA Record

Status: **Controlled-review candidate**  
Scope: Accepted Chunk 7 only  
Branch: `feature/gate2a-buyer-supplier-payment`  
Base: `ani-to-mvp-01` at `563567373664574907654d350beb5b41f8089561`

## Implemented scope

Gate 2A implements the accepted non-custodial Buyer-to-Supplier Payment Model:

- versioned bilateral Payment Terms snapshots and amendments
- external payment methods: Bank Transfer, GCash, Maya, QR Ph, Cash/COD, Check, Other External Method
- Full Prepayment, Payment on Buyer Acceptance, COD, Advance + Balance, Staged/Milestone, Credit Terms, and Other Agreed Arrangement
- Buyer Reported Payment Sent
- Supplier Confirmed Received as the authoritative Ani Market receipt event
- Supplier direct Cash/COD Received recording
- multiple/partial payment records
- Buyer withdrawal of unconfirmed payment reports with reason/history
- Supplier payment issue flag for later Chunk 11 resolution
- separate Supplier-to-Buyer Refund Records
- Buyer Confirmed Refund Received
- Expected Payment, Final Payable, Confirmed Paid, Confirmed Refunds, Net Confirmed Paid, Outstanding, Overpayment, Refund Due
- separate Expected-vs-Final reconciliation basis while fulfillment is still active
- admin evidence review without receipt-confirmation authority
- private transaction-linked prototype ledger storage and audit events
- explicit Chunk 8 and Chunk 11 boundaries

## Non-custodial control

Ani Market does not receive, hold, settle, release, or custody Buyer-to-Supplier funds. Payment records describe external settlement activity between Buyer and Supplier. Supplier confirmation is the authoritative platform acknowledgment of receipt; it is not Ani Market certification of bank settlement.

## Critical scenarios represented

1. Payment cannot be recorded before Buyer and Supplier agree on the same Payment Terms version.
2. Either transaction participant may propose a Payment Terms version; proposer acceptance is recorded automatically, and the other party must accept the same version.
3. An accepted amendment supersedes the prior agreed terms without rewriting its history.
4. Buyer can report multiple external payments; unconfirmed reports do not count as Confirmed Paid.
5. Supplier confirmation makes a payment immutable and adds it to Confirmed Paid.
6. Buyer may withdraw only an unconfirmed payment report, with a mandatory reason and audit event.
7. Supplier may flag an unconfirmed Buyer-reported payment as not received/mismatched; full dispute resolution is deferred to Chunk 11.
8. Supplier may directly record Cash/COD actually received; the record is immediately Supplier Confirmed Received.
9. Final Payable remains distinct from Expected Payment; while Active Committed quantity remains, reconciliation uses Expected Payment as the working target.
10. When Active Committed quantity reaches zero, reconciliation switches to Final Payable based on Chunk 6 Final Transaction Value.
11. Multiple confirmed payments and Buyer-confirmed refunds produce Net Confirmed Paid.
12. Outstanding = max(0, target − Net Confirmed Paid).
13. Overpayment / Refund Due = max(0, Net Confirmed Paid − target).
14. Supplier refund reports do not reduce Net Confirmed Paid until Buyer confirms refund received.
15. Admin can mark evidence Reviewed for Record / Needs Clarification but cannot confirm receipt of funds for the Supplier.
16. Active Buyer/Supplier navigation uses Payments & Reconciliation rather than the legacy Payment Proof flow.
17. Chunk 8 fee computation/collection is absent from the Gate 2A payment engine and active payment center.

## Automated technical gate

The Gate 2A CI workflow must pass:

- `npm run qa:gate1`
- `npm run qa:gate2a`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- production-preview built-app smoke check

Successful implementation validation: GitHub Actions run `33377520456` on head `c62eac78dfb9719ade0490d6b31d4e17b219ed35`.

## Known non-blocking technical debt

`npm ci` continues to report inherited prototype dependency vulnerabilities (20 total in the current baseline at validation time). Dependency hardening remains separately tracked so it is not mixed with the controlled Chunk 7 business rebaseline.

## Explicit exclusions

- Success-Based Platform Fee trigger, due date, collection, reconciliation, and enforcement — **Chunk 8**
- detailed payment dispute/arbitration resolution — **Chunk 11**
- bank API settlement certification, wallet, escrow, stored value, Ani Market fund custody — **not MVP Gate 2A**

## Gate decision

Gate 2A may be accepted after controlled review of the implemented Buyer/Supplier/Admin workflow. Acceptance does not merge the branch into `ani-to-mvp-01`; merge remains a separate explicit decision.
