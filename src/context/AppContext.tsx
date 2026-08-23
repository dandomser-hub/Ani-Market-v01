import React, { createContext, useContext, useState } from 'react';
import type { MarketplaceRole, RoleVerificationState, User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';
import {
  enrichUserWithGate1Trust,
  saveGate1TrustState,
  type Gate1TrustState,
} from '../data/gate1TrustData';

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole | null;
  login: (userId: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: MarketplaceRole) => boolean;
  getRoleVerification: (role?: MarketplaceRole | null) => RoleVerificationState | null;
  isRoleTransactionEnabled: (role?: MarketplaceRole | null) => boolean;
  updateCurrentUserTrust: (patch: Partial<Gate1TrustState>) => void;
  canTransact: boolean;
}

const AppContext = createContext<AppContextType>({
  currentUser: null,
  currentRole: null,
  login: () => {},
  logout: () => {},
  switchRole: () => false,
  getRoleVerification: () => null,
  isRoleTransactionEnabled: () => false,
  updateCurrentUserTrust: () => {},
  canTransact: false,
});

function deriveLegacyRoleVerification(user: User, role: MarketplaceRole): RoleVerificationState {
  const isLegacyVerified = user.verificationStatus === 'Verified' && user.accountStatus === 'Active';

  return {
    role,
    profileCompleteness: isLegacyVerified ? 'Complete' : 'In Progress',
    marketplaceVerificationStatus:
      user.accountStatus === 'Suspended'
        ? 'Suspended'
        : user.verificationStatus === 'Verified'
          ? 'Verified'
          : user.verificationStatus === 'Rejected'
            ? 'Rejected'
            : 'Pending Review',
    transactionAccessStatus:
      user.accountStatus === 'Suspended'
        ? 'Suspended'
        : isLegacyVerified
          ? 'Enabled'
          : 'Disabled',
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  const login = (userId: string, role: UserRole) => {
    const baseUser = mockUsers.find(u => u.id === userId) ?? null;
    const user = baseUser ? enrichUserWithGate1Trust(baseUser) : null;
    setCurrentUser(user);
    setCurrentRole(user ? role : null);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
  };

  const switchRole = (role: MarketplaceRole) => {
    if (!currentUser) return false;
    const availableRoles = currentUser.roleContext?.availableRoles ?? [currentUser.role];
    if (!availableRoles.includes(role)) return false;

    saveGate1TrustState(currentUser.id, {
      roleContext: { activeRole: role, availableRoles },
    });
    setCurrentUser(enrichUserWithGate1Trust(currentUser));
    setCurrentRole(role);
    return true;
  };

  const getRoleVerification = (role?: MarketplaceRole | null): RoleVerificationState | null => {
    if (!currentUser || !role) return null;

    const explicit = currentUser.roleVerifications?.[role];
    if (explicit) return explicit;

    return deriveLegacyRoleVerification(currentUser, role);
  };

  const isRoleTransactionEnabled = (role?: MarketplaceRole | null) => {
    if (!currentUser || !role || currentUser.accountStatus !== 'Active') return false;

    const accountVerified = currentUser.accountVerification
      ? currentUser.accountVerification.emailStatus === 'Verified' &&
        currentUser.accountVerification.mobileStatus === 'Verified'
      : currentUser.verificationStatus === 'Verified';

    const roleState = getRoleVerification(role);

    return Boolean(
      accountVerified &&
      roleState?.profileCompleteness === 'Complete' &&
      roleState.marketplaceVerificationStatus === 'Verified' &&
      roleState.transactionAccessStatus === 'Enabled'
    );
  };

  const updateCurrentUserTrust = (patch: Partial<Gate1TrustState>) => {
    if (!currentUser) return;
    saveGate1TrustState(currentUser.id, patch);
    setCurrentUser(enrichUserWithGate1Trust(currentUser));
  };

  const canTransact =
    (currentRole === 'buyer' || currentRole === 'supplier') && isRoleTransactionEnabled(currentRole);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        login,
        logout,
        switchRole,
        getRoleVerification,
        isRoleTransactionEnabled,
        updateCurrentUserTrust,
        canTransact,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
