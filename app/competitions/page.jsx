"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Trophy, Plus, Calendar, Users, Gamepad2 } from "lucide-react";
import clsx from "clsx";

export default function CompetitionsPage() {
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompetitions();
    }, []);

    async function fetchCompetitions() {
        const { data, error } = await supabase
            .from('competitions')
            .select('*, games(title, cover_url), profiles(username)')
            .order('created_at', { ascending: false });

        if (!error) {
            setCompetitions(data || []);
        }
        setLoading(false);
    }

    return (
        <main className="min-h-screen bg-background pt-20 pb-12">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                            Competições
                        </h1>
                        <p className="text-muted-foreground mt-1">Participe de um torneio ou organize sua própria liga.</p>
                    </div>

                    <Link
                        href="/competitions/new"
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
                    >
                        <Plus size={20} />
                        Criar Competição
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse"></div>)}
                    </div>
                ) : competitions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {competitions.map((comp) => (
                            <Link href={`/competitions/${comp.id}`} key={comp.id} className="block glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all group">
                                <div className="h-32 bg-neutral-900 relative">
                                    {/* Background Image/Gradient based on Game */}
                                    {comp.games?.cover_url && (
                                        <div className="absolute inset-0 opacity-40">
                                            <img src={comp.games.cover_url} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <span className="text-xs font-bold px-2 py-1 rounded bg-black/50 backdrop-blur border border-white/10 flex items-center gap-1">
                                            <Gamepad2 size={12} className="text-primary" /> {comp.games?.title || 'Jogo Desconhecido'}
                                        </span>
                                        <span className={clsx(
                                            "text-xs font-bold px-2 py-1 rounded border",
                                            comp.status === 'active' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                comp.status === 'finished' ? "bg-neutral-800 text-muted-foreground border-white/5" :
                                                    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                        )}>
                                            {comp.status === 'active' ? 'ATIVA' : comp.status === 'finished' ? 'FINALIZADA' : 'RASCUNHO'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{comp.name}</h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5"><Trophy size={14} /> {comp.format}</span>
                                        <span className="flex items-center gap-1.5"><Users size={14} /> 8 Jogadores</span> {/* Placeholder count */}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            Organizado por <span className="text-foreground font-medium">{comp.profiles?.username || 'Desconhecido'}</span>
                                        </span>
                                        <span>{new Date(comp.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <Trophy size={48} className="mx-auto text-neutral-700 mb-4" />
                        <h3 className="text-xl font-medium mb-2">Nenhuma Competição Ainda</h3>
                        <p className="text-muted-foreground mb-6">Seja a lenda que inicia a primeira liga.</p>
                        <Link href="/competitions/new" className="text-primary hover:underline font-bold">
                            Começar Nova Competição
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
