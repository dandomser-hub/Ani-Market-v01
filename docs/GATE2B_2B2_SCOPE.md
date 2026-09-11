# Gate 2B Increment 2B-2 — Fee Maturity and Due Logic

**Status: Approved for Implementation**  
**Gate:** Gate 2B — Chunk 8 Success-Based Platform Fee Collection  
**Base:** `ani-to-mvp-01` after merged Increment 2B-1  

## Result

Make the established Success-Based Platform Fee mature only when commercial value has been realized and the Supplier has actually confirmed receipt of the corresponding Buyer payment, then assign each matured fee portion an auditable payment deadline without yet collecting the fee or enforcing delinquency.

## Governing controls

- Final Fee Obligation remains based on authoritative Final Transaction Value × locked fee rate.
- Only an authoritative **Supplier-confirmed Buyer receipt** may mature a fee portion.
- Buyer-reported payment evidence alone does not mature a fee.
- Cash/COD recorded by the Supplier as received may mature a fee.
- Fee maturity cannot occur before Final Transaction Value is authoritative.
- Confirmed prepayments remain non-matured until Final Transaction Value is established; maturity then occurs at the FTV establishment point.
- Eligible confirmed Buyer receipts are capped by Final Transaction Value, so Buyer overpayment never increases the fee.
- Buyer refunds do not independently reverse or demature an already matured fee; fee reduction requires the later authoritative Commercial Reversal / adjustment process.
- Each maturity event receives its own immutable due date.
- The standard MVP due period is **seven calendar days**, controlled prospectively by an effective-dated policy.
- A later due-policy change does not alter an existing maturity deadline.
- Partial receipts create proportional fee maturity using a cumulative target calculation to avoid rounding drift.
- Multiple Supplier Transactions remain independent.
- Aging classifications are calculated for Current / Not Overdue, 1–7, 8–30, 31–60, and More Than 60 Days Overdue.
- Duplicate processing of the same authoritative Buyer receipt must not create duplicate maturity.

## Scope boundary

Increment 2B-2 may calculate fee maturity, due dates, obligation maturity states, and aging classifications. It may expose those values read-only in the Transaction workspace and permit prospective due-period policy configuration.

Increment 2B-2 **does not collect the fee or enforce delinquency**. It does not implement Fee Payment References, Supplier fee remittance, Ani Market fee-payment confirmation, payment allocation, billing credits, reminders, restrictions, suspension, waivers, refunds, write-offs, fee disputes, tax documents, accounting export, payment gateway/webhook collection, automatic debit, split settlement, escrow, or deduction of Ani Market fees from Buyer-to-Supplier payments.
