import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, ImagePlus, X } from "lucide-react";

type Imovel = {
  id: string;
  titulo: string;
  tipo?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  preco?: number | null;
  area_m2?: number | null;
  quartos?: number | null;
  vagas?: number | null;
  diferenciais?: string[] | null;
  descricao?: string | null;
  status?: string | null;
  fotos_urls?: string[] | null;
  condominio?: number | null;
  endereco?: string | null;
};

export default function EditImovelDialog({ imovel, open, onOpenChange }: { imovel: Imovel | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fotos, setFotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    titulo: "", tipo: "Apartamento", bairro: "", cidade: "", preco: "",
    area_m2: "", quartos: "", vagas: "", diferenciais: "", descricao: "",
    status: "disponivel", condominio: "", endereco: "",
  });

  useEffect(() => {
    if (open && imovel) {
      setForm({
        titulo: imovel.titulo || "",
        tipo: imovel.tipo || "Apartamento",
        bairro: imovel.bairro || "",
        cidade: imovel.cidade || "",
        preco: imovel.preco ? String(imovel.preco) : "",
        area_m2: imovel.area_m2 ? String(imovel.area_m2) : "",
        quartos: imovel.quartos ? String(imovel.quartos) : "",
        vagas: imovel.vagas ? String(imovel.vagas) : "",
        diferenciais: imovel.diferenciais?.join(", ") || "",
        descricao: imovel.descricao || "",
        status: imovel.status || "disponivel",
        condominio: imovel.condominio ? String(imovel.condominio) : "",
        endereco: imovel.endereco || "",
      });
      setFotos(imovel.fotos_urls || []);
    }
  }, [open, imovel]);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !user || !imovel) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${imovel.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("imoveis-fotos").upload(path, file);
      if (error) {
        toast.error(`Erro ao enviar ${file.name}`);
        continue;
      }
      const { data: urlData } = supabase.storage.from("imoveis-fotos").getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }
    setFotos((prev) => [...prev, ...newUrls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (url: string) => setFotos((prev) => prev.filter((u) => u !== url));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imovel || !form.titulo.trim()) return toast.error("Título é obrigatório");
    setLoading(true);
    const { error } = await supabase.from("imoveis").update({
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
      status: form.status,
      condominio: form.condominio ? Number(form.condominio) : null,
      endereco: form.endereco || null,
      fotos_urls: fotos,
    }).eq("id", imovel.id);
    setLoading(false);
    if (error) return toast.error("Erro ao atualizar imóvel");
    toast.success("Imóvel atualizado!");
    queryClient.invalidateQueries({ queryKey: ["imoveis"] });
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!imovel || !confirm("Tem certeza que deseja excluir este imóvel?")) return;
    const { error } = await supabase.from("imoveis").delete().eq("id", imovel.id);
    if (error) return toast.error("Erro ao excluir imóvel");
    toast.success("Imóvel excluído!");
    queryClient.invalidateQueries({ queryKey: ["imoveis"] });
    onOpenChange(false);
  };

  const inputCls = "w-full rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Editar Imóvel</DialogTitle>
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
          <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputCls}>
            <option value="disponivel">Disponível</option>
            <option value="negociando">Negociando</option>
            <option value="vendido">Vendido</option>
          </select>
          <input value={form.endereco} onChange={(e) => update("endereco", e.target.value)} placeholder="Endereço" className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.bairro} onChange={(e) => update("bairro", e.target.value)} placeholder="Bairro" className={inputCls} />
            <input value={form.cidade} onChange={(e) => update("cidade", e.target.value)} placeholder="Cidade" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.preco} onChange={(e) => update("preco", e.target.value)} placeholder="Preço (R$)" className={inputCls} />
            <input type="number" value={form.condominio} onChange={(e) => update("condominio", e.target.value)} placeholder="Condomínio (R$)" className={inputCls} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" value={form.area_m2} onChange={(e) => update("area_m2", e.target.value)} placeholder="Área m²" className={inputCls} />
            <input type="number" value={form.quartos} onChange={(e) => update("quartos", e.target.value)} placeholder="Quartos" className={inputCls} />
            <input type="number" value={form.vagas} onChange={(e) => update("vagas", e.target.value)} placeholder="Vagas" className={inputCls} />
          </div>
          <input value={form.diferenciais} onChange={(e) => update("diferenciais", e.target.value)} placeholder="Diferenciais (separar por vírgula)" className={inputCls} />
          <textarea value={form.descricao} onChange={(e) => update("descricao", e.target.value)} placeholder="Descrição" rows={3} className={inputCls + " resize-none"} />

          {/* Photos section */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Fotos do Imóvel</label>
            {fotos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-2">
                {fotos.map((url, i) => (
                  <div key={i} className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(url)} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground w-full justify-center">
              <ImagePlus size={16} />
              {uploading ? "Enviando..." : "Adicionar Fotos"}
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-2xl gradient-coral py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button type="button" onClick={handleDelete} className="w-full rounded-2xl bg-destructive/10 py-3 text-sm font-bold text-destructive flex items-center justify-center gap-2">
            <Trash2 size={16} /> Excluir Imóvel
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
