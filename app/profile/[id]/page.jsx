"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Gamepad2, Trophy, Crosshair, Ban, Clock, CheckCircle2, TrendingUp, Calendar, Edit2, User } from "lucide-react";
import { useParams } from "next/navigation";
import clsx from "clsx";

import ProfileEditModal from "@/components/profile/ProfileEditModal";

export default function ProfilePage() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [backlog, setBacklog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("backlog");

    // Edit Mode State
    const [isOwner, setIsOwner] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    async function fetchData() {
        setLoading(true);
        // 0. Check Auth & Ownership
        const { data: { user } } = await supabase.auth.getUser();
        setIsOwner(user?.id === id);

        // 1. Profile
        const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
        setProfile(prof);

        // 2. Stats (from View)
        const { data: stat } = await supabase
            .from('player_stats')
            .select('*')
            .eq('player_id', id)
            .single();
        setStats(stat || { wins: 0, losses: 0, total_matches: 0 });

        // 3. Backlog
        const { data: backlogData } = await supabase
            .from('backlog_items')
            .select('*, games(*)')
            .eq('user_id', id);
        setBacklog(backlogData || []);

        setLoading(false);
    }

    const handleProfileUpdate = (updatedData) => {
        setProfile({ ...profile, ...updatedData });
    };

    if (loading) return (
        <div className="min-h-screen bg-background pt-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
    );

    if (!profile) return <div className="pt-20 text-center">User not found</div>;

    const winRate = stats.total_matches > 0
        ? ((stats.wins / stats.total_matches) * 100).toFixed(1)
        : "0.0";

    const StatCard = ({ icon: Icon, value, label, color }) => (
        <div className="bg-[#2A1B3D]/50 border border-white/5 rounded-xl p-5 flex flex-col justify-between h-28 relative overflow-hidden group">
            <div className={`absolute top-4 right-4 p-2 rounded-lg bg-white/5 ${color} opacity-80`}>
                <Icon size={20} />
            </div>
            <div className="mt-auto">
                <div className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">{value}</div>
                <div className="text-sm text-gray-400">{label}</div>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#130d1d] pt-20 pb-12 text-white font-sans">
            <Navbar />

            {isEditing && (
                <ProfileEditModal
                    profile={profile}
                    onClose={() => setIsEditing(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Card */}
                <div className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] rounded-2xl p-8 mb-8 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-white/20 p-1 flex-shrink-0 backdrop-blur-sm">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-[#A78BFA] flex items-center justify-center text-3xl font-bold text-white">
                                    {profile.username?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white mb-1">{profile.username}</h1>
                            <p className="text-white/80 text-sm mb-1">{profile.email || "user@example.com"}</p>
                            <p className="text-white/60 text-xs">Membro desde {new Date(profile.created_at).toLocaleDateString()}</p>
                        </div>

                        {isOwner && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 backdrop-blur-md border border-white/20"
                            >
                                <Edit2 size={14} /> Editar Perfil
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <StatCard icon={Trophy} value={stats.wins} label="Vitórias Totais" color="text-yellow-400" />
                    <StatCard icon={Crosshair} value={stats.losses} label="Derrotas Totais" color="text-red-400" />
                    <StatCard icon={TrendingUp} value={`${winRate}%`} label="Taxa de Vitória" color="text-green-400" />
                    <StatCard icon={Calendar} value={stats.total_matches} label="Partidas Jogadas" color="text-blue-400" />
                </div>

                {/* Tabs */}
                <div className="border-b border-white/10 mb-8 overflow-x-auto">
                    <div className="flex gap-8 min-w-max">
                        {['statistics', 'history', 'competitions', 'backlog'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "pb-3 text-sm font-medium transition-all relative capitalize",
                                    activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
                                )}
                            >
                                {tab === 'statistics' && <span className="flex items-center gap-2"><TrendingUp size={16} /> Estatísticas</span>}
                                {tab === 'history' && <span className="flex items-center gap-2"><Calendar size={16} /> Histórico</span>}
                                {tab === 'competitions' && <span className="flex items-center gap-2"><Trophy size={16} /> Competições</span>}
                                {tab === 'backlog' && <span className="flex items-center gap-2"><Gamepad2 size={16} /> Backlog</span>}

                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8B5CF6] rounded-t-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in duration-300">
                    {activeTab === 'statistics' && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">Estatísticas por Jogo</h3>
                                <div className="bg-[#1E1629] rounded-xl p-12 text-center border border-white/5 flex flex-col items-center justify-center text-gray-500">
                                    <Gamepad2 size={48} className="mb-4 opacity-20" />
                                    <p>Nenhuma partida registrada ainda</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">Confronto Direto (H2H)</h3>
                                <div className="bg-[#1E1629] rounded-xl p-12 text-center border border-white/5 flex flex-col items-center justify-center text-gray-500">
                                    <User size={48} className="mb-4 opacity-20" />
                                    <p>Selecione um oponente para ver estatísticas</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'backlog' && (
                        <BacklogSection backlog={backlog} />
                    )}

                    {(activeTab === 'history' || activeTab === 'competitions') && (
                        <div className="bg-[#1E1629] rounded-xl p-20 text-center border border-white/5 text-gray-500">
                            <p>Em breve...</p>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}

function BacklogSection({ backlog }) {
    const [filter, setFilter] = useState('all'); // all, playing, completed, planned, dropped

    const statusMap = {
        'all': 'Todos',
        'playing': 'Jogando',
        'completed': 'Zerado',
        'planned': 'Planejado',
        'dropped': 'Dropado'
    };

    const filteredItems = filter === 'all'
        ? backlog
        : backlog.filter(item => item.status === filter);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-6">
                <div>
                    <h3 className="text-gray-400 font-bold mb-4 px-2 uppercase text-xs tracking-wider">Listas</h3>
                    <div className="space-y-1">
                        {Object.entries(statusMap).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={clsx(
                                    "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between group",
                                    filter === key
                                        ? "bg-[#8B5CF6] text-white shadow-lg shadow-purple-900/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {label}
                                {key !== 'all' && (
                                    <span className={clsx("text-xs px-2 py-0.5 rounded-md transition-colors", filter === key ? "bg-white/20 text-white" : "bg-white/5 text-gray-500 group-hover:text-gray-300")}>
                                        {backlog.filter(i => i.status === key).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20 rounded-xl">
                    <h4 className="font-bold text-[#A78BFA] mb-1">Dica Pro</h4>
                    <p className="text-xs text-gray-400">Arraste jogos para mudar o status rapidamente (em breve).</p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {statusMap[filter]} <span className="text-gray-500 text-sm font-normal">({filteredItems.length})</span>
                    </h2>
                </div>

                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredItems.map(item => (
                            <div key={item.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-[#2A1B3D] border border-white/5 hover:border-[#8B5CF6]/50 transition-all hover:scale-[1.02] shadow-xl">
                                {item.games?.cover_url ? (
                                    <img src={item.games.cover_url} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                        <Gamepad2 size={32} />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <h4 className="font-bold text-white text-sm line-clamp-2">{item.games?.title}</h4>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {item.games?.platforms?.slice(0, 2).map(p => (
                                            <span key={p} className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded text-white/90">{p}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className={clsx(
                                    "absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-[#130d1d]",
                                    item.status === 'playing' && "bg-blue-400",
                                    item.status === 'completed' && "bg-green-400",
                                    item.status === 'planned' && "bg-yellow-400",
                                    item.status === 'dropped' && "bg-red-400"
                                )}></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#1E1629] rounded-2xl p-20 text-center border border-white/5 flex flex-col items-center justify-center text-gray-500">
                        <Gamepad2 size={48} className="mb-4 opacity-20" />
                        <p>Nenhum jogo encontrado nesta lista.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
