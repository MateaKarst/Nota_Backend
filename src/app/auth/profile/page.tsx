"use client"

import React from 'react'
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useAppHook } from "@/context/AppUtils";


function Profile() {
const {authUser} = useAppHook()

    return (
        <>
            <Navbar />
            {authUser ? (
                <div className="container mt-5">
                    <h2>Profile</h2>
                    <div className="card p-4 shadow-sm">
                        <p><strong>Name:</strong> {authUser.name}</p>
                        <p><strong>Email:</strong> {authUser.email}</p>
                    </div>
                </div>
            ) : (
                <p>No user logged in</p>
            )}
            <Footer />
        </>
    );
}

export default Profile