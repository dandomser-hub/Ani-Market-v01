import React, { createContext, useContext, useState } from 'react';
import type { MarketplaceRole, RoleVerificationState, User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole | null;
  login: (userId: string, role: UserRole) => void;
  logout: () => void;
  getRoleVerification: (role?: MarketplaceRole | null) => RoleVerificationState | null;
  isRoleTransactionEnabled: (role?: MarketplaceRole | null) => boolean;
  canTransact: boolean;
}

const AppContext = createContext<AppContextType>({
  currentUser: null,
  currentRole: null,
  login: () => {},
  logout: () => {},
  getRoleVerification: () => null,
  isRoleTransactionEnabled: () => false,
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
    const user = mockUsers.find(u => u.id === userId) ?? null;
    setCurrentUser(user);
    setCurrentRole(user ? role : null);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
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

  const canTransact =
    (currentRole === 'buyer' || currentRole === 'supplier') && isRoleTransactionEnabled(currentRole);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        login,
        logout,
        getRoleVerification,
        isRoleTransactionEnabled,
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
