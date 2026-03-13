import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function NewEventoDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titulo: "", tipo: "visita", data_inicio: "", hora_inicio: "", hora_fim: "", notas: "",
  });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const syncToGoogleCalendar = async (eventId: string) => {
    try {
      const { data: profile } = await supabase.from("profiles").select("google_calendar_connected").eq("id", user!.id).single();
      if (!profile?.google_calendar_connected) return;

      const { error } = await supabase.functions.invoke("google-calendar-sync", {
        body: { event_id: eventId },
      });
      if (error) {
        console.error("Sync error:", error);
        toast.info("Evento criado, mas não sincronizado com Google Agenda");
      } else {
        toast.success("Sincronizado com Google Agenda!");
      }
    } catch (e) {
      console.error("Sync error:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.data_inicio || !form.hora_inicio) return toast.error("Preencha título, data e hora");
    setLoading(true);
    const dataInicio = new Date(`${form.data_inicio}T${form.hora_inicio}`).toISOString();
    const dataFim = form.hora_fim ? new Date(`${form.data_inicio}T${form.hora_fim}`).toISOString() : null;

    const { data: inserted, error } = await supabase.from("eventos_agenda").insert({
      corretor_id: user!.id,
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      data_inicio: dataInicio,
      data_fim: dataFim,
      notas: form.notas || null,
    }).select("id").single();

    setLoading(false);
    if (error) return toast.error("Erro ao salvar evento");
    toast.success("Evento criado!");
    queryClient.invalidateQueries({ queryKey: ["eventos-home"] });

    // Sync to Google Calendar in background
    if (inserted?.id) {
      syncToGoogleCalendar(inserted.id);
    }

    setForm({ titulo: "", tipo: "visita", data_inicio: "", hora_inicio: "", hora_fim: "", notas: "" });
    setOpen(false);
  };

  const inputCls = "w-full rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="min-w-[120px] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <Plus size={20} />
            <span className="text-xs font-medium">Novo evento</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.titulo} onChange={(e) => update("titulo", e.target.value)} placeholder="Título *" className={inputCls} />
          <select value={form.tipo} onChange={(e) => update("tipo", e.target.value)} className={inputCls}>
            <option value="visita">Visita</option>
            <option value="reuniao">Reunião</option>
            <option value="ligacao">Ligação</option>
            <option value="outro">Outro</option>
          </select>
          <input type="date" value={form.data_inicio} onChange={(e) => update("data_inicio", e.target.value)} className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Início *</label>
              <input type="time" value={form.hora_inicio} onChange={(e) => update("hora_inicio", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fim</label>
              <input type="time" value={form.hora_fim} onChange={(e) => update("hora_fim", e.target.value)} className={inputCls} />
            </div>
          </div>
          <textarea value={form.notas} onChange={(e) => update("notas", e.target.value)} placeholder="Notas" rows={3} className={inputCls + " resize-none"} />
          <button type="submit" disabled={loading} className="w-full rounded-2xl gradient-coral py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {loading ? "Salvando..." : "Criar Evento"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
