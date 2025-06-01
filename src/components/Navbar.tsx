"use client";

import Link from "next/link";
import { useAppHook } from "@/context/AppUtils";
import { useState } from "react";

const Navbar = () => {
    const { isLoggedIn, setIsLoggedIn, refreshUser } = useAppHook(); // ✅
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await fetch("/api/auth/logout", { method: "POST" });
        await refreshUser(); // update context after logout
        setIsLoggedIn(false);
        setIsLoggingOut(false);
        window.location.href = "/"; // force nav
    };

    return (
        <nav className="navbar navbar-expand-lg px-4" style={{ backgroundColor: "#343a40" }}>
            <Link className="navbar-brand fw-bold text-white" href="/">SupaNext</Link>

            {isLoggedIn ? (
                <div className="ms-auto">
                    <Link className="me-3 text-white text-decoration-none" href="/auth/dashboard">Dashboard</Link>
                    <Link className="me-3 text-white text-decoration-none" href="/auth/profile">Profile</Link>
                    <Link className="me-3 text-white text-decoration-none" href="/auth/editor">Editor</Link>
                    <Link className="me-3 text-white text-decoration-none" href="/auth/connections">Connections</Link>
                    <Link className="me-3 text-white text-decoration-none" href="/auth/messages">Messages</Link>
                    <button
                        className="btn btn-danger"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                </div>
            ) : (
                <div className="ms-auto">
                    <Link className="me-3 text-white text-decoration-none" href="/">Home</Link>
                    <Link className="text-white text-decoration-none" href="/auth/login">Login</Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
