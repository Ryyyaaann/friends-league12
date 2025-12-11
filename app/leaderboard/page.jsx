"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Trophy, Crown, Medal, AlertCircle, Swords } from "lucide-react";
import clsx from "clsx";

export default function LeaderboardPage() {
    const [titleStats, setTitleStats] = useState([]);
    const [matchStats, setMatchStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("titles"); // titles | wins

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    async function fetchLeaderboard() {
        setLoading(true);

        // --- 1. Fetch Titles Leaderboard ---
        const { data: comps, error } = await supabase
            .from('competitions')
            .select('winner_id')
            .eq('status', 'finished')
            .not('winner_id', 'is', null);

        let titlesLeaderboard = [];
        if (!error && comps && comps.length > 0) {
            const winCounts = {};
            comps.forEach(c => {
                if (c.winner_id) {
                    winCounts[c.winner_id] = (winCounts[c.winner_id] || 0) + 1;
                }
            });

            const winnerIds = Object.keys(winCounts);
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .in('id', winnerIds);

            const profilesMap = (profilesData || []).reduce((acc, p) => {
                acc[p.id] = p;
                return acc;
            }, {});

            titlesLeaderboard = winnerIds.map(id => ({
                player_id: id,
                count: winCounts[id],
                profiles: profilesMap[id]
            })).sort((a, b) => b.count - a.count);
        }
        setTitleStats(titlesLeaderboard);


        // --- 2. Fetch Matches Won Leaderboard (Manual Join) ---
        const { data: statsData } = await supabase
            .from('player_stats')
            .select('*')
            .order('wins', { ascending: false })
            .limit(20);

        let winsLeaderboard = [];
        if (statsData && statsData.length > 0) {
            const playerIds = statsData.map(s => s.player_id);
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .in('id', playerIds);

            const profilesMap = (profilesData || []).reduce((acc, p) => {
                acc[p.id] = p;
                return acc;
            }, {});

            winsLeaderboard = statsData.map(stat => ({
                player_id: stat.player_id,
                count: stat.wins,
                profiles: profilesMap[stat.player_id],
                details: stat
            }));
        }

        setMatchStats(winsLeaderboard);

        setLoading(false);
    }

    const getRankIcon = (index) => {
        if (index === 0) return <Crown className="text-yellow-400" size={24} fill="currentColor" />;
        if (index === 1) return <Medal className="text-gray-300" size={24} />;
        if (index === 2) return <Medal className="text-amber-600" size={24} />;
        return <span className="font-mono font-bold text-gray-500">#{index + 1}</span>;
    };

    const currentStats = activeTab === 'titles' ? titleStats : matchStats;

    return (
        <main className="min-h-screen bg-background pt-20 pb-12">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 inline-flex items-center gap-3">
                        <Trophy className="text-yellow-500" /> Ranking Global
                    </h1>
                    <p className="text-muted-foreground mt-2">Os maiores campeões e vencedores da liga.</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white/5 p-1 rounded-xl flex gap-1">
                        <button
                            onClick={() => setActiveTab('titles')}
                            className={clsx(
                                "px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                                activeTab === 'titles' ? "bg-[#8B5CF6] text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Trophy size={16} /> Títulos
                        </button>
                        <button
                            onClick={() => setActiveTab('wins')}
                            className={clsx(
                                "px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                                activeTab === 'wins' ? "bg-[#8B5CF6] text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Swords size={16} /> Partidas Ganhas
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : currentStats.length > 0 ? (
                    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-left">
                                    <th className="p-6 text-sm font-bold text-muted-foreground uppercase tracking-wider w-24 text-center">Posição</th>
                                    <th className="p-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Jogador</th>
                                    <th className="p-6 text-sm font-bold text-muted-foreground uppercase tracking-wider text-right">
                                        {activeTab === 'titles' ? 'Títulos' : 'Vitórias'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {currentStats.map((stat, index) => {
                                    return (
                                        <tr key={stat.player_id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-6 text-center">
                                                <div className="flex items-center justify-center">
                                                    {getRankIcon(index)}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={clsx(
                                                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
                                                        index === 0 ? "border-yellow-400 text-yellow-400 bg-yellow-400/10" :
                                                            index === 1 ? "border-gray-400 text-gray-400 bg-gray-400/10" :
                                                                index === 2 ? "border-amber-600 text-amber-600 bg-amber-600/10" :
                                                                    "border-white/10 bg-white/5 text-muted-foreground"
                                                    )}>
                                                        {stat.profiles?.avatar_url ? (
                                                            <img src={stat.profiles.avatar_url} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            stat.profiles?.username?.[0]?.toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={clsx(
                                                            "font-bold text-lg",
                                                            index === 0 ? "text-yellow-400" : "text-foreground"
                                                        )}>
                                                            {stat.profiles?.username || "Desconhecido"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className={clsx(
                                                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl border",
                                                    activeTab === 'titles'
                                                        ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
                                                        : "bg-green-400/10 text-green-400 border-green-400/20"
                                                )}>
                                                    {activeTab === 'titles' ? <Trophy size={16} /> : <Swords size={16} />}
                                                    <span className="font-bold text-xl">{stat.count}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 glass-card rounded-2xl border border-dashed border-white/10">
                        <AlertCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-medium mb-2">Ranking Vazio</h3>
                        <p className="text-muted-foreground">
                            {activeTab === 'titles'
                                ? "Ninguém ganhou torneios ainda."
                                : "Nenhuma partida registrada ainda."}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
