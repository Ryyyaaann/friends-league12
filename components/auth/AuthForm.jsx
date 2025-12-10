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
    const [successMessage, setSuccessMessage] = useState(null); // New state for success messages
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
    });

    const isLogin = type === "login";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) {
                    if (error.message.includes("Email not confirmed")) {
                        throw new Error("E-mail não confirmado. Por favor, verifique sua caixa de entrada.");
                    }
                    throw error;
                }
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

                // Show success message instead of redirecting immediately
                setSuccessMessage("Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro antes de entrar.");
                // Optional: Clear form or redirect after a delay
                // router.push("/login"); 
            }
        } catch (err) {
            // Translate common errors
            let msg = err.message;
            if (msg === "Invalid login credentials") msg = "Credenciais inválidas.";
            if (msg.includes("already registered")) msg = "E-mail já cadastrado.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 rounded-2xl glass-card border-t border-white/10 shadow-2xl">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    {isLogin ? "Bem-vindo de volta" : "Criar Conta"}
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                    {isLogin
                        ? "Entre com suas credenciais para acessar."
                        : "Junte-se à liga e comece a competir."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {successMessage && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-4 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                        <span className="mt-0.5">✅</span>
                        <span>{successMessage}</span>
                    </div>
                )}

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                {!isLogin && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Nome de Usuário</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 text-white"
                                placeholder="Seu Nickname"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                            <UsersIcon className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">E-mail</label>
                    <div className="relative">
                        <input
                            type="email"
                            required
                            className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 text-white"
                            placeholder="nome@exemplo.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Mail className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-medium">Senha</label>
                        {isLogin && (
                            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                Esqueceu a senha?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            required
                            className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 text-white"
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
                            {isLogin ? "Entrar" : "Criar Conta"}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                <Link
                    href={isLogin ? "/signup" : "/login"}
                    className="text-primary font-semibold hover:underline"
                >
                    {isLogin ? "Cadastre-se" : "Faça login"}
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
