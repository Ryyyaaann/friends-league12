"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, Save, Loader2, ImageIcon } from "lucide-react";

export default function ProfileEditModal({ profile, onClose, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: profile.username || "",
        avatar_url: profile.avatar_url || "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    username: formData.username,
                    avatar_url: formData.avatar_url,
                })
                .eq('id', profile.id);

            if (error) throw error;

            onUpdate(formData); // Optimistic update or trigger refresh
            onClose();
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar perfil: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1E1629] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h3 className="text-xl font-bold text-white">Editar Perfil</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Nome de Usuário</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 transition-all placeholder:text-gray-600"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">URL do Avatar</label>
                        <div className="relative">
                            <input
                                type="url"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 transition-all placeholder:text-gray-600"
                                placeholder="https://..."
                                value={formData.avatar_url}
                                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                            />
                            <ImageIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                        <p className="text-xs text-gray-500 ml-1">
                            Recomendado: Use uma imagem quadrada.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
