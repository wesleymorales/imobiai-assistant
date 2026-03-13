import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Target, TrendingUp, Users, Eye, FileText, CheckCircle, Pencil, Bot } from "lucide-react";
import { mockUser, formatCurrency } from "@/lib/mock-data";

export default function MetasPage() {
  const valorRealizado = 2100000;
  const meta = mockUser.meta_mensal;
  const progresso = Math.round((valorRealizado / meta) * 100);
  const faltam = meta - valorRealizado;

  const metricas = [
    { icon: Users, label: "Leads ativos", value: "4" },
    { icon: Eye, label: "Visitas realizadas", value: "8" },
    { icon: FileText, label: "Propostas enviadas", value: "3" },
    { icon: CheckCircle, label: "Fechamentos", value: "1" },
  ];

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Minhas Metas</h1>

      {/* Meta Mensal Card */}
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
        <p className="text-3xl font-bold text-foreground mb-1">
          {formatCurrency(valorRealizado)}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          de {formatCurrency(meta)}
        </p>
        <div className="h-3 rounded-full bg-secondary overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progresso}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full gradient-coral"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Faltam {formatCurrency(faltam)} 🎯
        </p>
      </motion.div>

      {/* Metrics Grid */}
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

      {/* Calculator Card */}
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

      {/* AI Analysis */}
      <div className="rounded-2xl bg-coral-light p-4 card-shadow mb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-coral">
            <Bot size={18} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Análise do Assistente</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Você está em 70% da meta — ritmo saudável! Foque em João Silva (quente) e Maria Costa (proposta pendente). 2 fechamentos esta semana te colocam no caminho certo. 💪
            </p>
          </div>
        </div>
      </div>

      {/* History Chart Placeholder */}
      <div className="rounded-2xl bg-card p-5 card-shadow border border-border mb-8">
        <p className="text-base font-bold text-foreground mb-3">Histórico</p>
        <div className="flex items-end gap-2 h-32">
          {[60, 45, 80, 95, 70, 55].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg gradient-coral"
                style={{ height: `${h}%` }}
              />
              <span className="text-[10px] text-muted-foreground">
                {["Out", "Nov", "Dez", "Jan", "Fev", "Mar"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
