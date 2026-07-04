export type UserRole = 'buyer' | 'supplier' | 'admin';

export type SupplierType = 'individual_farmer' | 'cooperative' | 'organized_supplier' | 'aggregator';

export type DemandStatus =
  | 'Draft'
  | 'Posted'
  | 'Open'
  | 'Response Received'
  | 'Matched'
  | 'In Transaction'
  | 'Completed'
  | 'Cancelled'
  | 'Disputed'
  | 'Expired';

export type TransactionStatus =
  | 'Matched'
  | 'Awaiting Payment Proof'
  | 'Payment Proof Submitted'
  | 'Payment Proof Accepted'
  | 'For Delivery'
  | 'Delivered'
  | 'Completed'
  | 'Disputed'
  | 'Cancelled';

export type PaymentProofStatus =
  | 'Not Submitted'
  | 'Submitted'
  | 'Under Review'
  | 'Accepted for Record'
  | 'Needs Clarification'
  | 'Disputed';

export type DisputeStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Need More Evidence'
  | 'Resolved'
  | 'Rejected'
  | 'Closed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  supplierType?: SupplierType;
  municipality: string;
  province: string;
  contactNumber: string;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  accountStatus: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  additionalRoleRequest?: string;
  additionalRoleStatus?: 'Pending' | 'Approved' | 'Rejected';
}

export interface DemandPost {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerType: string;
  cropName: string;
  cropCategory: string;
  variety: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  deliveryPreference: 'Delivery' | 'Pickup' | 'Either';
  location: string;
  province: string;
  requiredDate: string;
  expirationDate: string;
  qualitySpecs: string;
  notes: string;
  status: DemandStatus;
  createdAt: string;
  responseCount: number;
}

export interface SupplierResponse {
  id: string;
  demandId: string;
  supplierId: string;
  supplierName: string;
  supplierType: SupplierType;
  availableQuantity: number;
  unit: string;
  offeredPrice: number;
  fulfillmentDate: string;
  pickupDeliveryNote: string;
  qualityConfirmation: string;
  remarks: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Matched';
  createdAt: string;
}

export interface Transaction {
  id: string;
  demandId: string;
  responseId: string;
  buyerId: string;
  buyerName: string;
  supplierId: string;
  supplierName: string;
  supplierType: SupplierType;
  cropName: string;
  quantity: number;
  unit: string;
  agreedPrice: number;
  totalAmount: number;
  platformFeeRate: number;
  platformFeeAmount: number;
  status: TransactionStatus;
  paymentProofStatus: PaymentProofStatus;
  createdAt: string;
  matchedAt: string;
  notes: string;
}

export interface Dispute {
  id: string;
  transactionId: string;
  raisedById: string;
  raisedByName: string;
  disputeType: string;
  description: string;
  evidenceUploaded: boolean;
  status: DisputeStatus;
  adminNotes: string;
  createdAt: string;
}

export interface CropCatalogItem {
  id: string;
  name: string;
  category: string;
  variety: string;
  unit: string;
  active: boolean;
  notes: string;
}

export interface AppState {
  currentUser: User | null;
  currentRole: UserRole;
  setCurrentUser: (user: User | null) => void;
  setCurrentRole: (role: UserRole) => void;
}
