import { BarChart3, Bot, Building2, Calendar, Clock, Plus, Sparkles, User, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { mockUser, mockLeads, mockEventos, getTemperaturaLabel, formatCurrency, timeAgo } from "@/lib/mock-data";

function BriefingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-coral-light p-4 card-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-coral">
          <Bot size={20} className="text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground mb-1">Briefing do Dia</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bom dia, {mockUser.nome}! Você tem 2 compromissos hoje. João Silva está quente — priorize a visita das 10h. Meta do mês está em 70%.
          </p>
          <button className="mt-3 text-sm font-semibold text-primary">
            Ver detalhes →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AgendaSection() {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-3">Agenda de Hoje</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {mockEventos.map((ev) => (
          <div
            key={ev.id}
            className="min-w-[200px] rounded-2xl bg-card p-4 card-shadow border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {new Date(ev.data_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                ev.tipo === "visita" ? "bg-coral-light text-primary" : "bg-blue-50 text-blue-600"
              }`}>
                {ev.tipo === "visita" ? "Visita" : "Reunião"}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">{ev.titulo}</p>
          </div>
        ))}
        <button className="min-w-[120px] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <Plus size={20} />
          <span className="text-xs font-medium">Novo evento</span>
        </button>
      </div>
    </div>
  );
}

function LeadsSection() {
  const topLeads = mockLeads.slice(0, 3);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-foreground">Leads para Contatar</h2>
        <Link to="/leads" className="text-sm font-semibold text-primary">
          Ver todos →
        </Link>
      </div>
      <div className="space-y-3">
        {topLeads.map((lead, i) => {
          const temp = getTemperaturaLabel(lead.temperatura);
          return (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl bg-card p-4 card-shadow border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral-light text-primary font-bold text-base">
                  {lead.nome.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{lead.nome}</p>
                    <span className="text-sm">{temp.emoji}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatCurrency(lead.orcamento)} · {lead.bairros[0]}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    <Clock size={10} className="inline mr-1" />
                    {timeAgo(lead.ultima_interacao)}
                  </p>
                </div>
                <button className="shrink-0 rounded-xl bg-coral-light px-3 py-2 text-xs font-semibold text-primary">
                  Script
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ShortcutsSection() {
  const shortcuts = [
    { icon: User, label: "Novo Lead", path: "/leads" },
    { icon: Building2, label: "Novo Imóvel", path: "/imoveis" },
    { icon: Sparkles, label: "Gerar Script", path: "/assistente" },
    { icon: BarChart3, label: "Calc. Meta", path: "/metas" },
  ];
  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-3">Atalhos</h2>
      <div className="grid grid-cols-2 gap-3">
        {shortcuts.map((s) => (
          <Link
            key={s.label}
            to={s.path}
            className="flex items-center gap-3 rounded-2xl bg-card p-4 card-shadow border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-light">
              <s.icon size={18} className="text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { Building2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bom dia, {mockUser.nome} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Vamos fechar negócios hoje!
          </p>
        </div>
        <Link
          to="/metas"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
        >
          <BarChart3 size={20} className="text-foreground" />
        </Link>
      </div>

      <div className="space-y-6">
        <BriefingCard />
        <AgendaSection />
        <LeadsSection />
        <ShortcutsSection />
      </div>
    </div>
  );
}
