"use client";

import { Gamepad2, Plus, Star, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function GameCard({ game, savedStatus }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(savedStatus || null); // null, 'planned', 'playing', 'completed', 'dropped'

    // Placeholder logic for cover image if valid URL isn't provided
    const coverImage = game.cover_url && game.cover_url.startsWith('http')
        ? game.cover_url
        : 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=900&auto=format&fit=crop';

    const handleStatusChange = async (newStatus) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login"); // Redirect if not logged in
                return;
            }

            if (newStatus === null) {
                return;
            }

            // Upsert mechanism (Insert or Update)
            const { error } = await supabase
                .from('backlog_items')
                .upsert({
                    user_id: user.id,
                    game_id: game.id,
                    status: newStatus
                }, { onConflict: 'user_id, game_id' });

            if (error) throw error;

            setStatus(newStatus);
        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        planned: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        playing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        completed: 'bg-green-500/20 text-green-400 border-green-500/30',
        dropped: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    return (
        <div className="glass-card rounded-xl overflow-hidden group hover:scale-[1.02] transition-transform duration-200 flex flex-col">
            <div className="relative h-48 w-full flex-shrink-0">
                <Image
                    src={coverImage}
                    alt={game.title}
                    fill
                    className="object-cover transition-opacity group-hover:opacity-80"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-xl font-bold bg-white/10 backdrop-blur-md inline-block px-2 py-1 rounded-lg border border-white/10">
                        {game.title}
                    </h3>
                </div>
            </div>

            <div className="p-4 space-y-4 flex flex-col flex-1">
                <div className="flex flex-wrap gap-2 mb-auto">
                    {game.platforms?.map(p => (
                        <span key={p} className="text-xs font-medium px-2 py-0.5 rounded bg-white/10 text-muted-foreground border border-white/5">
                            {p}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                    {status ? (
                        <div className="flex-1 relative group/select">
                            <select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                disabled={loading}
                                className={`appearance-none w-full text-sm font-bold py-2 pl-3 pr-8 rounded-lg outline-none cursor-pointer uppercase tracking-wider border transition-colors ${statusColors[status] || 'bg-white/10'}`}
                            >
                                <option value="planned" className="bg-neutral-900 text-yellow-400">Planejado</option>
                                <option value="playing" className="bg-neutral-900 text-blue-400">Jogando</option>
                                <option value="completed" className="bg-neutral-900 text-green-400">Zerado</option>
                                <option value="dropped" className="bg-neutral-900 text-red-400">Dropado</option>
                            </select>
                            {loading ? (
                                <Loader2 size={16} className="absolute right-3 top-2.5 animate-spin opacity-50" />
                            ) : (
                                <div className="absolute right-3 top-3 pointer-events-none opacity-50">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0.5L5 5.5L10 0.5H0Z" /></svg>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => handleStatusChange('planned')}
                            disabled={loading}
                            className="flex-1 text-sm bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            Adicionar ao Backlog
                        </button>
                    )}

                    {game.slug && (
                        <button className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-white" title="View Details">
                            <Gamepad2 size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
