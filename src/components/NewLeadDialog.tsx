import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const urgencias = ["Curto prazo — 1 a 3 meses", "Médio prazo — 3 a 6 meses", "Sem pressa"];

export default function NewLeadDialog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "", telefone: "", email: "", cpf: "", orcamento: "", bairros: "",
    quartos_min: "", temperatura: "50", tipo_imovel_preferido: "",
    perfil: "", urgencia: "", observacoes: "",
  });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.error("Nome é obrigatório");
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      corretor_id: user!.id,
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
      ultima_interacao: new Date().toISOString(),
    } as any);
    setLoading(false);
    if (error) return toast.error("Erro ao salvar lead");
    toast.success("Lead cadastrado!");
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    queryClient.invalidateQueries({ queryKey: ["leads-home"] });
    queryClient.invalidateQueries({ queryKey: ["leads-count"] });
    setForm({ nome: "", telefone: "", email: "", cpf: "", orcamento: "", bairros: "", quartos_min: "", temperatura: "50", tipo_imovel_preferido: "", perfil: "", urgencia: "", observacoes: "" });
    setOpen(false);
  };

  const inputCls = "w-full rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex h-10 w-10 items-center justify-center rounded-full gradient-coral shadow-lg shadow-primary/20">
          <Plus size={20} className="text-primary-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Nome *" className={inputCls} />
          <input value={form.telefone} onChange={(e) => update("telefone", e.target.value)} placeholder="Telefone / WhatsApp" className={inputCls} />
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="E-mail" className={inputCls} />
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
          <textarea value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} placeholder="Observações" rows={3} className={inputCls + " resize-none"} />
          <button type="submit" disabled={loading} className="w-full rounded-2xl gradient-coral py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {loading ? "Salvando..." : "Cadastrar Lead"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
