import { useState } from "react";
import { Search, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getTemperaturaLabel, formatCurrency, timeAgo } from "@/lib/mock-data";
import NewLeadDialog from "@/components/NewLeadDialog";
import EditLeadDialog from "@/components/EditLeadDialog";

const filters = [
  { label: "Todos", value: "todos" },
  { label: "🔴 Quente", value: "quente" },
  { label: "🟡 Morno", value: "morno" },
  { label: "⚪ Frio", value: "frio" },
];

export default function LeadsPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [editLead, setEditLead] = useState<any>(null);

  const { data: allLeads = [], isLoading } = useQuery({
    queryKey: ["leads", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("*").eq("corretor_id", user!.id).order("temperatura", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const filtered = allLeads.filter((lead) => {
    if (search && !lead.nome.toLowerCase().includes(search.toLowerCase())) return false;
    const temp = lead.temperatura ?? 50;
    if (activeFilter === "quente") return temp >= 70;
    if (activeFilter === "morno") return temp >= 40 && temp < 70;
    if (activeFilter === "frio") return temp < 40;
    return true;
  });

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Leads</h1>
        <NewLeadDialog />
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar lead..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl bg-secondary pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {allLeads.length === 0 ? "Nenhum lead cadastrado ainda" : "Nenhum lead encontrado"}
          </div>
        ) : (
          filtered.map((lead, i) => {
            const temp = getTemperaturaLabel(lead.temperatura ?? 50);
            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setEditLead(lead)}
                className="rounded-2xl bg-card p-4 card-shadow border border-border active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-coral-light text-primary font-bold text-lg">
                    {lead.nome.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-base font-bold text-foreground truncate">{lead.nome}</p>
                      <span>{temp.emoji}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lead.orcamento ? formatCurrency(lead.orcamento) : "Sem orçamento"} · {lead.bairros?.[0] || "Sem bairro"}
                    </p>
                    {lead.ultima_interacao && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                        <Clock size={12} />
                        <span>{timeAgo(lead.ultima_interacao)}</span>
                      </div>
                    )}
                  </div>
                  <span className={`mt-1 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    (lead.temperatura ?? 50) >= 70
                      ? "bg-red-100 text-red-600"
                      : (lead.temperatura ?? 50) >= 40
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {temp.label}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <EditLeadDialog lead={editLead} open={!!editLead} onOpenChange={(v) => !v && setEditLead(null)} />
    </div>
  );
}
