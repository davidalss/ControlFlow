import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, LoginResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored credentials on app start
  useEffect(() => {
    loadStoredCredentials();
  }, []);

  const loadStoredCredentials = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('auth_token');
      const storedUser = await SecureStore.getItemAsync('auth_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Mock API call - replace with actual API
      const response = await mockLoginAPI(email, password);

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store credentials securely
        await SecureStore.setItemAsync('auth_token', token);
        await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
        
        setUser(user);
        setToken(token);
        
        return true;
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear stored credentials
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
      
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!token) return false;

      // Mock API call - replace with actual API
      const response = await mockRefreshTokenAPI(token);

      if (response.success && response.data) {
        const { user, token: newToken } = response.data;
        
        // Update stored credentials
        await SecureStore.setItemAsync('auth_token', newToken);
        await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
        
        setUser(user);
        setToken(newToken);
        
        return true;
      } else {
        // Token refresh failed, logout user
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Mock API functions - replace with actual API calls
const mockLoginAPI = async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock validation
  if (email === 'inspector@controlflow.com' && password === 'password') {
    return {
      success: true,
      data: {
        user: {
          id: '1',
          name: 'João Silva',
          email: 'inspector@controlflow.com',
          role: 'inspector',
          businessUnit: 'BU-001',
          avatar: undefined,
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      },
    };
  } else if (email === 'admin@controlflow.com' && password === 'password') {
    return {
      success: true,
      data: {
        user: {
          id: '2',
          name: 'Maria Santos',
          email: 'admin@controlflow.com',
          role: 'admin',
          businessUnit: 'BU-001',
          avatar: undefined,
        },
        token: 'mock-jwt-token-admin',
        refreshToken: 'mock-refresh-token-admin',
      },
    };
  }

  return {
    success: false,
    error: 'Invalid credentials',
  };
};

const mockRefreshTokenAPI = async (currentToken: string): Promise<ApiResponse<LoginResponse>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock token refresh
  if (currentToken.includes('mock-jwt-token')) {
    return {
      success: true,
      data: {
        user: {
          id: '1',
          name: 'João Silva',
          email: 'inspector@controlflow.com',
          role: 'inspector',
          businessUnit: 'BU-001',
          avatar: undefined,
        },
        token: 'mock-jwt-token-refreshed',
        refreshToken: 'mock-refresh-token-refreshed',
      },
    };
  }

  return {
    success: false,
    error: 'Invalid token',
  };
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
