import { BarChart3, Bot, Building2, Calendar, Clock, Plus, Sparkles, User, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, getTemperaturaLabel, timeAgo } from "@/lib/mock-data";
import NewEventoDialog from "@/components/NewEventoDialog";

function BriefingCard({ userName, leadsCount, eventosCount, metaProgress }: { userName: string; leadsCount: number; eventosCount: number; metaProgress: number }) {
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
            Bom dia, {userName}! Você tem {eventosCount} compromisso{eventosCount !== 1 ? "s" : ""} hoje e {leadsCount} lead{leadsCount !== 1 ? "s" : ""} ativo{leadsCount !== 1 ? "s" : ""}.
            {metaProgress > 0 ? ` Meta do mês está em ${metaProgress}%.` : " Configure sua meta mensal em Configurações."}
          </p>
          <Link to="/assistente" className="mt-3 text-sm font-semibold text-primary block">
            Falar com assistente →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function AgendaSection({ eventos }: { eventos: any[] }) {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-3">Agenda de Hoje</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {eventos.map((ev) => (
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
        {eventos.length === 0 && (
          <div className="min-w-[200px] rounded-2xl bg-card p-4 card-shadow border border-border text-center">
            <p className="text-sm text-muted-foreground">Nenhum evento hoje</p>
          </div>
        )}
        <NewEventoDialog />
      </div>
    </div>
  );
}

function LeadsSection({ leads }: { leads: any[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-foreground">Leads para Contatar</h2>
        <Link to="/leads" className="text-sm font-semibold text-primary">
          Ver todos →
        </Link>
      </div>
      {leads.length === 0 ? (
        <div className="rounded-2xl bg-card p-6 card-shadow border border-border text-center">
          <p className="text-sm text-muted-foreground mb-2">Nenhum lead cadastrado</p>
          <Link to="/leads" className="text-sm font-semibold text-primary">Adicionar lead →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead, i) => {
            const temp = getTemperaturaLabel(lead.temperatura ?? 50);
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
                      {lead.orcamento ? formatCurrency(lead.orcamento) : "Sem orçamento"} · {lead.bairros?.[0] || "Sem bairro"}
                    </p>
                    {lead.ultima_interacao && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        <Clock size={10} className="inline mr-1" />
                        {timeAgo(lead.ultima_interacao)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
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

export default function HomePage() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId!).single();
      return data;
    },
    enabled: !!userId,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads-home", userId],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("*").eq("corretor_id", userId!).order("temperatura", { ascending: false }).limit(3);
      return data || [];
    },
    enabled: !!userId,
  });

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const { data: eventos = [] } = useQuery({
    queryKey: ["eventos-home", userId],
    queryFn: async () => {
      const { data } = await supabase.from("eventos_agenda").select("*").eq("corretor_id", userId!).gte("data_inicio", startOfDay).lt("data_inicio", endOfDay).order("data_inicio");
      return data || [];
    },
    enabled: !!userId,
  });

  const userName = profile?.nome || user?.user_metadata?.nome || "Corretor";

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bom dia, {userName} 👋
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
        <BriefingCard userName={userName} leadsCount={leads.length} eventosCount={eventos.length} metaProgress={0} />
        <AgendaSection eventos={eventos} />
        <LeadsSection leads={leads} />
        <ShortcutsSection />
      </div>
    </div>
  );
}
