import { useState } from "react";
import { Search, Plus, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { mockLeads, getTemperaturaLabel, formatCurrency, timeAgo } from "@/lib/mock-data";

const filters = [
  { label: "Todos", value: "todos" },
  { label: "🔴 Quente", value: "quente" },
  { label: "🟡 Morno", value: "morno" },
  { label: "⚪ Frio", value: "frio" },
];

export default function LeadsPage() {
  const [activeFilter, setActiveFilter] = useState("todos");
  const [search, setSearch] = useState("");

  const filtered = mockLeads.filter((lead) => {
    if (search && !lead.nome.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === "quente") return lead.temperatura >= 70;
    if (activeFilter === "morno") return lead.temperatura >= 40 && lead.temperatura < 70;
    if (activeFilter === "frio") return lead.temperatura < 40;
    return true;
  });

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Leads</h1>
        <button className="flex h-10 w-10 items-center justify-center rounded-full gradient-coral shadow-lg shadow-primary/20">
          <Plus size={20} className="text-primary-foreground" />
        </button>
      </div>

      {/* Search */}
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

      {/* Filters */}
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

      {/* Lead Cards */}
      <div className="space-y-3">
        {filtered.map((lead, i) => {
          const temp = getTemperaturaLabel(lead.temperatura);
          return (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl bg-card p-4 card-shadow border border-border active:scale-[0.98] transition-transform"
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
                    {formatCurrency(lead.orcamento)} · {lead.bairros[0]}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>{timeAgo(lead.ultima_interacao)}</span>
                  </div>
                </div>
                <span className={`mt-1 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  lead.temperatura >= 70
                    ? "bg-red-100 text-red-600"
                    : lead.temperatura >= 40
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {temp.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
