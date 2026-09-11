# Ani Market Chunk 8 — Success-Based Platform Fee Collection Baseline

Status: **ACCEPTED BUSINESS-RULE BASELINE**  
Gate: **Gate 2B**  
Scope: Rules 8.1–8.15  
Standard MVP fee rate: **3.00%**

## Governing model

Ani Market maintains two separate financial flows:

1. **Buyer → Supplier** — commercial payment recorded under Chunk 7. Ani Market does not receive, hold, settle, release, or custody these funds.
2. **Supplier → Ani Market** — Success-Based Platform Fee payment under Chunk 8.

The Success-Based Platform Fee is assessed per Supplier Transaction. The Supplier is the sole fee obligor in the MVP.

## Accepted Rules 8.1–8.15

### 8.1 Fee obligation and calculation basis

Success-Based Platform Fee = **Final Transaction Value × Applicable Platform Fee Rate**.

Only Buyer-accepted commercial value is fee-bearing. Rejected, unaccepted, waived, unfulfilled, reserved, merely committed, released-shortfall, or tolerance-forgiven quantity does not itself generate a fee. Validly accepted excess is fee-bearing only when included in Final Transaction Value. A zero Final Transaction Value produces a zero fee.

### 8.2 Fee obligor

The selling Supplier entity represented in the Transaction is the sole obligor. Buyers are not charged the Success-Based Platform Fee in the MVP. Obligations remain transaction-level even when Supplier billing is aggregated.

### 8.3 Fee rate and configuration

The standard MVP rate is **3.00%**. The rate is centrally configurable through an authorized, effective-dated schedule and is not hard-coded into transaction logic. The applicable rate is immutably snapshotted at Mutual Commitment. Changes are prospective. Final fee amounts are rounded to two decimal places.

### 8.4 When the fee becomes due

The rate is locked at Mutual Commitment. The final fee obligation is established only when Final Transaction Value is determined. Fee portions mature only to the extent the Supplier has confirmed corresponding Buyer-to-Supplier receipt. Buyer-reported evidence alone does not mature the fee. The standard payment period is seven calendar days, prospectively configurable.

### 8.5 Supplier payment to Ani Market

The Supplier pays Ani Market directly through authorized external collection channels. Platform Fee Payment records and allocations are separate from the Buyer-to-Supplier Payment Ledger. Full, partial, and consolidated fee payments are supported. Settlement occurs only when Ani Market confirms actual receipt.

### 8.6 Platform Fee Ledger and Supplier Billing

Ani Market maintains a transaction-level Platform Fee Ledger and Supplier Billing workspace. Original assessments and confirmed financial events are append-only and auditable. Aggregated billing does not merge underlying obligations. Overpayments are billing credits, not wallet balances.

### 8.7 Multiple Suppliers and Transactions

Each committed Supplier Transaction is an independent fee-bearing commercial unit with its own rate snapshot, Final Transaction Value, obligation, maturity, payment, credit, adjustment, status, and history.

### 8.8 Partial fulfillment, tolerance, waiver, accepted excess

Chunk 8 consumes the authoritative Final Transaction Value from the fulfillment engine and does not independently recompute accepted quantity. Accepted fulfilled value and valid accepted excess are fee-bearing. Rejected, unaccepted, released-shortfall, reserved, committed-only, waived-residual, and tolerance-only quantities are not.

### 8.9 Cancellation and commercial reversal

Cancellation before realized Buyer-accepted value produces no fee. Partial fulfillment before cancellation remains fee-bearing to the extent represented in Final Transaction Value. Post-fulfillment cancellation labels or private refunds do not automatically reverse the fee. Only an authoritative Commercial Reversal Event may reduce recognized fee-bearing value, through auditable adjustment/credit events rather than deletion.

### 8.10 Fee-payment evidence and Ani Market confirmation

Supplier evidence creates **Supplier Reported Fee Payment Sent** but does not settle an obligation. Only authorized Ani Market confirmation of actual receipt reduces the balance. Duplicate-reference controls, confirmed-amount allocation, immutability, and auditable correction events are required.

### 8.11 Unpaid and overdue fees

Matured unpaid portions become overdue after the configured payment period. Enforcement is progressive: reminders, warnings, restriction of new Supplier commercial activity, then Supplier-role suspension for prolonged material delinquency. Existing committed Transactions remain operable. Pending confirmation pauses enforcement for the reported amount. Partial payments do not reset original aging. No late-interest or finance-charge mechanism is included in the MVP.

### 8.12 Adjustments, waivers, credits, refunds, authority

Corrections, adjustments, waivers, credits, reversals, reallocations, refunds, and write-offs are distinct append-only events. Billing personnel do not alter authoritative fulfillment or Final Transaction Value. Financial permissions are role- and authority-based, with reason codes, evidence, monetary thresholds, and maker-checker controls for material actions.

### 8.13 Platform Fee disputes

Supplier↔Ani Market fee disputes are separate from Buyer↔Supplier commercial disputes. A formally accepted fee dispute pauses automated enforcement only for the disputed amount. The ordinary filing period is thirty calendar days, subject to exceptional review for manifest error, fraud, duplicate charging, or newly available material evidence. Financial corrections are posted through Rule 8.12 mechanisms.

### 8.14 Accounting, tax documentation, and official billing boundary

Ani Market treats the Success-Based Platform Fee—not the underlying Buyer-to-Supplier Transaction Value—as its own marketplace receivable/revenue-related amount. Platform Fee Statements, payment acknowledgments, and statutory tax documents remain distinct. Tax-document type, trigger, numbering, tax treatment, and required fields are configurable and must be validated against applicable Philippine accounting and tax requirements before production deployment. Ani Market maintains a fee subledger, not a full general ledger.

### 8.15 Future automated collection

The MVP retains controlled manual/external Supplier-to-Ani Market collection. Architecture remains ready for future provider-independent automated fee collection. Automation must not alter Supplier liability, fee calculation rules, the Platform Fee Ledger, or the non-custodial Buyer-to-Supplier model. Any future split-payment, escrow-like, merchant-of-record, or Buyer-payment interception model requires a separate formal approval gate.

## Gate 2B Increment 2B-1 boundary

Increment 2B-1 implements only the Platform Fee domain foundation: effective-dated rate schedule, immutable rate snapshot at Mutual Commitment, transaction-level Supplier obligation shell, Final Transaction Value fee assessment, and append-only Rate Locked / Fee Assessed events.

Fee maturity, due dates, collection, billing workspace, payment confirmation, overdue enforcement, adjustments, disputes, tax-document processing, and gateway integration remain deferred to later Gate 2B increments.
