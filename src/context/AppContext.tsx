import React, { createContext, useContext, useState } from 'react';
import type { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole | null;
  login: (userId: string, role: UserRole) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType>({
  currentUser: null,
  currentRole: null,
  login: () => {},
  logout: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  const login = (userId: string, role: UserRole) => {
    const user = mockUsers.find(u => u.id === userId) ?? null;
    setCurrentUser(user);
    setCurrentRole(role);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
  };

  return (
    <AppContext.Provider value={{ currentUser, currentRole, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
