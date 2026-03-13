import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

const urgencias = ["Curto prazo — 1 a 3 meses", "Médio prazo — 3 a 6 meses", "Sem pressa"];

type Lead = {
  id: string;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  cpf?: string | null;
  orcamento?: number | null;
  bairros?: string[] | null;
  quartos_min?: number | null;
  temperatura?: number | null;
  tipo_imovel_preferido?: string | null;
  perfil?: string | null;
  urgencia?: string | null;
  observacoes?: string | null;
  status?: string | null;
};

export default function EditLeadDialog({ lead, open, onOpenChange }: { lead: Lead | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "", telefone: "", email: "", cpf: "", orcamento: "", bairros: "",
    quartos_min: "", temperatura: "50", tipo_imovel_preferido: "",
    perfil: "", urgencia: "", observacoes: "", status: "novo",
  });

  useEffect(() => {
    if (open && lead) {
      setForm({
        nome: lead.nome || "",
        telefone: lead.telefone || "",
        email: lead.email || "",
        cpf: (lead as any).cpf || "",
        orcamento: lead.orcamento ? String(lead.orcamento) : "",
        bairros: lead.bairros?.join(", ") || "",
        quartos_min: lead.quartos_min ? String(lead.quartos_min) : "",
        temperatura: String(lead.temperatura ?? 50),
        tipo_imovel_preferido: lead.tipo_imovel_preferido || "",
        perfil: lead.perfil || "",
        urgencia: lead.urgencia || "",
        observacoes: lead.observacoes || "",
        status: lead.status || "novo",
      });
    }
  }, [open, lead]);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !form.nome.trim()) return toast.error("Nome é obrigatório");
    setLoading(true);
    const { error } = await supabase.from("leads").update({
      nome: form.nome.trim(),
      telefone: form.telefone || null,
      email: form.email || null,
      cpf: form.cpf || null,
      orcamento: form.orcamento ? Number(form.orcamento) : null,
      bairros: form.bairros ? form.bairros.split(",").map((b) => b.trim()) : [],
      quartos_min: form.quartos_min ? Number(form.quartos_min) : null,
      temperatura: Number(form.temperatura),
      tipo_imovel_preferido: form.tipo_imovel_preferido || null,
      perfil: form.perfil || null,
      urgencia: form.urgencia || null,
      observacoes: form.observacoes || null,
      status: form.status || "novo",
      updated_at: new Date().toISOString(),
    } as any).eq("id", lead.id);
    setLoading(false);
    if (error) return toast.error("Erro ao atualizar lead");
    toast.success("Lead atualizado!");
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    queryClient.invalidateQueries({ queryKey: ["leads-home"] });
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!lead || !confirm("Tem certeza que deseja excluir este lead?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", lead.id);
    if (error) return toast.error("Erro ao excluir lead");
    toast.success("Lead excluído!");
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    queryClient.invalidateQueries({ queryKey: ["leads-home"] });
    onOpenChange(false);
  };

  const inputCls = "w-full rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Nome *" className={inputCls} />
          <input value={form.telefone} onChange={(e) => update("telefone", e.target.value)} placeholder="Telefone / WhatsApp" className={inputCls} />
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="E-mail" className={inputCls} />
          <input value={form.cpf} onChange={(e) => update("cpf", e.target.value)} placeholder="CPF" className={inputCls} />
          <input type="number" value={form.orcamento} onChange={(e) => update("orcamento", e.target.value)} placeholder="Orçamento (R$)" className={inputCls} />
          <input value={form.bairros} onChange={(e) => update("bairros", e.target.value)} placeholder="Bairros (separar por vírgula)" className={inputCls} />
          <input type="number" value={form.quartos_min} onChange={(e) => update("quartos_min", e.target.value)} placeholder="Quartos mínimos" className={inputCls} />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Temperatura: {form.temperatura}%</label>
            <input type="range" min="0" max="100" value={form.temperatura} onChange={(e) => update("temperatura", e.target.value)} className="w-full accent-primary" />
          </div>
          <input value={form.tipo_imovel_preferido} onChange={(e) => update("tipo_imovel_preferido", e.target.value)} placeholder="Tipo de imóvel preferido" className={inputCls} />
          <input value={form.perfil} onChange={(e) => update("perfil", e.target.value)} placeholder="Perfil (ex: Família com filhos)" className={inputCls} />
          <select value={form.urgencia} onChange={(e) => update("urgencia", e.target.value)} className={inputCls}>
            <option value="">Urgência</option>
            {urgencias.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputCls}>
            <option value="novo">Novo</option>
            <option value="em_contato">Em contato</option>
            <option value="visitou">Visitou</option>
            <option value="proposta">Proposta</option>
            <option value="fechado">Fechado</option>
            <option value="perdido">Perdido</option>
          </select>
          <textarea value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} placeholder="Observações" rows={3} className={inputCls + " resize-none"} />
          <button type="submit" disabled={loading} className="w-full rounded-2xl gradient-coral py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button type="button" onClick={handleDelete} className="w-full rounded-2xl bg-destructive/10 py-3 text-sm font-bold text-destructive flex items-center justify-center gap-2">
            <Trash2 size={16} /> Excluir Lead
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
