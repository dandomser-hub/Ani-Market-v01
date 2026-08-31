# Ani Market — Chunk 7 Buyer-to-Supplier Payment Model

Status: **ACCEPTED / LOCKED**  
Implementation Gate: **Gate 2A — Buyer-to-Supplier Payment & Reconciliation**  
Base branch: `ani-to-mvp-01`  
Base commit: `563567373664574907654d350beb5b41f8089561`

## Governing boundary

Ani Market is a non-custodial marketplace facilitator. In MVP/early implementation, Ani Market does not receive, hold, settle, release, or custody Buyer-to-Supplier funds. Buyer and Supplier settle externally. Ani Market records agreed payment terms, payment/refund evidence, receiving-party acknowledgments, and reconciliation states.

Chunk 8 Success-Based Platform Fee collection is explicitly outside Gate 2A.

## Locked business rules

1. Use a Payment Record / Evidence Ledger, not wallet or escrow.
2. One Transaction may have multiple Payment Records and multiple Refund Records.
3. Payment terms are bilateral and may support full prepayment, payment on acceptance, COD, advance + balance, staged payment, credit terms, or another agreed arrangement.
4. Distinguish Expected/Committed Payment Amount, Final Payable Amount, Confirmed Paid Amount, Outstanding Balance, and Overpayment.
5. Buyer evidence means **Buyer Reported Payment Sent**, not bank-certified settlement.
6. Supplier confirmation is the authoritative Ani Market event for counting Buyer-to-Supplier funds as **Supplier Confirmed Received**.
7. For cash/COD, Supplier may directly record cash received.
8. Partial and multiple payments are supported.
9. Final Payable ordinarily derives from Chunk 6 Final Transaction Value.
10. Overpayment creates Refund Due; original payment records are not rewritten.
11. Refunds are separate Supplier-to-Buyer records and require Buyer receipt confirmation.
12. Confirmed monetary records are immutable; corrections use reversal/adjustment/refund records.
13. Unconfirmed Buyer-reported payments may be withdrawn only with a reason and audit history.
14. Payment evidence is private to Buyer, Supplier, and authorized Admin.
15. Admin may inspect evidence and facilitate issues, but normal receipt confirmation belongs to the receiving party.
16. Actual payment method may differ from the preferred method; material timing/obligation changes require a bilateral Payment Terms Amendment record.
17. Payment activity may occur before, during, or after fulfillment.
18. Detailed payment disputes are deferred to Chunk 11.
19. Ani Market must not use custodial wording such as funds received by Ani Market, secured funds, wallet balance, settlement, or release to Supplier.
20. Chunk 8 fee collection remains separate; Gate 2A may expose only a future fee-basis boundary based on Final Transaction Value.

## Reconciliation equations

- Expected Payment Amount = Committed Transaction Value
- Final Payable Amount = Final Transaction Value, unless a later approved adjustment applies
- Net Confirmed Paid = Supplier-confirmed Buyer-to-Supplier Payments − Buyer-confirmed Supplier-to-Buyer Refunds
- Outstanding Balance = max(0, Final Payable Amount − Net Confirmed Paid)
- Overpayment = max(0, Net Confirmed Paid − Final Payable Amount)

## Gate 2A implementation workstreams

### 2A-1 Domain Foundation
PaymentTermsSnapshot, PaymentSchedule, PaymentRecord, RefundRecord, PaymentEvent, PaymentReconciliation.

### 2A-2 Commitment Integration
Capture agreed payment terms in the immutable Transaction terms/snapshot without reopening Chunk 5 commercial rules.

### 2A-3 Buyer/Supplier Workflow
Buyer Reports Payment Sent → Supplier Confirms Received / Reports Issue; Supplier direct Cash Received path.

### 2A-4 Reconciliation
Expected, Final Payable, Confirmed Paid, Outstanding, Overpayment, Refund Due, multiple/partial payments.

### 2A-5 Admin & QA
Evidence review without receipt-confirmation authority; privacy, audit history, regression controls, responsive/accessibility stabilization.

## Legacy conflicts to replace

- Legacy single `PaymentProofStatus` as the transaction payment model.
- Legacy Supplier-side proof submission for Buyer-to-Supplier payment.
- Legacy linear payment-proof transaction timeline.
- Legacy Admin proof acceptance being confused with receipt confirmation.
- Any legacy platform-fee computation inside the active Gate 2A payment workflow.
