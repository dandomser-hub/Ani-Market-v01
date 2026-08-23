# Ani Market Gate 1 — QA Acceptance Record

Status: **ACCEPTED — Gate 1 implementation closed**  
Scope: Approved Expanded MVP Chunks 1–6 only  
Branch: `feature/gate1-expanded-mvp`  
Baseline: `ani-to-mvp-01` at `1e271fa4983350e9d88730567d0e60229a979c95`

## Control boundary

Gate 1 implements and stabilizes:

1. Participant Trust, Registration & Verification
2. Demand Creation & Qualification
3. Supplier Offer Model
4. Matching / Buyer Selection and Reservation
5. Negotiation & Mutual Commitment
6. Multi-Supplier Fulfillment and Quantity State Management

Chunks 7–15 are not approved implementation scope for this gate. Legacy payment-proof, fee, dispute, and downstream prototype screens may remain for historical reference, but are not authoritative Gate 1 business behavior.

## Automated technical gate

The accepted implementation passed all of the following before formal closure:

- `npm run qa:gate1` — source-level regression contract for approved Chunks 1–6 and scope boundaries
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- production-preview smoke check serving the built application shell

Accepted implementation validation run: GitHub Actions run `32644279527` on implementation head `d2ff3241b80b5d2674b0cb225f2b91e2c0dc4a0d`. The subsequent closure-record commits change only this controlled acceptance record and remain subject to the same branch CI gate.

## Critical scenario review

The following critical scenarios are represented by the approved domain/state paths and protected by the Gate 1 regression contract and CI. This record does not claim full automated browser interaction testing; user-facing interaction remains part of controlled acceptance/usability review.

### Trust and activation

- Registered but unverified Buyer may build profile/draft but cannot create an actionable marketplace Demand.
- Mobile/email verification and per-role marketplace verification are separate gates.
- Buyer and Supplier role verification remain independent for dual-role users.
- Suspended role loses transaction access without erasing verification/history records.
- Only one active role context is used at a time.

### Qualified Demand

- Valid transaction-enabled Buyer Demand qualifies to `Open for Offers`.
- Disabled commodity or service area prevents qualification.
- Approximate, Average, and Range Buyer Target Prices are supported.
- Offer deadline expiry makes the Demand non-actionable.
- Material Demand edit after first Offer is blocked from silent in-place change.
- Demand cancellation requires a reason/history record.

### Offers and Buyer Selection

- Supplier may submit a partial Offer and an independent Offered Price.
- One active Offer per Supplier per Demand is enforced.
- Offer revision creates a new immutable version; withdrawal requires a reason.
- Competing Supplier terms are not exposed to other Suppliers.
- Buyer comparison defaults to Submission Time and supports FCFS batches without automatic winner selection.
- Buyer selects an explicit quantity and a 4/8/12/16/20/24-hour confirmation window.
- Multiple Supplier reservations may coexist while live Demand quantity remains.
- Over-selection and avoidable stranded residual below Buyer minimum are rejected.
- Buyer withdrawal / Supplier decline releases reserved quantity with reason/history.

### Negotiation and Commitment

- Counter-proposals do not reset, extend, or independently increase the Selection reservation.
- Only the current actionable proposal version may be accepted.
- Both parties must accept the same final proposal version before Mutual Commitment.
- Participant transaction eligibility is revalidated at Commitment.
- Negotiated quantity increase is revalidated against live Remaining Quantity before Commitment.
- Mutual Commitment—not Selection—creates the Gate 1 Transaction.
- One Demand may generate multiple Supplier Transactions.
- Transaction commercial terms are stored as an immutable Final Terms Snapshot.
- Full operational contact release occurs only after Commitment.

### Quantity state and fulfillment

- Demand quantity state tracks Requested, Reserved, Active Committed, Fulfilled, Accepted Tolerance Variance, Waived Residual, and Remaining.
- Historical Committed Quantity remains immutable when live Active Committed coverage changes.
- Quantity-state conservation is calculated and surfaced as Balanced / Invariant Error.
- Buyer acceptance distinguishes Presented, Accepted, and Rejected/Unaccepted quantity.
- Buyer Accepted Quantity drives Fulfilled Quantity and Final Transaction Value.
- Under-fulfillment retains outstanding Active Committed quantity during Supplier cure.
- Failed cure releases outstanding quantity back to Remaining without rewriting historical Commitment.
- Excess presented quantity is not automatically fulfillment/value; Accepted Excess requires explicit Buyer adjustment and legitimate outstanding Demand.
- Residual Waiver does not count as physical fulfillment and is available only after active obligations are resolved.
- Configurable tolerance acceptance is represented separately from physical fulfillment.
- Committed Transaction Value remains distinct from Final Transaction Value.

## UX / accessibility stabilization

- Expanded MVP lifecycle states have explicit status-badge styling instead of generic fallback-only presentation.
- Six-state Demand quantity visualization includes text labels and screen-reader summary; meaning is not conveyed by color alone.
- Collapsed sidebar links expose titles; navigation uses `aria-label` / `aria-current` where applicable.
- Admin monitoring uses Gate 1 `Selections & Commitments`; legacy Match records are clearly historical and no longer present the legacy 3% fee as authoritative Gate 1 behavior.
- Legacy payment/proof/fee navigation is explicitly labeled Legacy or Pending Chunk 8.
- Obsolete `ResponseModal` containing one-supplier / non-revisable Response assumptions has been removed.

## Known non-blocking technical debt

`npm ci` / audit continues to report dependency vulnerabilities inherited from the prototype dependency baseline. Dependency hardening is tracked separately and has not been mixed into Gate 1 business-capability changes to avoid unrelated dependency churn during controlled rebaseline implementation.

## Gate decision

**Approved 2026-08-23:** Increment 1E accepted and Gate 1 implementation formally closed.

This approval closes implementation of approved Chunks 1–6 on `feature/gate1-expanded-mvp`. It does **not** merge the branch into `ani-to-mvp-01`. Merge remains a separate explicit controlled decision.

The next rebaseline capability remains **Chunk 7 — Buyer-to-Supplier Payment Model**. Chunks 7–15 remain unresolved and must not be inferred from legacy prototype behavior.
