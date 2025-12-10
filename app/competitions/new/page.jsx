"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Check, ChevronRight, Gamepad2, Trophy, Users } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function CreateCompetitionPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data
    const [games, setGames] = useState([]);
    const [profiles, setProfiles] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        game_id: null,
        format: "1v1",
        participants: [] // Array of user_ids
    });

    useEffect(() => {
        async function loadData() {
            // Load Games
            const { data: gamesData } = await supabase.from('games').select('id, title, cover_url');
            setGames(gamesData || []);

            // Load Profiles (Potential participants) using Client Side simply (assuming small friend group)
            const { data: profilesData } = await supabase.from('profiles').select('id, username, avatar_url');
            setProfiles(profilesData || []);
        }
        loadData();
    }, []);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Create Competition
            const { data: comp, error: compError } = await supabase
                .from('competitions')
                .insert({
                    name: formData.name,
                    game_id: formData.game_id,
                    format: formData.format,
                    organizer_id: user.id,
                    status: 'draft'
                })
                .select()
                .single();

            if (compError) throw compError;

            // 2. Add Participants
            if (formData.participants.length > 0) {
                const participantsData = formData.participants.map(uid => ({
                    competition_id: comp.id,
                    user_id: uid
                }));

                const { error: partError } = await supabase
                    .from('competition_participants')
                    .insert(participantsData);

                if (partError) throw partError;
            }

            router.push(`/competitions/${comp.id}`);

        } catch (err) {
            alert("Error creating: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background pt-20 pb-12">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <Link href="/competitions" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Cancelar
                </Link>

                {/* Progress Bar */}
                <div className="glass-card rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-8 overflow-hidden">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex flex-col items-center gap-2 relative z-10 w-1/3">
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500",
                                    s <= step ? "bg-primary text-white" : "bg-white/10 text-muted-foreground"
                                )}>
                                    {s < step ? <Check size={18} /> : s}
                                </div>
                                <span className={clsx("text-xs font-medium uppercase tracking-wider", s <= step ? "text-primary" : "text-muted-foreground")}>
                                    {s === 1 ? "Jogo" : s === 2 ? "Detalhes" : "Jogadores"}
                                </span>
                            </div>
                        ))}
                        {/* Line */}
                        <div className="absolute top-[86px] left-[16%] right-[16%] h-[2px] bg-white/10 -z-0">
                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                        </div>
                    </div>

                    {/* Steps Content */}
                    <div className="min-h-[300px]">
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4">
                                <h2 className="text-2xl font-bold mb-6">Escolha um Jogo</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {games.map(game => (
                                        <div
                                            key={game.id}
                                            onClick={() => setFormData({ ...formData, game_id: game.id })}
                                            className={clsx(
                                                "cursor-pointer rounded-xl border p-4 transition-all hover:scale-[1.02]",
                                                formData.game_id === game.id
                                                    ? "border-primary bg-primary/10 ring-2 ring-primary/50"
                                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                            )}
                                        >
                                            <div className="relative aspect-video w-full mb-3 rounded-lg overflow-hidden bg-black/20">
                                                {game.cover_url ? (
                                                    <img src={game.cover_url} className="w-full h-full object-cover" />
                                                ) : <Gamepad2 className="m-auto mt-4 text-muted-foreground" />}
                                            </div>
                                            <p className="font-bold text-center text-sm">{game.title}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                                <h2 className="text-2xl font-bold">Detalhes da Competição</h2>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nome da Competição</label>
                                    <input
                                        type="text"
                                        className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Ex: Torneio de Sábado"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Formato</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['1v1', 'Times', 'Pontos Corridos', 'Chaves'].map(fmt => (
                                            <div
                                                key={fmt}
                                                onClick={() => setFormData({ ...formData, format: fmt.toLowerCase().replace(' ', '_') })}
                                                className={clsx(
                                                    "p-4 rounded-xl border cursor-pointer transition-all text-center",
                                                    formData.format === fmt.toLowerCase().replace(' ', '_')
                                                        ? "border-primary bg-primary/10 text-primary font-bold"
                                                        : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
                                                )}
                                            >
                                                {fmt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4">
                                <h2 className="text-2xl font-bold mb-6">Selecionar Jogadores</h2>
                                <div className="space-y-2 h-[300px] overflow-y-auto pr-2">
                                    {profiles.map(profile => (
                                        <div
                                            key={profile.id}
                                            onClick={() => {
                                                const exists = formData.participants.includes(profile.id);
                                                setFormData({
                                                    ...formData,
                                                    participants: exists
                                                        ? formData.participants.filter(id => id !== profile.id)
                                                        : [...formData.participants, profile.id]
                                                });
                                            }}
                                            className={clsx(
                                                "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                                                formData.participants.includes(profile.id)
                                                    ? "border-primary bg-primary/10"
                                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold border border-white/10">
                                                    {profile.avatar_url ? (
                                                        <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                                                    ) : profile.username?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="font-medium">{profile.username}</span>
                                            </div>
                                            <div className={clsx(
                                                "w-6 h-6 rounded-full border flex items-center justify-center",
                                                formData.participants.includes(profile.id)
                                                    ? "bg-primary border-primary text-white"
                                                    : "border-white/20"
                                            )}>
                                                {formData.participants.includes(profile.id) && <Check size={12} />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Navigation */}
                    <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className="px-6 py-2 rounded-lg text-sm font-medium hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Voltar
                        </button>

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={step === 1 && !formData.game_id}
                                className="bg-white text-black px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Próximo <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !formData.name}
                                className="bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 transition-all"
                            >
                                {loading ? <span className="animate-pulse">Criando...</span> : "Criar Competição"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
