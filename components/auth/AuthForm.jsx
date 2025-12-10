"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import clsx from "clsx";

export default function AuthForm({ type = "login" }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "", // Only for signup
    });

    const isLogin = type === "login";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) throw error;
                router.push("/dashboard");
            } else {
                const { error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            username: formData.username,
                        },
                    },
                });
                if (error) throw error;
                // Ideally show success message or waiting for email confirmation
                alert("Account created! Please check your email (if confirmation is enabled) or log in.");
                router.push("/login");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 rounded-2xl glass-card border-t border-white/10 shadow-2xl">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    {isLogin ? "Welcome Back" : "Join the League"}
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                    {isLogin
                        ? "Enter your credentials to access your account."
                        : "Start your journey to becoming the champion."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                {!isLogin && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                                placeholder="Gamertag"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                            <UsersIcon className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Email</label>
                    <div className="relative">
                        <input
                            type="email"
                            required
                            className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Mail className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-medium">Password</label>
                        {isLogin && (
                            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            required
                            className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <Lock className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            {isLogin ? "Sign In" : "Create Account"}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <Link
                    href={isLogin ? "/signup" : "/login"}
                    className="text-primary font-semibold hover:underline"
                >
                    {isLogin ? "Sign up" : "Log in"}
                </Link>
            </div>
        </div>
    );
}

// Helper icon component for username field
function UsersIcon({ className, size }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}
