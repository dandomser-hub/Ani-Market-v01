import type { DemandStatus, TransactionStatus, PaymentProofStatus, DisputeStatus } from '../types';

type AnyStatus = DemandStatus | TransactionStatus | PaymentProofStatus | DisputeStatus | string;

const statusStyles: Record<string, string> = {
  // Gate 1 Demand lifecycle
  'Draft': 'bg-gray-100 text-gray-600',
  'Submitted for Qualification': 'bg-blue-100 text-blue-700',
  'Needs Correction': 'bg-orange-100 text-orange-700',
  'Open for Offers': 'bg-sky-100 text-sky-700',
  'Offer Window Closed': 'bg-gray-200 text-gray-600',
  'Partially Allocated': 'bg-indigo-100 text-indigo-700',
  'Fully Reserved': 'bg-yellow-100 text-yellow-800',
  'Fully Committed': 'bg-teal-100 text-teal-800',
  'Partially Fulfilled': 'bg-emerald-100 text-emerald-700',
  'Fulfilled': 'bg-green-100 text-green-800',
  'Closed — Accepted Partial Fulfillment': 'bg-slate-100 text-slate-700',
  'Closed — Fulfilled Within Tolerance': 'bg-cyan-100 text-cyan-800',
  'Cancelled': 'bg-red-100 text-red-600',
  'Expired': 'bg-gray-200 text-gray-500',
  'Suspended': 'bg-red-100 text-red-700',

  // Offer lifecycle
  'Active': 'bg-green-100 text-green-700',
  'Selected': 'bg-yellow-100 text-yellow-800',
  'Withdrawn': 'bg-gray-200 text-gray-600',
  'Not Selected': 'bg-gray-100 text-gray-600',

  // Selection / negotiation / Gate 1 transaction lifecycle
  'Pending Supplier Confirmation': 'bg-yellow-100 text-yellow-800',
  'Negotiating': 'bg-violet-100 text-violet-700',
  'Ready for Commitment': 'bg-cyan-100 text-cyan-800',
  'Committed': 'bg-teal-100 text-teal-800',
  'Withdrawn by Buyer': 'bg-gray-200 text-gray-600',
  'Declined by Supplier': 'bg-red-100 text-red-700',
  'Stale': 'bg-orange-100 text-orange-700',
  'Countered': 'bg-violet-100 text-violet-700',
  'Declined': 'bg-red-100 text-red-700',
  'In Fulfillment': 'bg-blue-100 text-blue-700',

  // Legacy Demand / Transaction states retained only for historical prototype records
  'Posted': 'bg-blue-100 text-blue-700',
  'Open': 'bg-sky-100 text-sky-700',
  'Response Received': 'bg-yellow-100 text-yellow-700',
  'Matched': 'bg-green-100 text-green-700',
  'In Transaction': 'bg-teal-100 text-teal-700',
  'Completed': 'bg-emerald-100 text-emerald-700',
  'Disputed': 'bg-orange-100 text-orange-700',
  'Awaiting Payment Proof': 'bg-yellow-100 text-yellow-700',
  'Payment Proof Submitted': 'bg-blue-100 text-blue-700',
  'Payment Proof Accepted': 'bg-green-100 text-green-700',
  'For Delivery': 'bg-purple-100 text-purple-700',
  'Delivered': 'bg-teal-100 text-teal-700',

  // Payment proof
  'Not Submitted': 'bg-gray-100 text-gray-500',
  'Submitted': 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-yellow-100 text-yellow-700',
  'Accepted for Record': 'bg-green-100 text-green-700',
  'Needs Clarification': 'bg-orange-100 text-orange-700',

  // Dispute / verification
  'Need More Evidence': 'bg-orange-100 text-orange-700',
  'Resolved': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-600',
  'Closed': 'bg-gray-200 text-gray-500',
  'Verified': 'bg-green-100 text-green-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Inactive': 'bg-gray-100 text-gray-500',
  'Approved': 'bg-green-100 text-green-700',
  'Accepted': 'bg-green-100 text-green-700',
};

interface Props {
  status: AnyStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const style = statusStyles[status] ?? 'bg-gray-100 text-gray-600';
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${style}`} aria-label={`Status: ${status}`}>
      {status}
    </span>
  );
}
