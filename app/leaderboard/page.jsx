"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Trophy, Crown, Medal, TrendingUp, AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function LeaderboardPage() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    async function fetchLeaderboard() {
        // 1. Fetch Stats
        const { data: statsData, error: statsError } = await supabase
            .from('player_stats')
            .select('*')
            .order('wins', { ascending: false })
            .order('win_rate', { ascending: false });

        if (statsError) {
            console.error("Error fetching stats:", statsError);
            setLoading(false);
            return;
        }

        if (!statsData || statsData.length === 0) {
            setStats([]);
            setLoading(false);
            return;
        }

        // 2. Fetch Profiles for these players
        const playerIds = statsData.map(s => s.player_id);
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', playerIds);

        if (profilesError) {
            console.error("Error fetching profiles:", profilesError);
            // We can still show stats with "Unknown" user if profile fails, but let's try to map what we can
        }

        // 3. Merge Data
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
        }, {});

        const combinedData = statsData.map(stat => ({
            ...stat,
            profiles: profilesMap[stat.player_id] || null
        }));

        setStats(combinedData);
        setLoading(false);
    }

    const getRankIcon = (index) => {
        if (index === 0) return <Crown className="text-yellow-400" size={24} fill="currentColor" />;
        if (index === 1) return <Medal className="text-gray-300" size={24} />;
        if (index === 2) return <Medal className="text-amber-600" size={24} />;
        return <span className="font-mono font-bold text-gray-500">#{index + 1}</span>;
    };

    return (
        <main className="min-h-screen bg-[#130d1d] pt-20 pb-12 text-white font-sans">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 inline-flex items-center gap-3">
                        <Trophy className="text-yellow-500" /> Ranking Global
                    </h1>
                    <p className="text-gray-400 mt-2">Os maiores campeões da liga.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : stats.length > 0 ? (
                    <div className="bg-[#1E1629] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-left">
                                    <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-wider w-24 text-center">Posição</th>
                                    <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-wider">Jogador</th>
                                    <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-wider text-center">Vitórias</th>
                                    <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-wider text-center">Derrotas</th>
                                    <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Aproveitamento</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats.map((stat, index) => {
                                    // Calculate rate manually just to be display-safe
                                    const total = stat.wins + stat.losses;
                                    const rate = total > 0 ? Math.round((stat.wins / total) * 100) : 0;

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
                                                                    "border-white/10 bg-white/5 text-gray-400"
                                                    )}>
                                                        {stat.profiles?.avatar_url ? (
                                                            <img src={stat.profiles.avatar_url} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            stat.profiles?.username?.[0]?.toUpperCase()
                                                        )}
                                                    </div>
                                                    <span className={clsx(
                                                        "font-bold text-lg",
                                                        index === 0 ? "text-yellow-400" : "text-white"
                                                    )}>
                                                        {stat.profiles?.username || "Desconhecido"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center font-bold text-green-400 text-lg">
                                                {stat.wins}
                                            </td>
                                            <td className="p-6 text-center font-bold text-red-400 text-lg">
                                                {stat.losses}
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/10 group-hover:border-white/20 transition-colors">
                                                    <TrendingUp size={14} className={rate >= 50 ? "text-green-400" : "text-red-400"} />
                                                    <span className="font-mono font-bold">{rate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[#1E1629] rounded-2xl border border-dashed border-white/10">
                        <AlertCircle size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-medium mb-2 text-white">Ranking Vazio</h3>
                        <p className="text-gray-400">Joguem algumas partidas para popular o ranking!</p>
                    </div>
                )}
            </div>
        </main>
    );
}
