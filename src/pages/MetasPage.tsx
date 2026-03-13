import { motion } from "framer-motion";
import { Target, Users, Eye, FileText, CheckCircle, Pencil, Bot } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/mock-data";
import { Link } from "react-router-dom";

export default function MetasPage() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: leadsCount = 0 } = useQuery({
    queryKey: ["leads-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("corretor_id", user!.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const meta = profile?.meta_mensal ?? 0;

  const metricas = [
    { icon: Users, label: "Leads ativos", value: String(leadsCount) },
    { icon: Eye, label: "Visitas realizadas", value: "0" },
    { icon: FileText, label: "Propostas enviadas", value: "0" },
    { icon: CheckCircle, label: "Fechamentos", value: "0" },
  ];

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Minhas Metas</h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card p-5 card-shadow border border-border mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground font-medium">Março 2026</p>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
            <Pencil size={14} className="text-muted-foreground" />
          </button>
        </div>
        {meta > 0 ? (
          <>
            <p className="text-3xl font-bold text-foreground mb-1">{formatCurrency(0)}</p>
            <p className="text-sm text-muted-foreground mb-4">de {formatCurrency(meta)}</p>
            <div className="h-3 rounded-full bg-secondary overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "0%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full gradient-coral"
              />
            </div>
            <p className="text-sm text-muted-foreground">Faltam {formatCurrency(meta)} 🎯</p>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">Configure sua meta mensal</p>
            <Link to="/config" className="text-sm font-semibold text-primary">Ir para Configurações →</Link>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {metricas.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-card p-4 card-shadow border border-border"
          >
            <m.icon size={18} className="text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground">{m.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl bg-card p-5 card-shadow border border-border mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Target size={18} className="text-primary" />
          <p className="text-base font-bold text-foreground">Calculadora de Meta</p>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Descubra quantas vendas e visitas precisa para atingir sua meta.
        </p>
        <button className="w-full rounded-2xl gradient-coral py-3.5 text-sm font-bold text-primary-foreground">
          Calcular Meta →
        </button>
      </div>

      <div className="rounded-2xl bg-coral-light p-4 card-shadow mb-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-coral">
            <Bot size={18} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Análise do Assistente</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {leadsCount > 0
                ? `Você tem ${leadsCount} lead${leadsCount !== 1 ? "s" : ""} cadastrado${leadsCount !== 1 ? "s" : ""}. Cadastre seus imóveis e comece a fechar negócios! 💪`
                : "Comece cadastrando seus leads e imóveis para acompanhar sua performance. 🚀"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
