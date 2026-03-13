import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function NewImovelDialog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titulo: "", tipo: "Apartamento", bairro: "", cidade: "", preco: "",
    area_m2: "", quartos: "", vagas: "", diferenciais: "", descricao: "",
  });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return toast.error("Título é obrigatório");
    setLoading(true);
    const { error } = await supabase.from("imoveis").insert({
      corretor_id: user!.id,
      titulo: form.titulo.trim(),
      tipo: form.tipo || null,
      bairro: form.bairro || null,
      cidade: form.cidade || null,
      preco: form.preco ? Number(form.preco) : null,
      area_m2: form.area_m2 ? Number(form.area_m2) : null,
      quartos: form.quartos ? Number(form.quartos) : null,
      vagas: form.vagas ? Number(form.vagas) : null,
      diferenciais: form.diferenciais ? form.diferenciais.split(",").map((d) => d.trim()) : [],
      descricao: form.descricao || null,
    });
    setLoading(false);
    if (error) return toast.error("Erro ao salvar imóvel");
    toast.success("Imóvel cadastrado!");
    queryClient.invalidateQueries({ queryKey: ["imoveis"] });
    setForm({ titulo: "", tipo: "Apartamento", bairro: "", cidade: "", preco: "", area_m2: "", quartos: "", vagas: "", diferenciais: "", descricao: "" });
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
          <DialogTitle>Novo Imóvel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.titulo} onChange={(e) => update("titulo", e.target.value)} placeholder="Título *" className={inputCls} />
          <select value={form.tipo} onChange={(e) => update("tipo", e.target.value)} className={inputCls}>
            <option value="Apartamento">Apartamento</option>
            <option value="Casa">Casa</option>
            <option value="Cobertura">Cobertura</option>
            <option value="Terreno">Terreno</option>
            <option value="Comercial">Comercial</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.bairro} onChange={(e) => update("bairro", e.target.value)} placeholder="Bairro" className={inputCls} />
            <input value={form.cidade} onChange={(e) => update("cidade", e.target.value)} placeholder="Cidade" className={inputCls} />
          </div>
          <input type="number" value={form.preco} onChange={(e) => update("preco", e.target.value)} placeholder="Preço (R$)" className={inputCls} />
          <div className="grid grid-cols-3 gap-3">
            <input type="number" value={form.area_m2} onChange={(e) => update("area_m2", e.target.value)} placeholder="Área m²" className={inputCls} />
            <input type="number" value={form.quartos} onChange={(e) => update("quartos", e.target.value)} placeholder="Quartos" className={inputCls} />
            <input type="number" value={form.vagas} onChange={(e) => update("vagas", e.target.value)} placeholder="Vagas" className={inputCls} />
          </div>
          <input value={form.diferenciais} onChange={(e) => update("diferenciais", e.target.value)} placeholder="Diferenciais (separar por vírgula)" className={inputCls} />
          <textarea value={form.descricao} onChange={(e) => update("descricao", e.target.value)} placeholder="Descrição" rows={3} className={inputCls + " resize-none"} />
          <button type="submit" disabled={loading} className="w-full rounded-2xl gradient-coral py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {loading ? "Salvando..." : "Cadastrar Imóvel"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
