"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Trophy, Crosshair, TrendingUp, Zap, Plus, Calendar, Gamepad2, ArrowRight } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ wins: 0, losses: 0, total_matches: 0, active_competitions: 0 });

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setUser(user);
      // Fetch Stats
      const { data: stat } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_id', user.id)
        .single();

      // Fetch Active Competitions count (placeholder logic, assuming we count competitions user is part of)
      // For now just hardcoding or simpler query if needed. 
      // Let's rely on what we can get easily or default to 0.

      setStats({
        wins: stat?.wins || 0,
        losses: stat?.losses || 0,
        total_matches: stat?.total_matches || 0,
        active_competitions: 0
      });
    }

    setLoading(false);
  }

  // Loading State
  if (loading) return (
    <main className="min-h-screen bg-background pt-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
    </main>
  );

  // Authenticated Dashboard View
  if (user) {
    const winRate = stats.total_matches > 0
      ? ((stats.wins / stats.total_matches) * 100).toFixed(1)
      : "0.0";

    return (
      <main className="min-h-screen bg-[#130d1d] pt-24 pb-12 font-sans text-white">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="w-full bg-gradient-to-r from-[#7C3AED] to-[#4C1D95] rounded-2xl p-8 mb-8 shadow-2xl flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
              Bem-vindo, {user.user_metadata?.username || "Player"}! <span className="text-2xl">👋</span>
            </h1>
            <p className="text-white/80">Pronto para dominar as competições?</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Trophy} value={stats.wins} label="Vitórias" color="text-yellow-400" />
            <StatCard icon={Crosshair} value={stats.losses} label="Derrotas" color="text-red-400" />
            <StatCard icon={TrendingUp} value={`${winRate}%`} label="Taxa de Vitória" color="text-green-400" />
            <StatCard icon={Zap} value={stats.active_competitions} label="Competições Ativas" color="text-purple-400" />
          </div>

          {/* Actions Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Link href="/competitions/new" className="group relative overflow-hidden rounded-2xl bg-[#9F21E3] hover:bg-[#9F21E3]/90 transition-all p-6 flex items-center gap-4 shadow-lg hover:shadow-[#9F21E3]/25">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md transition-transform group-hover:scale-110">
                <Plus size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Criar Nova Competição</h3>
                <p className="text-white/70 text-sm">Organize um novo torneio</p>
              </div>
            </Link>

            <Link href="/competitions" className="group relative overflow-hidden rounded-2xl bg-[#4F46E5] hover:bg-[#4F46E5]/90 transition-all p-6 flex items-center gap-4 shadow-lg hover:shadow-[#4F46E5]/25">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md transition-transform group-hover:scale-110">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Registrar Partida</h3>
                <p className="text-white/70 text-sm">Adicione um novo resultado</p>
              </div>
            </Link>
          </div>

          {/* Minhas Competições */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Minhas Competições</h2>
              <Link href="/competitions" className="text-sm text-[#A78BFA] hover:text-white transition-colors">Ver todas</Link>
            </div>
            <div className="bg-[#1E1629] rounded-2xl p-12 text-center border border-white/5 flex flex-col items-center justify-center text-gray-500">
              <Trophy size={48} className="mb-4 opacity-20" />
              <p className="mb-2">Você ainda não está participando de nenhuma competição</p>
              <Link href="/competitions" className="text-[#A78BFA] text-sm hover:underline">Explorar competições</Link>
            </div>
          </div>

          {/* Partidas Recentes */}
          <div>
            <h2 className="text-xl font-bold mb-4">Partidas Recentes</h2>
            <div className="bg-[#1E1629] rounded-2xl p-12 text-center border border-white/5 flex flex-col items-center justify-center text-gray-500">
              <Calendar size={48} className="mb-4 opacity-20" />
              <p>Nenhuma partida registrada ainda</p>
            </div>
          </div>

        </div>
      </main>
    );
  }

  // Landing Page View (Original)
  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center text-center space-y-8 py-20">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-purple-600 blur opacity-25 animate-pulse"></div>
            <span className="relative px-4 py-1.5 rounded-full text-sm font-medium border border-white/10 bg-white/5 backdrop-blur-sm">
              v1.1 Released 🚀
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Eleve o Nível das Suas <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Rivalidades Gamer
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground">
            A plataforma definitiva para acompanhar campeonatos, organizar torneios e compartilhar seu backlog com amigos. Chega de planilhas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8">
            <Link href="/signup" className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
              Começar a Competir
            </Link>
            <Link href="/games" className="px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-bold text-lg hover:bg-secondary/80 transition-all border border-white/10">
              Explorar Jogos
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {[
            { title: "Torneios", desc: "Crie chaves, pontos corridos ou formatos 1v1 simples." },
            { title: "Gerenciador de Backlog", desc: "Acompanhe o que você está jogando, zerou ou dropou." },
            { title: "Estatísticas Globais", desc: "Veja quem é o verdadeiro campeão entre seus amigos." },
          ].map((feature, i) => (
            <div key={i} className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300">
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="bg-[#2A1B3D]/50 border border-white/5 rounded-xl p-5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className={`absolute top-4 right-4 p-2 rounded-lg bg-white/5 ${color} opacity-80`}>
        <Icon size={20} />
      </div>
      <div className="mt-auto relative z-10">
        <div className="text-3xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
    </div>
  );
}
