import { getDemandQuantityState } from '../data/gate1CommerceData';

interface Props {
  demandId: string;
  unit: string;
  compact?: boolean;
}

export default function DemandQuantityProgress({ demandId, unit, compact = false }: Props) {
  const state = getDemandQuantityState(demandId);
  const requested = state.requestedQuantity || 1;
  const segments = [
    { key: 'fulfilled', label: 'Fulfilled / Accepted', value: state.fulfilledQuantity, className: 'bg-green-500' },
    { key: 'committed', label: 'Active Committed', value: state.activeCommittedQuantity, className: 'bg-teal-500' },
    { key: 'reserved', label: 'Reserved', value: state.reservedQuantity, className: 'bg-yellow-400' },
    { key: 'tolerance', label: 'Accepted Tolerance Variance', value: state.acceptedToleranceVariance, className: 'bg-cyan-400' },
    { key: 'waived', label: 'Waived Residual', value: state.waivedResidual, className: 'bg-gray-400' },
    { key: 'remaining', label: 'Remaining', value: state.remainingQuantity, className: 'bg-amber-500' },
  ];

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Demand Quantity State</div>
          <div className="text-sm font-semibold text-gray-900">{state.requestedQuantity.toLocaleString()} {unit} requested</div>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${state.balanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {state.balanced ? 'Balanced' : 'Invariant Error'}
        </span>
      </div>

      <div className="flex h-4 w-full overflow-hidden rounded-full border border-gray-200 bg-gray-100" aria-label="Demand quantity allocation progress">
        {segments.map(segment => segment.value > 0 ? (
          <div
            key={segment.key}
            className={`${segment.className} h-full`}
            style={{ width: `${Math.max(0, Math.min(100, segment.value / requested * 100))}%` }}
            title={`${segment.label}: ${segment.value.toLocaleString()} ${unit}`}
          />
        ) : null)}
      </div>

      <div className={`grid gap-2 ${compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'}`}>
        {segments.map(segment => (
          <div key={segment.key} className="rounded-lg border border-gray-100 bg-gray-50 p-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className={`inline-block h-2.5 w-2.5 rounded-sm ${segment.className}`} />{segment.label}</div>
            <div className="mt-0.5 text-sm font-semibold text-gray-900">{segment.value.toLocaleString()} {unit}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">Requested = Fulfilled + Active Committed + Reserved + Accepted Tolerance Variance + Waived Residual + Remaining.</p>
    </div>
  );
}
