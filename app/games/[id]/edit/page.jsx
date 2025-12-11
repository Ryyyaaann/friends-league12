"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Loader2, ArrowLeft, Image as ImageIcon, Gamepad2, Save } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditGamePage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [loading, setLoading] = useState(true); // Loading initial data
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        cover_url: "",
        platforms: "",
    });

    useEffect(() => {
        const fetchGameAndCheckUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace("/login");
                return;
            }

            // Fetch game details
            const { data: game, error } = await supabase
                .from('games')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !game) {
                alert("Game not found or error loading.");
                router.push("/games");
                return;
            }

            // Optional: Check permissions (only creator?)
            // For now, allow any logged user to edit or check created_by
            // if (game.created_by !== user.id) { ... } 

            setFormData({
                title: game.title,
                slug: game.slug,
                cover_url: game.cover_url || "",
                platforms: game.platforms?.join(', ') || "",
            });
            setLoading(false);
        };
        fetchGameAndCheckUser();
    }, [id, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const platformsArray = formData.platforms.split(',').map(p => p.trim()).filter(p => p);
            const slug = formData.slug || formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            const { data, error } = await supabase
                .from('games')
                .update({
                    title: formData.title,
                    slug: slug,
                    cover_url: formData.cover_url,
                    platforms: platformsArray
                })
                .eq('id', id)
                .select();

            console.log("Update result:", { data, error });

            if (error) throw error;

            router.push("/games");
            router.refresh();

        } catch (error) {
            alert("Error updating game: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pt-20 pb-12">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <Link href="/games" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Voltar para Biblioteca
                    </Link>
                    <h1 className="text-3xl font-bold">Editar Jogo</h1>
                    <p className="text-muted-foreground mt-1">Atualize as informações do jogo.</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl space-y-6">

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Título do Jogo</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="Ex: Elden Ring"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1 flex justify-between">
                            Slug
                            <span className="text-xs text-muted-foreground font-normal">Gerado automaticamente se vazio</span>
                        </label>
                        <input
                            type="text"
                            className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-mono text-muted-foreground"
                            placeholder="elden-ring"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        />
                    </div>

                    {/* Cover URL */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">URL da Imagem de Capa</label>
                        <div className="relative">
                            <input
                                type="url"
                                required
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                                placeholder="https://..."
                                value={formData.cover_url}
                                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                            />
                            <ImageIcon className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                        </div>
                    </div>

                    {/* Platforms */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Plataformas</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                                placeholder="PC, PS5, Xbox Series X, Switch"
                                value={formData.platforms}
                                onChange={(e) => setFormData({ ...formData, platforms: e.target.value })}
                            />
                            <Gamepad2 className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                        </div>
                        <p className="text-xs text-muted-foreground ml-1">Separe múltiplos com vírgulas.</p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Salvar Alterações</>}
                        </button>
                    </div>

                </form>
            </div>
        </main>
    );
}
