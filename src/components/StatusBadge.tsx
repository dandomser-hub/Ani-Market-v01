import type { DemandStatus, TransactionStatus, PaymentProofStatus, DisputeStatus } from '../types';

type AnyStatus = DemandStatus | TransactionStatus | PaymentProofStatus | DisputeStatus | string;

const statusStyles: Record<string, string> = {
  // Demand
  'Draft': 'bg-gray-100 text-gray-600',
  'Posted': 'bg-blue-100 text-blue-700',
  'Open': 'bg-sky-100 text-sky-700',
  'Response Received': 'bg-yellow-100 text-yellow-700',
  'Matched': 'bg-green-100 text-green-700',
  'In Transaction': 'bg-teal-100 text-teal-700',
  'Completed': 'bg-emerald-100 text-emerald-700',
  'Cancelled': 'bg-red-100 text-red-600',
  'Disputed': 'bg-orange-100 text-orange-700',
  'Expired': 'bg-gray-200 text-gray-500',
  // Transaction
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
  // Dispute
  'Need More Evidence': 'bg-orange-100 text-orange-700',
  'Resolved': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-600',
  'Closed': 'bg-gray-200 text-gray-500',
  // User
  'Verified': 'bg-green-100 text-green-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Active': 'bg-green-100 text-green-700',
  'Inactive': 'bg-gray-100 text-gray-500',
  'Suspended': 'bg-red-100 text-red-600',
  'Approved': 'bg-green-100 text-green-700',
  // Response
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
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${style}`}>
      {status}
    </span>
  );
}
