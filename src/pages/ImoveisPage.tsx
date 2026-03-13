import { useState } from "react";
import { Search, Plus, Bed, Car, Maximize } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/mock-data";

const filters = [
  { label: "Todos", value: "todos" },
  { label: "Disponível", value: "disponivel" },
  { label: "Negociando", value: "negociando" },
  { label: "Vendido", value: "vendido" },
];

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  disponivel: { bg: "bg-green-100", text: "text-green-700", label: "Disponível" },
  negociando: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Negociando" },
  vendido: { bg: "bg-gray-100", text: "text-gray-500", label: "Vendido" },
};

export default function ImoveisPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("todos");
  const [search, setSearch] = useState("");

  const { data: allImoveis = [], isLoading } = useQuery({
    queryKey: ["imoveis", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("imoveis").select("*").eq("corretor_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const filtered = allImoveis.filter((im) => {
    if (search && !im.titulo.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter !== "todos") return im.status === activeFilter;
    return true;
  });

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Imóveis</h1>
        <button className="flex h-10 w-10 items-center justify-center rounded-full gradient-coral shadow-lg shadow-primary/20">
          <Plus size={20} className="text-primary-foreground" />
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar imóvel..."
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

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {allImoveis.length === 0 ? "Nenhum imóvel cadastrado ainda" : "Nenhum imóvel encontrado"}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((imovel, i) => {
            const badge = statusBadge[imovel.status ?? "disponivel"] || statusBadge.disponivel;
            return (
              <motion.div
                key={imovel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-card card-shadow border border-border overflow-hidden active:scale-[0.98] transition-transform"
              >
                <div className="relative h-28 gradient-coral flex items-center justify-center">
                  <span className="text-primary-foreground/60 text-3xl">🏠</span>
                  <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-[11px] text-muted-foreground mb-0.5">{imovel.tipo || "Imóvel"}</p>
                  <p className="text-sm font-bold text-foreground leading-tight mb-1 line-clamp-2">{imovel.titulo}</p>
                  <p className="text-xs text-muted-foreground mb-2">{imovel.bairro}, {imovel.cidade}</p>
                  <p className="text-sm font-bold text-primary mb-2">{imovel.preco ? formatCurrency(imovel.preco) : "Consultar"}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Bed size={12} /> {imovel.quartos ?? "-"}</span>
                    <span className="flex items-center gap-0.5"><Car size={12} /> {imovel.vagas ?? "-"}</span>
                    <span className="flex items-center gap-0.5"><Maximize size={12} /> {imovel.area_m2 ?? "-"}m²</span>
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
