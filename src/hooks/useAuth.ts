import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
    };

    const signUp = async (email: string, password: string) => {
        // Try admin signup edge function (auto-confirms email, Vercel only)
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (res.ok) {
                // Auto-sign in after successful admin signup
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                return { error: error?.message ?? null };
            }
            const data = await res.json();
            // If the admin API returned a user error (not a server error), show it
            if (res.status === 400) {
                return { error: data.error || 'Signup failed' };
            }
        } catch {
            // Admin API unavailable (e.g. dev mode) — fall through to standard signup
        }

        // Fallback: standard Supabase signup (works in dev, requires email confirmation disabled)
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: error.message };

        // Standard signUp auto-signs in if email confirmation is disabled
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        return { error: signInError?.message ?? null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = React.useMemo(
        () => ({ user, session, loading, signIn, signUp, signOut }),
        [user, session, loading]
    );

    return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
