"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft, Clock, Trophy, Users, Plus, CheckCircle2, Swords } from "lucide-react";
import clsx from "clsx";
import { useParams } from "next/navigation";

export default function CompetitionDetailsPage() {
    const { id } = useParams();
    const [competition, setCompetition] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("matches");
    const [currentUser, setCurrentUser] = useState(null);
    const [standings, setStandings] = useState([]);


    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    async function fetchData() {
        // 1. Fetch Competition
        const { data: comp } = await supabase
            .from('competitions')
            .select('*, games(title, cover_url), profiles(username)')
            .eq('id', id)
            .single();
        setCompetition(comp);

        // 2. Fetch Participants
        const { data: parts } = await supabase
            .from('competition_participants')
            .select('*, profiles(username, avatar_url, id)')
            .eq('competition_id', id);
        setParticipants(parts || []);

        // 3. Fetch Matches
        const { data: matchesData } = await supabase
            .from('matches')
            .select(`
        id, score1, score2, status, match_date, player1_id, player2_id,
        p1:player1_id(username),
        p2:player2_id(username)
      `)
            .eq('competition_id', id)
            .order('created_at', { ascending: false });
        setMatches(matchesData || []);

        setMatches(matchesData || []);

        // 4. Check Current User
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // 5. Calculate Standings
        calculateStandings(parts || [], matchesData || []);

        setLoading(false);
    }

    function calculateStandings(parts, matches) {
        // Initialize stats
        const stats = {};
        parts.forEach(p => {
            stats[p.user_id] = {
                ...p,
                points: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                played: 0,
                total_round_wins: 0 // New stat for cumulative
            };
        });

        // Process matches
        matches.forEach(m => {
            // Only count finished matches (assuming score exists implies finished, or add status check)
            if ((m.status === 'finished' || (m.score1 !== undefined && m.score2 !== undefined)) && m.status !== 'scheduled') {
                const p1 = stats[m.player1_id];
                const p2 = stats[m.player2_id];

                if (p1 && p2) {
                    p1.played++;
                    p2.played++;

                    if (competition?.format === 'pontos_corridos_cumulative') {
                        // Cumulative Logic
                        p1.total_round_wins += (m.score1 || 0);
                        p2.total_round_wins += (m.score2 || 0);
                    } else {
                        // Standard Logic
                        if (m.score1 > m.score2) {
                            p1.wins++;
                            p1.points += 3;
                            p2.losses++;
                        } else if (m.score2 > m.score1) {
                            p2.wins++;
                            p2.points += 3;
                            p1.losses++;
                        } else {
                            p1.draws++;
                            p1.points += 1;
                            p2.draws++;
                            p2.points += 1;
                        }
                    }
                }
            }
        });

        // Post-process Cumulative Points
        if (competition?.format === 'pontos_corridos_cumulative') {
            Object.values(stats).forEach(p => {
                p.points = Math.floor(p.total_round_wins / 10);
            });
            // Sort by Points desc, then Total Round Wins desc
            const sorted = Object.values(stats).sort((a, b) => b.points - a.points || b.total_round_wins - a.total_round_wins);
            setStandings(sorted);
        } else {
            // Standard Sort
            const sorted = Object.values(stats).sort((a, b) => b.points - a.points || b.wins - a.wins);
            setStandings(sorted);
        }
    }

    async function handleFinish() {
        if (!confirm("Tem certeza que deseja finalizar esta competição?")) return;

        // Determine winner
        let winnerId = null;
        if (standings.length > 0) {
            if (competition?.format === 'pontos_corridos_cumulative') {
                // Check win condition (>= 2 points)
                if (standings[0].points >= 2) {
                    winnerId = standings[0].user_id;
                } else {
                    if (!confirm("O líder ainda não atingiu 2 pontos. Deseja finalizar mesmo assim?")) return;
                    winnerId = standings[0].user_id;
                }
            } else {
                winnerId = standings[0].user_id;
            }
        }

        const { data, error } = await supabase
            .from('competitions')
            .update({
                status: 'finished',
                winner_id: winnerId
            })
            .eq('id', id)
            .select();

        console.log("Finish result:", { data, error });

        if (error) alert("Erro ao finalizar: " + error.message);
        else if (data.length === 0) alert("Erro: Você não tem permissão para finalizar esta competição (RLS).");
        else {
            alert("Competição finalizada!");
            fetchData();
        }
    }

    async function handleDelete() {
        if (!confirm("Tem certeza que deseja EXCLUIR esta competição? Essa ação não pode ser desfeita.")) return;
        const { data, error } = await supabase
            .from('competitions')
            .delete()
            .eq('id', id)
            .select();

        console.log("Delete result:", { data, error });

        if (error) alert("Erro ao excluir: " + error.message);
        else if (data.length === 0) alert("Erro: Você não tem permissão para excluir esta competição (RLS).");
        else {
            alert("Competição excluída.");
            window.location.href = '/competitions';
        }
    }


    if (loading) return (
        <div className="min-h-screen bg-background pt-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
    );

    if (!competition) return <div className="pt-20 text-center">Competition not found</div>;

    return (
        <main className="min-h-screen bg-background pt-20 pb-12">
            <Navbar />

            {/* Hero Header */}
            <div className="relative h-64 md:h-80 w-full mb-8">
                <div className="absolute inset-0">
                    {competition.games?.cover_url && (
                        <img src={competition.games.cover_url} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-black/40"></div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Link href="/competitions" className="inline-flex items-center text-sm text-white/70 hover:text-white mb-4 transition-colors">
                            <ArrowLeft size={16} className="mr-1" /> Voltar para Lista
                        </Link>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <span className={clsx("font-bold tracking-wider text-xs uppercase mb-2 block", competition.status === 'finished' ? "text-green-400" : "text-primary")}>
                                    {competition.status === 'finished' ? 'COMPETIÇÃO FINALIZADA' : `Torneio ${competition.format.replace('_', ' ')}`}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{competition.name}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-300">
                                    <span className="flex items-center gap-1.5"><Gamepad2Icon size={16} /> {competition.games?.title}</span>
                                    <span className="flex items-center gap-1.5"><Users size={16} /> {participants.length} Jogadores</span>
                                    <span className="flex items-center gap-1.5"><Trophy size={16} /> Organizado por {competition.profiles?.username}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                {currentUser?.id === competition.organizer_id && (
                                    <>
                                        <button onClick={handleDelete} className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-3 rounded-xl font-bold transition-all">
                                            Excluir
                                        </button>
                                        {competition.status !== 'finished' && (
                                            <button onClick={handleFinish} className="bg-green-500/20 hover:bg-green-500/30 text-green-500 px-4 py-3 rounded-xl font-bold transition-all">
                                                Concluir
                                            </button>
                                        )}
                                    </>
                                )}

                                <Link
                                    href={`/competitions/${id}/report`}
                                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/25 transition-all"
                                >
                                    <Plus size={20} /> Registrar Partida
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-8 overflow-x-auto">
                    {['Partidas', 'Classificação', 'Chaves', 'Jogadores'].map((tab) => {
                        const key = tab.toLowerCase().split(' ')[0]; // matches, standings, bracket
                        const tabKeyMap = {
                            'partidas': 'matches',
                            'classificação': 'standings',
                            'chaves': 'bracket',
                            'jogadores': 'players'
                        };
                        const activeKey = tabKeyMap[tab.toLowerCase()] || tab.toLowerCase();

                        return (
                            <button
                                key={activeKey}
                                onClick={() => setActiveTab(activeKey)}
                                className={clsx(
                                    "px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                    activeTab === activeKey ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-white"
                                )}
                            >
                                {tab}
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <div className="min-h-[400px]">

                    {activeTab === 'matches' && (
                        <div className="space-y-8">
                            {/* Scheduled Matches */}
                            {matches.filter(m => m.status === 'scheduled').length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 pl-1">Partidas Agendadas</h3>
                                    <div className="space-y-3">
                                        {matches.filter(m => m.status === 'scheduled').map((match) => (
                                            <div key={match.id} className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors border border-white/5">
                                                <div className="flex items-center gap-4 md:gap-8 flex-1">
                                                    <div className="flex-1 text-right font-medium text-white/70">
                                                        {match.p1?.username || "TBD"}
                                                    </div>
                                                    <div className="px-3 py-1 text-sm font-bold text-muted-foreground">
                                                        VS
                                                    </div>
                                                    <div className="flex-1 text-left font-medium text-white/70">
                                                        {match.p2?.username || "TBD"}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <Link
                                                        href={`/competitions/${id}/report?matchId=${match.id}`}
                                                        className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/50 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                                                    >
                                                        <Swords size={14} /> Jogar
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Finished Matches */}
                            <div>
                                {matches.some(m => m.status !== 'scheduled') && (
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 pl-1">Resultados</h3>
                                )}

                                {matches.filter(m => m.status !== 'scheduled').length > 0 ? (
                                    <div className="space-y-3">
                                        {matches.filter(m => m.status !== 'scheduled').map((match) => (
                                            <div key={match.id} className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-8 flex-1">
                                                    <div className="flex-1 text-right font-medium text-lg">
                                                        {match.p1?.username || "TBD"}
                                                    </div>
                                                    <div className="bg-black/40 rounded px-3 py-1 text-xl font-mono tracking-widest border border-white/10">
                                                        {match.score1} - {match.score2}
                                                    </div>
                                                    <div className="flex-1 text-left font-medium text-lg">
                                                        {match.p2?.username || "TBD"}
                                                    </div>
                                                </div>
                                                <div className="ml-8 text-xs text-muted-foreground hidden md:block">
                                                    {new Date(match.match_date || Date.now()).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : matches.length === 0 && (
                                    <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
                                        <p className="text-muted-foreground">Nenhuma partida registrada ainda.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'standings' && (
                        <div className="glass-card rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="p-4">Posição</th>
                                        <th className="p-4">Jogador</th>
                                        {competition.format === 'pontos_corridos_cumulative' ? (
                                            <>
                                                <th className="p-4 text-center">Rounds (V)</th>
                                                <th className="p-4 text-center">Pontos (Meta: 2)</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="p-4 text-center">V</th>
                                                <th className="p-4 text-center">D</th>
                                                <th className="p-4 text-center">Pontos</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map((p, idx) => (
                                        <tr key={p.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-mono text-muted-foreground">#{idx + 1}</td>
                                            <td className="p-4 font-bold flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs">
                                                    {p.profiles?.username?.[0]}
                                                </div>
                                                {p.profiles?.username}
                                                {idx === 0 && <Trophy size={14} className="text-yellow-400" />}
                                            </td>

                                            {competition.format === 'pontos_corridos_cumulative' ? (
                                                <>
                                                    <td className="p-4 text-center text-blue-400 font-bold">{p.total_round_wins}</td>
                                                    <td className="p-4 text-center text-white font-bold text-lg">
                                                        {p.points} <span className="text-xs text-muted-foreground font-normal">/ 2</span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="p-4 text-center text-green-400">{p.wins}</td>
                                                    <td className="p-4 text-center text-red-400">{p.losses}</td>
                                                    <td className="p-4 text-center text-white font-bold">{p.points} Pts</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    )}

                    {activeTab === 'players' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {participants.map(p => (
                                <div key={p.id} className="glass-card p-4 rounded-xl flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                                        {p.profiles?.username?.[0]}
                                    </div>
                                    <span className="font-medium">{p.profiles?.username}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'bracket' && (
                        <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
                            <p className="text-muted-foreground">Chaves em breve...</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
            /* Custom Scrollbar for Tabs */
            .overflow-x-auto::-webkit-scrollbar {
                height: 4px;
            }
            .overflow-x-auto::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
            }
            .overflow-x-auto::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
            }
            `}</style>
        </main>
    );
}

function Gamepad2Icon({ size }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12"></line><line x1="8" x2="8" y1="10" y2="14"></line><line x1="15" x2="15.01" y1="13" y2="13"></line><line x1="18" x2="18.01" y1="11" y2="11"></line><rect width="20" height="12" x="2" y="6" rx="2"></rect></svg>
    )
}
