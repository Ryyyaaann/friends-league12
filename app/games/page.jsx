"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import GameCard from "@/components/games/GameCard";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

export default function GamesPage() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [userBacklog, setUserBacklog] = useState({}); // Map: game_id -> status

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Fetch Games
        const { data: gamesData } = await supabase
            .from('games')
            .select('*')
            .order('created_at', { ascending: false });

        // 2. Fetch User Backlog (if logged in)
        let backlogMap = {};
        if (user) {
            const { data: backlogData } = await supabase
                .from('backlog_items')
                .select('game_id, status')
                .eq('user_id', user.id);

            backlogData?.forEach(item => {
                backlogMap[item.game_id] = item.status;
            });
        }

        setGames(gamesData || []);
        setUserBacklog(backlogMap);
        setLoading(false);
    }

    const filteredGames = games.filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-background pt-20 pb-12">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                            Game Library
                        </h1>
                        <p className="text-muted-foreground mt-1">Discover games to compete in or play solo.</p>
                    </div>

                    <Link
                        href="/games/new"
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
                    >
                        <Plus size={20} />
                        Add New Game
                    </Link>
                </div>

                {/* Search */}
                <div className="relative max-w-md w-full mb-10">
                    <Search className="absolute left-3 top-3.5 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="Search for a game..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-72 rounded-xl bg-white/5 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredGames.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredGames.map(game => (
                            <GameCard
                                key={game.id}
                                game={game}
                                savedStatus={userBacklog[game.id]}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <p className="text-muted-foreground mb-4">No games found.</p>
                        <Link href="/games/new" className="text-primary hover:underline font-medium">
                            Be the first to add one!
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
