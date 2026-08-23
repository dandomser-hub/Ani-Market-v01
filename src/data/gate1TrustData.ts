import type { MarketplaceRole, User, VerificationRecord } from '../types';

export type Gate1TrustState = Pick<User, 'accountVerification' | 'roleVerifications' | 'buyerProfile' | 'supplierProfile' | 'roleContext' | 'onboardingProgress'>;

const TRUST_STORAGE_KEY = 'ani-market-gate1-trust-overrides';
const VERIFICATION_RECORD_STORAGE_KEY = 'ani-market-gate1-verification-records';

const verifiedAccount = {
  emailStatus: 'Verified' as const,
  mobileStatus: 'Verified' as const,
  emailVerifiedAt: '2026-08-23T10:00:00+08:00',
  mobileVerifiedAt: '2026-08-23T10:05:00+08:00',
};

const enabledRole = (role: MarketplaceRole) => ({
  role,
  profileCompleteness: 'Complete' as const,
  marketplaceVerificationStatus: 'Verified' as const,
  transactionAccessStatus: 'Enabled' as const,
  submittedAt: '2026-08-20T09:00:00+08:00',
  reviewedAt: '2026-08-20T11:00:00+08:00',
  verifiedAt: '2026-08-20T11:00:00+08:00',
});

const pendingRole = (role: MarketplaceRole) => ({
  role,
  profileCompleteness: 'Complete' as const,
  marketplaceVerificationStatus: 'Pending Review' as const,
  transactionAccessStatus: 'Disabled' as const,
  submittedAt: '2026-08-22T14:00:00+08:00',
});

export const gate1TrustStates: Record<string, Gate1TrustState> = {
  u1: {
    accountVerification: verifiedAccount,
    roleVerifications: { buyer: enabledRole('buyer') },
    buyerProfile: {
      userId: 'u1',
      organizationName: 'Naga Valley Rice Mill',
      businessType: 'Rice Mill',
      authorizedRepresentative: 'Procurement Officer',
      procurementAddress: 'Naga City, Camarines Sur',
    },
    roleContext: { activeRole: 'buyer', availableRoles: ['buyer'] },
    onboardingProgress: { buyer: 'Complete' },
  },
  u2: {
    accountVerification: verifiedAccount,
    roleVerifications: { supplier: enabledRole('supplier') },
    supplierProfile: {
      userId: 'u2',
      supplierType: 'cooperative',
      farmOrOrganizationName: 'Polangui Farmers Association',
      operatingLocation: 'Polangui, Albay',
      cropInterests: ['Rice', 'Abaca', 'Other Crops'],
    },
    roleContext: { activeRole: 'supplier', availableRoles: ['supplier'] },
    onboardingProgress: { supplier: 'Complete' },
  },
  u3: {
    accountVerification: verifiedAccount,
    roleVerifications: { supplier: enabledRole('supplier') },
    supplierProfile: {
      userId: 'u3',
      supplierType: 'individual_farmer',
      farmOrOrganizationName: 'Pedro Santos Farm',
      operatingLocation: 'Nabua, Camarines Sur',
      cropInterests: ['Rice'],
    },
    roleContext: { activeRole: 'supplier', availableRoles: ['supplier'] },
    onboardingProgress: { supplier: 'Complete' },
  },
  u4: {
    accountVerification: verifiedAccount,
    roleVerifications: { buyer: enabledRole('buyer') },
    buyerProfile: {
      userId: 'u4',
      organizationName: 'Bicol Agri Trading Corp.',
      businessType: 'Agri Enterprise',
      authorizedRepresentative: 'Procurement Manager',
      procurementAddress: 'Legazpi City, Albay',
    },
    roleContext: { activeRole: 'buyer', availableRoles: ['buyer'] },
    onboardingProgress: { buyer: 'Complete' },
  },
  u5: {
    accountVerification: verifiedAccount,
    roleVerifications: { supplier: pendingRole('supplier') },
    supplierProfile: {
      userId: 'u5',
      supplierType: 'cooperative',
      farmOrOrganizationName: 'Daet Coconut Cooperative',
      operatingLocation: 'Daet, Camarines Norte',
      cropInterests: ['Coconut'],
    },
    roleContext: { activeRole: 'supplier', availableRoles: ['supplier'] },
    onboardingProgress: { supplier: 'Submitted for Verification' },
  },
  u6: {
    accountVerification: verifiedAccount,
    roleVerifications: {
      supplier: enabledRole('supplier'),
      buyer: {
        role: 'buyer',
        profileCompleteness: 'In Progress',
        marketplaceVerificationStatus: 'Not Submitted',
        transactionAccessStatus: 'Disabled',
      },
    },
    supplierProfile: {
      userId: 'u6',
      supplierType: 'individual_farmer',
      farmOrOrganizationName: 'Maria Cruz Farm',
      operatingLocation: 'Libmanan, Camarines Sur',
      cropInterests: ['Rice', 'Vegetables'],
    },
    buyerProfile: { userId: 'u6' },
    roleContext: { activeRole: 'supplier', availableRoles: ['supplier'] },
    onboardingProgress: { supplier: 'Complete', buyer: 'Basic Profile' },
  },
  u7: {
    accountVerification: verifiedAccount,
    roleVerifications: { supplier: enabledRole('supplier') },
    supplierProfile: {
      userId: 'u7',
      supplierType: 'aggregator',
      farmOrOrganizationName: 'Sorsogon Agri Aggregators',
      operatingLocation: 'Sorsogon City, Sorsogon',
      cropInterests: ['Coconut', 'Spices'],
    },
    roleContext: { activeRole: 'supplier', availableRoles: ['supplier'] },
    onboardingProgress: { supplier: 'Complete' },
  },
  u8: {
    accountVerification: verifiedAccount,
    roleVerifications: { buyer: pendingRole('buyer') },
    buyerProfile: {
      userId: 'u8',
      organizationName: 'Irosin Spice Traders',
      businessType: 'Trading Business',
      procurementAddress: 'Irosin, Sorsogon',
    },
    roleContext: { activeRole: 'buyer', availableRoles: ['buyer'] },
    onboardingProgress: { buyer: 'Submitted for Verification' },
  },
};

export const gate1VerificationRecords: VerificationRecord[] = [
  {
    id: 'vr-u5-supplier-1',
    userId: 'u5',
    role: 'supplier',
    toStatus: 'Pending Review',
    eventType: 'Submitted',
    actorId: 'u5',
    actorRole: 'supplier',
    createdAt: '2026-08-22T14:00:00+08:00',
  },
  {
    id: 'vr-u8-buyer-1',
    userId: 'u8',
    role: 'buyer',
    toStatus: 'Pending Review',
    eventType: 'Submitted',
    actorId: 'u8',
    actorRole: 'buyer',
    createdAt: '2026-08-22T14:10:00+08:00',
  },
];

function readTrustOverrides(): Record<string, Partial<Gate1TrustState>> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(TRUST_STORAGE_KEY) ?? '{}') as Record<string, Partial<Gate1TrustState>>;
  } catch {
    return {};
  }
}

function writeTrustOverrides(overrides: Record<string, Partial<Gate1TrustState>>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TRUST_STORAGE_KEY, JSON.stringify(overrides));
}

function mergeTrustState(base: Gate1TrustState = {}, override: Partial<Gate1TrustState> = {}): Gate1TrustState {
  return {
    accountVerification: base.accountVerification || override.accountVerification
      ? { ...base.accountVerification, ...override.accountVerification }
      : undefined,
    roleVerifications: { ...base.roleVerifications, ...override.roleVerifications },
    buyerProfile: base.buyerProfile || override.buyerProfile
      ? { ...base.buyerProfile, ...override.buyerProfile } as Gate1TrustState['buyerProfile']
      : undefined,
    supplierProfile: base.supplierProfile || override.supplierProfile
      ? { ...base.supplierProfile, ...override.supplierProfile } as Gate1TrustState['supplierProfile']
      : undefined,
    roleContext: override.roleContext ?? base.roleContext,
    onboardingProgress: { ...base.onboardingProgress, ...override.onboardingProgress },
  };
}

export function saveGate1TrustState(userId: string, patch: Partial<Gate1TrustState>) {
  const overrides = readTrustOverrides();
  overrides[userId] = mergeTrustState(overrides[userId] ?? {}, patch);
  writeTrustOverrides(overrides);
}

export function getVerificationRecords(userId?: string): VerificationRecord[] {
  if (typeof window === 'undefined') {
    return userId ? gate1VerificationRecords.filter(record => record.userId === userId) : gate1VerificationRecords;
  }

  let persisted: VerificationRecord[] = [];
  try {
    persisted = JSON.parse(window.localStorage.getItem(VERIFICATION_RECORD_STORAGE_KEY) ?? '[]') as VerificationRecord[];
  } catch {
    persisted = [];
  }

  const records = [...gate1VerificationRecords, ...persisted];
  return userId ? records.filter(record => record.userId === userId) : records;
}

export function saveVerificationRecord(record: VerificationRecord) {
  if (typeof window === 'undefined') return;
  let persisted: VerificationRecord[] = [];
  try {
    persisted = JSON.parse(window.localStorage.getItem(VERIFICATION_RECORD_STORAGE_KEY) ?? '[]') as VerificationRecord[];
  } catch {
    persisted = [];
  }
  persisted.push(record);
  window.localStorage.setItem(VERIFICATION_RECORD_STORAGE_KEY, JSON.stringify(persisted));
}

export function enrichUserWithGate1Trust(user: User): User {
  const baseState = gate1TrustStates[user.id] ?? {};
  const override = readTrustOverrides()[user.id] ?? {};
  const state = mergeTrustState(baseState, override);
  return { ...user, ...state };
}
