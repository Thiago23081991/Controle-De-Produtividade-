import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ExpertInfo } from '../types';
import { expertService } from '../services/expertService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface AuthContextType {
    currentUser: ExpertInfo | null;
    isAdmin: boolean;
    login: (user: ExpertInfo | 'admin') => void;
    logout: () => void;
    experts: ExpertInfo[];
    loadingHelpers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<ExpertInfo | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [experts, setExperts] = useState<ExpertInfo[]>([]);
    const [loadingHelpers, setLoadingHelpers] = useState(true);

    useEffect(() => {
        const loadExperts = async () => {
            if (!isSupabaseConfigured) {
                setLoadingHelpers(false);
                return;
            }
            try {
                const list = await expertService.getAll();
                setExperts(list);
            } catch (error) {
                console.error("Erro ao carregar experts:", error);
            } finally {
                setLoadingHelpers(false);
            }
        };
        loadExperts();
    }, []);

    // Persist login state (optional, can be improved later with proper session management)
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        const storedAdmin = localStorage.getItem('isAdmin');

        if (storedAdmin === 'true') {
            setIsAdmin(true);
        } else if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user");
            }
        }
    }, []);

    const login = (user: ExpertInfo | 'admin') => {
        if (user === 'admin') {
            setIsAdmin(true);
            setCurrentUser(null);
            localStorage.setItem('isAdmin', 'true');
            localStorage.removeItem('currentUser');
        } else {
            setIsAdmin(false);
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.removeItem('isAdmin');
        }
    };

    const logout = () => {
        setCurrentUser(null);
        setIsAdmin(false);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAdmin');
    };

    return (
        <AuthContext.Provider value={{ currentUser, isAdmin, login, logout, experts, loadingHelpers }}>
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
