import { jwtDecode } from 'jwt-decode';
// src/auth/AuthProvider.tsx
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from '../types/user.types';
import { useNats } from './nats-provider';
// import { useLocation } from '@tanstack/react-router';
// import { User } from '../types';
// import { useNats } from '../nats/NatsProvider';
// import jwtDecode from 'jwt-decode';

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, cb?:()=>void) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshAccessToken: (refreshToken: string) => Promise<void>;
  contextInitialized: boolean;
  redirectOnAuth: (path: string, cb: () => void) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => { },
  isAuthenticated: false,
  refreshAccessToken: async () => { },
  contextInitialized: false,
  redirectOnAuth: () => { }
});
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isConnected, request } = useNats();

  const redirectOnAuth = useCallback((path: string, cb: () => void) => {
    // check if path variable is auth and if so we should redirect to dashboard
    if (path === '/auth' && isAuthenticated) {
      cb();
    }
  }, [isAuthenticated])

  useEffect(() => {
    console.info('Auth provider initialized');
    // Load tokens from localStorage
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    console.info('Access token:', accessToken);
    console.info('Refresh token:', refreshToken);
    if (accessToken && refreshToken) {
      // Validate access token
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const decodedToken: any = jwtDecode(accessToken);
      console.info('Decoded token', decodedToken);
      if (decodedToken.exp * 1000 > Date.now()) {
        console.info('Token is valid');
        // Token is valid
        setUser(decodedToken.user);
        setIsAuthenticated(true);
      } else {
        console.info('Token expired');
        // Access token expired, try to refresh
        refreshAccessToken(refreshToken);
      }
    }
  }, []);

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      console.info('Refreshing access token');
      const data = { refresh_token: refreshToken };
      const response = await request(
        'auth.refresh_token',
        JSON.stringify(data),
      );
      const result = JSON.parse(response);
      if (result.status === 'success') {
        const { access_token } = result;
        localStorage.setItem('access_token', access_token);

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const decodedToken: any = jwtDecode(access_token);
        setUser(decodedToken.user);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  };

  const login = async (
    username: string,
    password: string,
    cb?: () => void
  ): Promise<boolean> => {
    if (!isConnected) {
      alert('Unable to connect to server.');
      return false;
    }

    try {
      const credentials = { username, password };
      console.info('Logging in with', credentials);
      const response = await request('auth.login', JSON.stringify(credentials));
      console.info('Logging response', response);
      const result = JSON.parse(response);
      if (result.status === 'success') {
        const { access_token, refresh_token } = result;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        console.info('Login successful', result);
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const decodedToken: any = jwtDecode(access_token);
        console.info('Decoded token', decodedToken);
        setUser(decodedToken.user);
        setIsAuthenticated(true);
        setTimeout(() => { 
          cb?.()
         },0)
        return true;
      }

      alert(result.message);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, refreshAccessToken, contextInitialized: true, 
        redirectOnAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// export const useAuth = () => useContext(AuthContext);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context.contextInitialized) {
    throw new Error("AuthContext wad used outside of AuthProvider");
  }

  return context;
}

