"use client";

import Link from "next/link";
import { useAppHook } from "@/context/AppUtils";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const { isLoggedIn } = useAppHook();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/"); // Redirect to home or login after logout
    };

    return (
        <nav className="navbar navbar-expand-lg px-4" style={{ backgroundColor: "#343a40" }}>
            <Link className="navbar-brand fw-bold text-white" href="/">SupaNext</Link>

            {isLoggedIn ? (
                <div className="ms-auto">
                    <Link className="me-3 text-white text-decoration-none" href="/auth/dashboard">Dashboard</Link>
                    <Link className="me-3 text-white text-decoration-none" href="/auth/profile">Profile</Link>
                    <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
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
