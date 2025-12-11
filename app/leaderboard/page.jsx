"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Trophy, Crown, Medal, AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function LeaderboardPage() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    async function fetchLeaderboard() {
        // 1. Fetch Finished Competitions with Winners
        const { data: comps, error } = await supabase
            .from('competitions')
            .select('winner_id')
            .eq('status', 'finished')
            .not('winner_id', 'is', null);

        if (error) {
            console.error("Error fetching competitions:", error);
            setLoading(false);
            return;
        }

        if (!comps || comps.length === 0) {
            setStats([]);
            setLoading(false);
            return;
        }

        // 2. Aggregate Wins
        const winCounts = {};
        comps.forEach(c => {
            if (c.winner_id) {
                winCounts[c.winner_id] = (winCounts[c.winner_id] || 0) + 1;
            }
        });

        // 3. Fetch Profiles for Winners
        const winnerIds = Object.keys(winCounts);
        const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', winnerIds);

        const profilesMap = (profilesData || []).reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
        }, {});

        // 4. Transform to Array
        const leaderboard = winnerIds.map(id => ({
            player_id: id,
            titles: winCounts[id],
            profiles: profilesMap[id]
        })).sort((a, b) => b.titles - a.titles);

        setStats(leaderboard);
        setLoading(false);
    }

    const getRankIcon = (index) => {
        if (index === 0) return <Crown className="text-yellow-400" size={24} fill="currentColor" />;
        if (index === 1) return <Medal className="text-gray-300" size={24} />;
        if (index === 2) return <Medal className="text-amber-600" size={24} />;
        return <span className="font-mono font-bold text-gray-500">#{index + 1}</span>;
    };

    return (
        <main className="min-h-screen bg-background pt-20 pb-12">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 inline-flex items-center gap-3">
                        <Trophy className="text-yellow-500" /> Ranking Global
                    </h1>
                    <p className="text-muted-foreground mt-2">Os maiores campeões de torneios da liga.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : stats.length > 0 ? (
                    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-left">
                                    <th className="p-6 text-sm font-bold text-muted-foreground uppercase tracking-wider w-24 text-center">Posição</th>
                                    <th className="p-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Jogador</th>
                                    <th className="p-6 text-sm font-bold text-muted-foreground uppercase tracking-wider text-right">Títulos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats.map((stat, index) => {
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
                                                    <span className={clsx(
                                                        "font-bold text-lg",
                                                        index === 0 ? "text-yellow-400" : "text-foreground"
                                                    )}>
                                                        {stat.profiles?.username || "Desconhecido"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 px-4 py-2 rounded-xl border border-yellow-400/20">
                                                    <Trophy size={16} />
                                                    <span className="font-bold text-xl">{stat.titles}</span>
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
                        <p className="text-muted-foreground">Finalizem competições para aparecerem aqui!</p>
                    </div>
                )}
            </div>
        </main>
    );
}
