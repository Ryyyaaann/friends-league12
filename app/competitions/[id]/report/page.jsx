"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Trophy, Swords, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";

export default function ReportMatchPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const matchId = searchParams.get('matchId');

    const [loading, setLoading] = useState(false);
    const [participants, setParticipants] = useState([]);

    const [formData, setFormData] = useState({
        player1_id: "",
        player2_id: "",
        score1: 0,
        score2: 0,
    });

    useEffect(() => {
        async function loadData() {
            // 1. Load Participants
            const { data } = await supabase
                .from('competition_participants')
                .select('user_id, profiles(username, avatar_url, id)')
                .eq('competition_id', id);

            const mapped = data?.map(d => ({
                id: d.profiles.id,
                username: d.profiles.username,
                avatar_url: d.profiles.avatar_url
            })) || [];

            setParticipants(mapped);

            // 2. Load Match if matchId exists
            if (matchId) {
                const { data: match } = await supabase
                    .from('matches')
                    .select('*')
                    .eq('id', matchId)
                    .single();

                if (match) {
                    setFormData({
                        player1_id: match.player1_id,
                        player2_id: match.player2_id,
                        score1: match.score1 || 0,
                        score2: match.score2 || 0
                    });
                }
            }
        }
        loadData();
    }, [id, matchId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.player1_id === formData.player2_id) {
            alert("Select different players!");
            return;
        }
        setLoading(true);

        try {
            // Determine winner
            let winner_id = null;
            if (formData.score1 > formData.score2) winner_id = formData.player1_id;
            if (formData.score2 > formData.score1) winner_id = formData.player2_id;

            let error;

            if (matchId) {
                // Update existing match
                const { error: updateError } = await supabase
                    .from('matches')
                    .update({
                        score1: formData.score1,
                        score2: formData.score2,
                        status: 'finished',
                        match_date: new Date().toISOString(),
                        winner_id: winner_id
                    })
                    .eq('id', matchId);
                error = updateError;
            } else {
                // Create new match
                const { error: insertError } = await supabase.from('matches').insert({
                    competition_id: id,
                    player1_id: formData.player1_id,
                    player2_id: formData.player2_id,
                    score1: formData.score1,
                    score2: formData.score2,
                    status: 'finished',
                    match_date: new Date().toISOString(),
                    winner_id: winner_id
                });
                error = insertError;
            }

            if (error) throw error;

            router.push(`/competitions/${id}`);
            router.refresh();

        } catch (err) {
            alert("Error saving match: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background pt-20 pb-12">
            <Navbar />

            <div className="max-w-xl mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <Link href={`/competitions/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Voltar para Competição
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Swords className="text-primary" /> Registrar Resultado
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl space-y-8">

                    <div className="grid grid-cols-2 gap-8 relative">
                        {/* VS Badge */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-full border border-white/20 flex items-center justify-center text-xs font-bold text-muted-foreground z-10">
                            VS
                        </div>

                        {/* Player 1 */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-center block text-primary">JOGADOR 1</label>

                            <select
                                required
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={formData.player1_id}
                                onChange={(e) => setFormData({ ...formData, player1_id: e.target.value })}
                            >
                                <option value="">Selecionar Jogador</option>
                                {participants.map(p => (
                                    <option key={p.id} value={p.id}>{p.username}</option>
                                ))}
                            </select>

                            <div className="text-center">
                                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Placar</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-20 bg-background/50 border border-white/10 rounded-xl px-2 py-2 text-center text-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={formData.score1}
                                    onChange={(e) => setFormData({ ...formData, score1: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        {/* Player 2 */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-center block text-red-400">JOGADOR 2</label>

                            <select
                                required
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                value={formData.player2_id}
                                onChange={(e) => setFormData({ ...formData, player2_id: e.target.value })}
                            >
                                <option value="">Selecionar Jogador</option>
                                {participants.map(p => (
                                    <option key={p.id} value={p.id}>{p.username}</option>
                                ))}
                            </select>

                            <div className="text-center">
                                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Placar</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-20 bg-background/50 border border-white/10 rounded-xl px-2 py-2 text-center text-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    value={formData.score2}
                                    onChange={(e) => setFormData({ ...formData, score2: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Enviar Resultado"}
                        </button>
                    </div>

                </form>
            </div>
        </main>
    );
}
