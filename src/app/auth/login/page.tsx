// src/app/auth/login/page.tsx
"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppHook } from "@/context/AppUtils";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";

type LoginFormData = {
    email: string;
    password: string;
};

const formSchema = yup.object().shape({
    email: yup.string().required("Email is required").email("Invalid Email value"),
    password: yup.string().required("Password is required")
});

const Login = () => {
    const { isLoggedIn, setIsLoggedIn } = useAppHook();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: yupResolver(formSchema)
    });

    useEffect(() => {
        if (isLoggedIn) {
            router.push("/auth/dashboard");
        }
    }, [isLoggedIn, router]);

    const onSubmit = async (formdata: LoginFormData) => {
        const { email, password } = formdata;
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            toast.error(result.message || "Invalid login details");
        } else {
            setIsLoggedIn(true);
            toast.success("User logged in successfully");
            router.push("/auth/dashboard");
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <h2 className="text-center">Login</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="w-50 mx-auto mt-3">
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" {...register("email")} />
                        <p className="text-danger">{errors.email?.message}</p>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-control" {...register("password")} />
                        <p className="text-danger">{errors.password?.message}</p>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Login
                    </button>
                </form>
            </div>
            <Footer />
        </>
    );
};

export default Login;
