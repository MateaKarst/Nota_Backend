"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAppHook } from "@/context/AppUtils";

const PUBLIC_ROUTES = ["/", "/auth/login"];

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isLoggedIn } = useAppHook();
    const router = useRouter();
    const pathname = usePathname();

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    useEffect(() => {
        if (!isLoggedIn && !isPublicRoute) {
            router.push("/auth/login");
        }
    }, [isLoggedIn, isPublicRoute, router]);

    if (isLoggedIn || isPublicRoute) {
        return <>{children}</>;
    }

    return null; // Optionally show loading spinner
};

export default ProtectedRoute;
