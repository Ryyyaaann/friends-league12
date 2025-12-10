"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CopyPlus, Gamepad2, Trophy, ArrowRight } from "lucide-react";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.push("/login");
            } else {
                setUser(user);
            }
            setLoading(false);
        };
        checkUser();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
        );
    }

    // Fallback for null user during redirect
    if (!user) return null;

    return (
        <main className="min-h-screen bg-background pt-20 pb-12">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold">
                        Hello, <span className="text-primary">{user.user_metadata?.username || user.email.split('@')[0]}</span>! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">Ready to dominate the league today?</p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Active Competitions */}
                    <div className="glass-card p-6 rounded-2xl md:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                    <Trophy size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Active Competitions</h2>
                            </div>
                            <button className="text-sm text-primary hover:underline">View All</button>
                        </div>

                        <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/5">
                            <p className="text-muted-foreground mb-4">No active competitions found.</p>
                            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all">
                                Create Tournament
                            </button>
                        </div>
                    </div>

                    {/* My Backlog Quick View */}
                    <div className="glass-card p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary rounded-lg text-white">
                                    <Gamepad2 size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Playing Now</h2>
                            </div>
                            <button className="text-sm text-primary hover:underline">Edit</button>
                        </div>

                        <div className="space-y-4">
                            {/* Placeholder Items */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                <div className="w-12 h-12 bg-neutral-800 rounded-lg flex-shrink-0"></div>
                                <div>
                                    <h4 className="font-medium text-sm group-hover:text-primary transition-colors">Elden Ring</h4>
                                    <p className="text-xs text-muted-foreground">PC • 60%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                <div className="w-12 h-12 bg-neutral-800 rounded-lg flex-shrink-0"></div>
                                <div>
                                    <h4 className="font-medium text-sm group-hover:text-primary transition-colors">Hades II</h4>
                                    <p className="text-xs text-muted-foreground">Steam Deck • 15%</p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-6 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                            <CopyPlus size={16} /> Update Log
                        </button>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="glass-card p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex-shrink-0"></div>
                            <div>
                                <p className="text-sm"><span className="font-bold text-white">Ryan</span> completed <span className="font-bold text-primary">God of War: Ragnarok</span></p>
                                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                            </div>
                        </div>
                        <div className="h-[1px] bg-white/5 w-full"></div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex-shrink-0"></div>
                            <div>
                                <p className="text-sm"><span className="font-bold text-white">Sarah</span> won against <span className="font-bold text-white">Mike</span> in <span className="font-bold text-primary">SF6 Weekend Cup</span></p>
                                <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
