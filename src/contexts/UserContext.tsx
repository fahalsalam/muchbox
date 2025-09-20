import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '@/types';

interface UserContextType {
  userRole: UserRole | null;
  userName: string | null;
  userID: number | null;
  setUser: (userID: number, userName: string, role: UserRole) => void;
  clearUser: () => void;
  isAdmin: boolean;
  isPrivileged: boolean;
  isNormal: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userID, setUserID] = useState<number | null>(null);

  // Load user info from localStorage on mount
  useEffect(() => {
    console.log('🔍 UserContext - useEffect running...');
    const savedUserInfo = localStorage.getItem('userInfo');
    console.log('🔍 UserContext - Raw localStorage data:', savedUserInfo);
    
    if (savedUserInfo) {
      try {
        const userInfo = JSON.parse(savedUserInfo);
        console.log('🔍 UserContext - Parsed userInfo:', userInfo);
        console.log('🔍 UserContext - Setting states...');
        
        setUserID(userInfo.userID);
        setUserName(userInfo.userName);
        setUserRole(userInfo.role as UserRole);
        
        console.log('👤 User context loaded from localStorage:', userInfo);
      } catch (error) {
        console.error('Error parsing user info from localStorage:', error);
      }
    } else {
      console.log('🔍 UserContext - No userInfo found in localStorage');
    }
  }, []);

  const setUser = (newUserID: number, newUserName: string, newRole: UserRole) => {
    setUserID(newUserID);
    setUserName(newUserName);
    setUserRole(newRole);
    
    // Store in localStorage
    const userInfo = {
      userID: newUserID,
      userName: newUserName,
      role: newRole
    };
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    console.log('👤 User context updated:', userInfo);
  };

  const clearUser = () => {
    setUserID(null);
    setUserName(null);
    setUserRole(null);
    localStorage.removeItem('userInfo');
    console.log('👤 User context cleared');
  };

  // Computed properties for easier role checking
  const isAdmin = userRole === 'Admin';
  const isPrivileged = userRole === 'Privileged';
  const isNormal = userRole === 'Normal';

  const value: UserContextType = {
    userRole,
    userName,
    userID,
    setUser,
    clearUser,
    isAdmin,
    isPrivileged,
    isNormal
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
