# Ani Market Documentation Governance

## Approved governance package

The following controls are approved and governing for all succeeding Ani Market work:

- **GOV-01** — Artifact 0 is the authoritative detailed Decision Register.
- **GOV-02** — Full approved substance is retained, not summary-only wording.
- **GOV-03** — A formal Decision Traceability Matrix is mandatory.
- **GOV-04** — Decision lifecycle states are: Proposed -> Approved -> Implemented -> Closed -> Merged.
- **GOV-05** — Superseded decisions remain visible with replacement references.
- **GOV-06** — Draw.io diagrams use Decision IDs and concise callouts; Artifact 0 holds full text.
- **GOV-07** — Chunks 9-15 remain Pending Deliberation until separately approved.
- **GOV-08** — Business rules and implementation gates remain separate but cross-linked.
- **GOV-09** — GitHub is the controlled repository for approved artifact sources.
- **GOV-10** — Artifact synchronization is mandatory before every new implementation increment.
- **GOV-11** — Decision IDs are stable and never reused.

## Decision ID convention

- `C1.xx-C7.xx` — approved Chunk decisions for Chunks 1-7.
- `R8.01-R8.15` — approved Chunk 8 rules.
- `DG-xx` — decision, approval and control gates.
- `G2B-2B1`, `G2B-2B2`, etc. — Gate 2B implementation increments.
- `GOV-xx` — documentation and governance controls.

## Mandatory synchronization gate

**DG-11 — Artifact Synchronization Gate:** no new implementation increment begins until affected analysis, requirements, process, data, UX, architecture and editable diagrams are synchronized with the latest accepted/merged baseline.

**DG-12 — Decision Governance Package:** the governance package above is approved and controlling.

## Current implementation baseline

- Gate 1 / Chunks 1-6 — Merged.
- Gate 2A / Chunk 7 — Merged.
- Gate 2B / 2B-1 — Merged through PR #7.
- Gate 2B / 2B-2 — Merged through PR #8.
- Gate 2B / 2B-3 — Pending the synchronization gate.
- Chunks 9-15 — Pending Deliberation.
