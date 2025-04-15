"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";  // Ensure supabase is initialized properly

interface UserProfile {
    email: string;
    name?: string;
}

interface AppUtilsType {
    isLoggedIn: boolean;
    setIsLoggedIn: (state: boolean) => void;
    authUser: UserProfile | null;
}

const AppUtilsContext = createContext<AppUtilsType | undefined>(undefined);

export const AppUtilsProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authUser, setAuthUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        // Subscribe to auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setAuthUser({
                    email: session.user.email ?? "",
                    name: session.user.user_metadata?.display_name ?? "No name"
                });
                setIsLoggedIn(true);
            } else {
                setAuthUser(null);
                setIsLoggedIn(false);
            }
        });

        // Fetch the user on initial load (in case the user is already logged in)
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                setAuthUser({
                    email: data.user.email ?? "",
                    name: data.user.user_metadata?.display_name ?? "No name"
                });
                setIsLoggedIn(true);
            } else {
                setAuthUser(null);
                setIsLoggedIn(false);
            }
        };

        fetchUser();

        // Cleanup listener on component unmount
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    return (
        <AppUtilsContext.Provider value={{ isLoggedIn, setIsLoggedIn, authUser }}>
            {children}
        </AppUtilsContext.Provider>
    );
};

export const useAppHook = () => {
    const context = useContext(AppUtilsContext);
    if (!context) {
        throw new Error("App Utils functions must be used within AppUtilsProvider");
    }
    return context;
};
