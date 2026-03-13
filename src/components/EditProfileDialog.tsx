import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function EditProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", cidade: "", meta_mensal: "", comissao_media: "", ticket_medio: "", foco: "" });

  useEffect(() => {
    if (open && user) {
      supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
        if (data) {
          setForm({
            nome: data.nome || "",
            telefone: data.telefone || "",
            cidade: data.cidade || "",
            meta_mensal: data.meta_mensal ? String(data.meta_mensal) : "",
            comissao_media: data.comissao_media ? String(data.comissao_media) : "",
            ticket_medio: data.ticket_medio ? String(data.ticket_medio) : "",
            foco: data.foco?.join(", ") || "",
          });
        }
      });
    }
  }, [open, user]);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.error("Nome é obrigatório");
    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      nome: form.nome.trim(),
      telefone: form.telefone || null,
      cidade: form.cidade || null,
      meta_mensal: form.meta_mensal ? Number(form.meta_mensal) : null,
      comissao_media: form.comissao_media ? Number(form.comissao_media) : null,
      ticket_medio: form.ticket_medio ? Number(form.ticket_medio) : null,
      foco: form.foco ? form.foco.split(",").map((f) => f.trim()) : [],
    }).eq("id", user!.id);
    setLoading(false);
    if (error) return toast.error("Erro ao atualizar perfil");
    toast.success("Perfil atualizado!");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    onOpenChange(false);
  };

  const inputCls = "w-full rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Nome completo *" className={inputCls} />
          <input value={form.telefone} onChange={(e) => update("telefone", e.target.value)} placeholder="WhatsApp" className={inputCls} />
          <input value={form.cidade} onChange={(e) => update("cidade", e.target.value)} placeholder="Cidade" className={inputCls} />
          <input type="number" value={form.meta_mensal} onChange={(e) => update("meta_mensal", e.target.value)} placeholder="Meta mensal (R$)" className={inputCls} />
          <input type="number" step="0.1" value={form.comissao_media} onChange={(e) => update("comissao_media", e.target.value)} placeholder="Comissão média (%)" className={inputCls} />
          <input type="number" value={form.ticket_medio} onChange={(e) => update("ticket_medio", e.target.value)} placeholder="Ticket médio (R$)" className={inputCls} />
          <input value={form.foco} onChange={(e) => update("foco", e.target.value)} placeholder="Foco (ex: Residencial, Lançamentos)" className={inputCls} />
          <button type="submit" disabled={loading} className="w-full rounded-2xl gradient-coral py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
