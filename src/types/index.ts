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
export type RoleRequestStatus = 'Pending' | 'Approved' | 'Rejected';
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

export type TargetPriceType = 'Approximate' | 'Average' | 'Range';

export interface TargetPriceProfile {
  type: TargetPriceType;
  currency: 'PHP';
  unitPrice?: number;
  minimumPrice?: number;
  maximumPrice?: number;
}

export type DemandQualificationStatus = 'Not Evaluated' | 'Qualified' | 'Needs Correction' | 'Suspended';

export interface DemandQualificationCheck {
  key:
    | 'buyer-transaction-enabled'
    | 'commodity-enabled'
    | 'quantity-unit-valid'
    | 'target-price-valid'
    | 'fulfillment-date-valid'
    | 'location-service-area-enabled'
    | 'offer-deadline-valid'
    | 'buyer-seriousness-declared';
  label: string;
  passed: boolean;
  message?: string;
}

export interface DemandQualificationResult {
  status: DemandQualificationStatus;
  evaluatedAt: string;
  checks: DemandQualificationCheck[];
}

export interface DemandEvent {
  id: string;
  demandId: string;
  eventType: 'Created' | 'Draft Saved' | 'Submitted' | 'Qualified' | 'Needs Correction' | 'Cancelled' | 'Expired' | 'Suspended' | 'Reposted';
  actorId: string;
  actorRole: UserRole;
  reason?: string;
  createdAt: string;
}

export type DemandStatus =
  | 'Draft'
  | 'Submitted for Qualification'
  | 'Needs Correction'
  | 'Open for Offers'
  | 'Offer Window Closed'
  | 'Partially Allocated'
  | 'Fully Reserved'
  | 'Fully Committed'
  | 'Partially Fulfilled'
  | 'Fulfilled'
  | 'Closed — Accepted Partial Fulfillment'
  | 'Closed — Fulfilled Within Tolerance'
  | 'Cancelled'
  | 'Expired'
  | 'Suspended'
  // Legacy statuses retained during Gate 1 migration.
  | 'Posted'
  | 'Open'
  | 'Response Received'
  | 'Matched'
  | 'In Transaction'
  | 'Completed'
  | 'Disputed';

export type OfferStatus = 'Draft' | 'Active' | 'Selected' | 'Withdrawn' | 'Expired' | 'Not Selected';
export type OfferEvidenceType = 'Photo' | 'Document' | 'Other';

export interface OfferEvidence {
  id: string;
  type: OfferEvidenceType;
  label: string;
  reference?: string;
}

export interface OfferVersion {
  id: string;
  offerId: string;
  versionNumber: number;
  offeredQuantity: number;
  unit: string;
  offeredPrice: number;
  priceBasis?: string;
  fulfillmentDate: string;
  specificationConfirmation: string;
  specificationVariations?: string;
  remarks?: string;
  evidence: OfferEvidence[];
  validUntil: string;
  changeReason?: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  demandId: string;
  supplierId: string;
  supplierName: string;
  supplierType: SupplierType;
  originalOfferedQuantity: number;
  unit: string;
  currentVersionNumber: number;
  status: OfferStatus;
  submittedAt: string;
  updatedAt?: string;
  withdrawnAt?: string;
  withdrawalReason?: string;
  legacyResponseId?: string;
}

export type OfferEventType = 'Submitted' | 'Revised' | 'Withdrawn' | 'Expired' | 'Selected' | 'Selection Released' | 'Committed';

export interface OfferEvent {
  id: string;
  offerId: string;
  demandId: string;
  supplierId: string;
  eventType: OfferEventType;
  versionNumber?: number;
  reason?: string;
  actorId: string;
  actorRole: UserRole;
  createdAt: string;
}

export type SelectionStatus =
  | 'Pending Supplier Confirmation'
  | 'Negotiating'
  | 'Ready for Commitment'
  | 'Committed'
  | 'Withdrawn by Buyer'
  | 'Declined by Supplier'
  | 'Expired';

export interface SelectedAllocation {
  id: string;
  demandId: string;
  offerId: string;
  offerVersionNumber: number;
  buyerId: string;
  supplierId: string;
  selectedQuantity: number;
  unit: string;
  confirmationWindowHours: 4 | 8 | 12 | 16 | 20 | 24;
  selectedAt: string;
  reservationExpiresAt: string;
  status: SelectionStatus;
  negotiationThreadId?: string;
  transactionId?: string;
  buyerWithdrawalReason?: string;
  supplierDeclineReason?: string;
  releasedAt?: string;
}

export interface SelectionEvent {
  id: string;
  selectionId: string;
  demandId: string;
  offerId: string;
  eventType:
    | 'Selected'
    | 'Buyer Withdrawn'
    | 'Supplier Declined'
    | 'Expired'
    | 'Negotiation Started'
    | 'Supplier Confirmed'
    | 'Ready for Commitment'
    | 'Committed';
  reason?: string;
  actorId: string;
  actorRole: UserRole;
  createdAt: string;
}

export type NegotiationStatus = 'Active' | 'Committed' | 'Declined' | 'Expired' | 'Stale';
export type NegotiationProposalStatus = 'Pending' | 'Accepted' | 'Countered' | 'Declined' | 'Expired';

export interface NegotiationThread {
  id: string;
  selectionId: string;
  demandId: string;
  offerId: string;
  buyerId: string;
  supplierId: string;
  status: NegotiationStatus;
  currentProposalVersion: number;
  createdAt: string;
  updatedAt?: string;
  committedAt?: string;
}

export interface NegotiationProposal {
  id: string;
  threadId: string;
  versionNumber: number;
  proposedById: string;
  proposedByRole: MarketplaceRole;
  quantity: number;
  unit: string;
  unitPrice: number;
  fulfillmentDate: string;
  specificationVariations?: string;
  remarks?: string;
  status: NegotiationProposalStatus;
  createdAt: string;
}

export interface CommitmentAcceptance {
  id: string;
  threadId: string;
  proposalVersion: number;
  actorId: string;
  actorRole: MarketplaceRole;
  acceptanceSource: 'Buyer Selection' | 'Explicit Acceptance' | 'Supplier Confirmation';
  acceptedAt: string;
}

export interface FinalTermsSnapshot {
  buyerId: string;
  buyerName: string;
  supplierId: string;
  supplierName: string;
  supplierType: SupplierType;
  cropName: string;
  cropCategory: string;
  variety: string;
  specification: string;
  specificationVariations?: string;
  committedQuantity: number;
  unit: string;
  agreedTransactionPrice: number;
  committedTransactionValue: number;
  fulfillmentMethod: 'Delivery' | 'Pickup' | 'Either';
  fulfillmentLocation: string;
  fulfillmentDate: string;
  fulfillmentWindowEnd?: string;
  negotiationProposalVersion: number;
  offerVersionNumber: number;
  committedAt: string;
}

export type Gate1TransactionStatus =
  | 'Committed'
  | 'In Fulfillment'
  | 'Partially Fulfilled'
  | 'Fulfilled'
  | 'Completed'
  | 'Cancelled'
  | 'Disputed';

export interface Gate1Transaction {
  id: string;
  transactionReference: string;
  demandId: string;
  offerId: string;
  selectionId: string;
  negotiationThreadId: string;
  buyerId: string;
  supplierId: string;
  finalTerms: FinalTermsSnapshot;
  historicalCommittedQuantity: number;
  activeCommittedQuantity: number;
  presentedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  acceptedExcessQuantity: number;
  releasedShortfallQuantity: number;
  committedTransactionValue: number;
  finalTransactionValue: number;
  operationalContactReleased: boolean;
  status: Gate1TransactionStatus;
  committedAt: string;
  updatedAt?: string;
}

export interface FulfillmentRecord {
  id: string;
  transactionId: string;
  presentedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  remarks?: string;
  actorId: string;
  createdAt: string;
}

export interface AcceptedExcessAdjustment {
  id: string;
  transactionId: string;
  quantity: number;
  unitPrice: number;
  reason: string;
  buyerId: string;
  createdAt: string;
}

export interface DemandResidualWaiver {
  id: string;
  demandId: string;
  quantity: number;
  reason: string;
  buyerId: string;
  createdAt: string;
}

export interface DemandToleranceAcceptance {
  id: string;
  demandId: string;
  quantity: number;
  toleranceLimitQuantity: number;
  reason: string;
  buyerId: string;
  createdAt: string;
}

export interface DemandQuantityState {
  demandId: string;
  requestedQuantity: number;
  historicalCommittedQuantity: number;
  reservedQuantity: number;
  activeCommittedQuantity: number;
  fulfilledQuantity: number;
  acceptedToleranceVariance: number;
  waivedResidual: number;
  remainingQuantity: number;
  conservationTotal: number;
  balanced: boolean;
}

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

  accountVerification?: AccountVerificationState;
  roleVerifications?: Partial<Record<MarketplaceRole, RoleVerificationState>>;
  buyerProfile?: BuyerProfile;
  supplierProfile?: SupplierProfile;
  roleContext?: RoleContext;
  roleRequests?: Partial<Record<MarketplaceRole, RoleRequestStatus>>;
  onboardingProgress?: { buyer?: string; supplier?: string };
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

  /** Legacy representative price retained for old UI/data until migrated. */
  targetPrice: number;
  targetPriceProfile?: TargetPriceProfile;

  minimumSupplierQuantity?: number;
  deliveryPreference: 'Delivery' | 'Pickup' | 'Either';
  location: string;
  province: string;
  municipality?: string;
  serviceAreaId?: string;
  requiredDate: string;
  fulfillmentWindowEnd?: string;
  expirationDate: string;
  qualitySpecs: string;
  notes: string;
  buyerSeriousnessDeclared?: boolean;
  qualification?: DemandQualificationResult;
  materialTermsLocked?: boolean;
  cancellationReason?: string;
  status: DemandStatus;
  createdAt: string;
  updatedAt?: string;
  responseCount: number;
}

/** Legacy response model retained only while old mock transactions are being migrated. */
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

/** Legacy transaction model retained for historical prototype records only. */
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

export interface ServiceArea {
  id: string;
  province: string;
  municipalities: string[];
  active: boolean;
}

export interface AppState {
  currentUser: User | null;
  currentRole: UserRole;
  setCurrentUser: (user: User | null) => void;
  setCurrentRole: (role: UserRole) => void;
}
