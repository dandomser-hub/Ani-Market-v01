export type UserRole = 'buyer' | 'supplier' | 'admin';

export type MarketplaceRole = Exclude<UserRole, 'admin'>;

export type SupplierType = 'individual_farmer' | 'cooperative' | 'organized_supplier' | 'aggregator';

export type AccountStatus = 'Active' | 'Inactive' | 'Suspended';

export type VerificationStatus =
  | 'Not Submitted'
  | 'Pending Review'
  | 'Needs Information'
  | 'Verified'
  | 'Rejected'
  | 'Suspended';

export type VerificationChannelStatus = 'Unverified' | 'Pending' | 'Verified';

export type ProfileCompletenessStatus = 'Not Started' | 'In Progress' | 'Complete';

export type TransactionAccessStatus = 'Disabled' | 'Enabled' | 'Suspended';

export type LegacyVerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface AccountVerificationState {
  emailStatus: VerificationChannelStatus;
  mobileStatus: VerificationChannelStatus;
  emailVerifiedAt?: string;
  mobileVerifiedAt?: string;
}

export interface RoleVerificationState {
  role: MarketplaceRole;
  profileCompleteness: ProfileCompletenessStatus;
  marketplaceVerificationStatus: VerificationStatus;
  transactionAccessStatus: TransactionAccessStatus;
  submittedAt?: string;
  reviewedAt?: string;
  verifiedAt?: string;
  suspendedAt?: string;
  decisionReason?: string;
}

export interface VerificationRecord {
  id: string;
  userId: string;
  role: MarketplaceRole;
  fromStatus?: VerificationStatus;
  toStatus: VerificationStatus;
  eventType: 'Submitted' | 'Needs Information' | 'Verified' | 'Rejected' | 'Suspended' | 'Reinstated';
  reason?: string;
  notes?: string;
  actorId: string;
  actorRole: UserRole;
  createdAt: string;
}

export interface BuyerProfile {
  userId: string;
  businessType?: string;
  organizationName?: string;
  authorizedRepresentative?: string;
  procurementAddress?: string;
  procurementNotes?: string;
}

export interface SupplierProfile {
  userId: string;
  supplierType?: SupplierType;
  farmOrOrganizationName?: string;
  operatingLocation?: string;
  cropInterests?: string[];
  availabilityNotes?: string;
}

export interface RoleContext {
  activeRole: UserRole;
  availableRoles: UserRole[];
}

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

  /** Legacy field retained during Gate 1 migration. */
  verificationStatus: LegacyVerificationStatus;
  accountStatus: AccountStatus;
  createdAt: string;
  additionalRoleRequest?: MarketplaceRole;
  additionalRoleStatus?: 'Pending' | 'Approved' | 'Rejected';

  /** Gate 1 trust/verification model. Optional until mock data is migrated. */
  accountVerification?: AccountVerificationState;
  roleVerifications?: Partial<Record<MarketplaceRole, RoleVerificationState>>;
  buyerProfile?: BuyerProfile;
  supplierProfile?: SupplierProfile;
  roleContext?: RoleContext;
  onboardingProgress?: {
    buyer?: string;
    supplier?: string;
  };
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
