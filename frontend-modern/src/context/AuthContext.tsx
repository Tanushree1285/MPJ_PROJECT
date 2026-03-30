import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('zbUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Ensure role is normalized even from storage
        const normalized = {
          ...parsed,
          role: typeof parsed.role === 'object' ? (parsed.role.roleName || 'USER') : parsed.role
        };
        setUser(normalized);
      } catch (e) {
        localStorage.removeItem('zbUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: any) => {
    // Normalize userId to id if necessary, and role to string
    const normalizedUser = {
      ...userData,
      id: userData.id || userData.userId,
      role: typeof userData.role === 'object' ? (userData.role.roleName || 'USER') : userData.role
    };
    setUser(normalizedUser);
    localStorage.setItem('zbUser', JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zbUser');
    // Use clear path for logout redirect
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
