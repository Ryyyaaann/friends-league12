"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Gamepad2, Trophy, Users, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        async function getUser() {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        }
        getUser();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    const navItems = [
        { name: "Home", href: "/", icon: Gamepad2 },
        { name: "Games", href: "/games", icon: Users },
        { name: "Competitions", href: "/competitions", icon: Trophy },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                                Friend's League
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={clsx(
                                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                                            isActive
                                                ? "bg-primary/20 text-primary"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        )}
                                    >
                                        <item.icon size={18} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {loading ? (
                            <div className="h-9 w-20 bg-white/5 rounded-lg animate-pulse"></div>
                        ) : user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href={`/profile/${user.id}`}
                                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                                        {user.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <UserIcon size={16} />
                                        )}
                                    </div>
                                    <span className="hidden md:block">{user.user_metadata?.username || "Player"}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-primary/25"
                            >
                                <LogIn size={18} />
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
