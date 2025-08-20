// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export interface User {
    userId: number;
    userName: string;
    roleType: 'Admin' | 'User';
}

export interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

// Helper function to decode JWT token (basic implementation)
function decodeJWT(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const storedToken = localStorage.getItem('tasktrack-token');
        const storedUser = localStorage.getItem('tasktrack-user');

        if (storedToken && storedUser) {
            try {
                const decoded = decodeJWT(storedToken);

                // Check if token is expired
                if (decoded && decoded.exp * 1000 > Date.now()) {
                    // Re-extract user data from token to ensure consistency
                    const userData: User = {
                        userId: parseInt(decoded.sub || decoded.UserId || '0'),
                        userName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.unique_name || 'Unknown',
                        roleType: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User'
                    };
                    
                    setToken(storedToken);
                    setUser(userData);
                    
                    // Update localStorage with corrected user data
                    localStorage.setItem('tasktrack-user', JSON.stringify(userData));
                } else {
                    // Token expired, clear storage
                    localStorage.removeItem('tasktrack-token');
                    localStorage.removeItem('tasktrack-user');
                }
            } catch (error) {
                console.error('Error validating stored token:', error);
                localStorage.removeItem('tasktrack-token');
                localStorage.removeItem('tasktrack-user');
            }
        }

        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            const token = await apiService.login({
                userName: username,
                userPassword: password
            });

            if (token) {
                // Decode token to get user info
                const decoded = decodeJWT(token);

                if (decoded) {
                    const userData: User = {
                        userId: parseInt(decoded.sub || decoded.UserId || '0'),
                        userName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.unique_name || username,
                        roleType: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User'
                    };

                    setToken(token);
                    setUser(userData);

                    localStorage.setItem('tasktrack-token', token);
                    localStorage.setItem('tasktrack-user', JSON.stringify(userData));

                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('tasktrack-token');
        localStorage.removeItem('tasktrack-user');
    };

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
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