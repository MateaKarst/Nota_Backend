// AppUtils.tsx
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
    const [cookies, setCookies] = useState<string | null>(null);

    useEffect(() => {
        // Commented out cookie handling for now
        /*
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("sb-jwt="))
            ?.split("=")[1];

        if (token) {
            setIsLoggedIn(true);
            setCookies(token);

            // Optionally hydrate user from localStorage or fetch an endpoint like /api/me
            const user = localStorage.getItem("authUser");
            if (user) {
                setAuthUser(JSON.parse(user));
            }
        } else {
            setIsLoggedIn(false);
            setCookies(null);
            setAuthUser(null);
        }
        */

        // Temporary fallback logic while cookies are disabled
        const user = localStorage.getItem("authUser");
        if (user) {
            setIsLoggedIn(true);
            setAuthUser(JSON.parse(user));
        } else {
            setIsLoggedIn(false);
            setAuthUser(null);
        }

    }, []);

    return (
        <AppUtilsContext.Provider
            value={{ isLoggedIn, setIsLoggedIn, authUser, cookies, setCookies }}
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

