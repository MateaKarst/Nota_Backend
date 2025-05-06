// src/context/AppUtils.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserProfile {
    email: string;
    name?: string;
}

interface AppUtilsType {
    isLoggedIn: boolean;
    setIsLoggedIn: (state: boolean) => void;
    authUser: UserProfile | null;
    cookies: string | null;
    setCookies: React.Dispatch<React.SetStateAction<string | null>>;
}

const AppUtilsContext = createContext<AppUtilsType | undefined>(undefined);

export const AppUtilsProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authUser, setAuthUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        async function fetchUser() {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const { user } = await res.json();
                if (user) {
                    setIsLoggedIn(true);
                    setAuthUser({
                        email: user.email,
                        name: user.user_metadata?.display_name ?? '',
                    });
                }
            }
        }

        fetchUser();
    }, []);

    return (
        <AppUtilsContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                authUser,
                cookies: null, // You can't access HttpOnly cookies from client
                setCookies: () => {}, // Disable or remove this if not needed
            }}
        >
            {children}
        </AppUtilsContext.Provider>
    );
};

export const useAppHook = () => {
    const context = useContext(AppUtilsContext);
    if (!context) {
        throw new Error("AppUtils functions must be used within AppUtilsProvider");
    }
    return context;
};

