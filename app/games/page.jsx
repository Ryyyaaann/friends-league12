"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import GameCard from "@/components/games/GameCard";
import Link from "next/link";
import { Plus, Search, CloudDownload, Loader2 } from "lucide-react";


export default function GamesPage() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState("");

    const [userBacklog, setUserBacklog] = useState({}); // Map: game_id -> status
    const [steamResults, setSteamResults] = useState([]);
    const [searchingSteam, setSearchingSteam] = useState(false);


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
        setUser(user);
        setLoading(false);
    }


    // Debounced search for Steam
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search.length > 2) {
                searchSteam();
            } else {
                setSteamResults([]);
            }
        }, 800);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    async function searchSteam() {
        setSearchingSteam(true);
        try {
            const res = await fetch(`/api/steam/search?query=${encodeURIComponent(search)}`);
            const data = await res.json();

            // Filter out games we already have locally (optional, but good UX)
            // For now, we'll just show them, maybe disable add button if duplicate check logic existed
            setSteamResults(data.items || []);
        } catch (error) {
            console.error("Steam search failed", error);
        } finally {
            setSearchingSteam(false);
        }
    }

    async function addSteamGame(steamGame) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return alert("Please login to add games");

            // Check if game already exists (by steam_id or title slug)
            // Ideally we check DB, but simplified here:
            // Just insert, if slug conflict handle error? 
            // We'll generate a slug from title.
            const slug = steamGame.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            const { data, error } = await supabase.from('games').insert({
                title: steamGame.title,
                slug: slug + '-' + Math.floor(Math.random() * 1000), // Append random to avoid easy collisions
                cover_url: steamGame.cover_url,
                platforms: steamGame.platforms,
                created_by: user.id
                // storing steam_id would be good if schema supported it, assume not for now
            }).select().single();

            if (error) throw error;

            alert(`Game "${steamGame.title}" added to library!`);
            fetchData(); // Refresh local list
            setSearch(""); // Clear search to see the new game?
        } catch (error) {
            console.error("Error adding steam game", error);
            alert("Failed to add game. It might already exist.");
        }
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

                    {user && (
                        <Link
                            href="/games/new"
                            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
                        >
                            <Plus size={20} />
                            Add New Game
                        </Link>
                    )}
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

                {/* Steam Results Section */}
                {search.length > 2 && (
                    <div className="mt-16 border-t border-white/10 pt-10">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="bg-blue-600 text-white p-1 rounded">Steam</span> Results
                            {searchingSteam && <Loader2 className="animate-spin text-muted-foreground" size={20} />}
                        </h2>

                        {steamResults.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {steamResults.map(game => (
                                    <div key={game.id} className="glass-card rounded-xl overflow-hidden group hover:border-primary/50 transition-all">
                                        <div className="aspect-video bg-neutral-900 relative">
                                            <img
                                                src={game.cover_url}
                                                alt={game.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                {user ? (
                                                    <button
                                                        onClick={() => addSteamGame(game)}
                                                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                                                    >
                                                        <CloudDownload size={18} /> Import
                                                    </button>
                                                ) : (
                                                    <Link href="/login" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold backdrop-blur-md transform translate-y-4 group-hover:translate-y-0 transition-all">
                                                        Login to Import
                                                    </Link>
                                                )}
                                            </div>

                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg truncate" title={game.title}>{game.title}</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Steam ID: {game.id}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !searchingSteam && <p className="text-muted-foreground">No results found on Steam.</p>
                        )}
                    </div>
                )}

            </div>
        </main>
    );
}
