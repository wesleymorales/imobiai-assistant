import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 6) return toast.error("Senha deve ter no mínimo 6 caracteres");
    if (senha !== confirmar) return toast.error("As senhas não conferem");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Senha alterada!");
    setSenha("");
    setConfirmar("");
    onOpenChange(false);
  };

  const inputCls = "w-full rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Nova senha" className={inputCls} />
          <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} placeholder="Confirmar senha" className={inputCls} />
          <button type="submit" disabled={loading} className="w-full rounded-2xl gradient-coral py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {loading ? "Alterando..." : "Alterar Senha"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
