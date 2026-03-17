import { useState, useEffect } from "react";
import { ChevronRight, LogOut, User, Lock, Calendar, MessageCircle, Bell, BellOff, Clock, Info, Loader2, Phone, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import EditProfileDialog from "@/components/EditProfileDialog";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";

function WhatsAppConfigSheet({
  open,
  onClose,
  currentNumber,
  onSave





}: {open: boolean;onClose: () => void;currentNumber: string;onSave: (number: string) => Promise<void>;}) {
  const [number, setNumber] = useState(currentNumber);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNumber(currentNumber);
  }, [currentNumber, open]);

  if (!open) return null;

  const handleSave = async () => {
    const cleaned = number.replace(/\D/g, "");
    if (cleaned.length < 10) {
      return toast.error("Informe um número válido com DDD (ex: 11 99999-9999)");
    }
    setSaving(true);
    await onSave(cleaned);
    setSaving(false);
    onClose();
  };

  const handleDisconnect = async () => {
    setSaving(true);
    await onSave("");
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-background p-6 safe-bottom animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
              <MessageCircle size={18} className="text-green-600" />
            </div>
            <p className="text-base font-bold text-foreground">WhatsApp Notificações</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Informe seu número do WhatsApp para receber alertas de leads, visitas e resumo diário diretamente no seu WhatsApp.
        </p>

        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Número (com DDD)
        </label>
        <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 mb-5">
          <span className="text-sm text-muted-foreground">🇧🇷 +55</span>
          <input
            type="tel"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="11 99999-9999"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-green-500 py-3.5 text-sm font-bold text-white disabled:opacity-60 mb-2">
          
          {saving ? <Loader2 size={16} className="animate-spin inline mr-2" /> : null}
          {saving ? "Salvando..." : "Salvar e Ativar"}
        </button>

        {currentNumber &&
        <button
          onClick={handleDisconnect}
          disabled={saving}
          className="w-full rounded-2xl bg-destructive/10 py-3.5 text-sm font-bold text-destructive disabled:opacity-60">
          
            Desconectar WhatsApp
          </button>
        }

        <p className="text-[11px] text-muted-foreground text-center mt-4">
          Suas notificações chegam via número oficial ImobiAI no Meta Business Manager.
        </p>
      </div>
    </div>);

}

export default function ConfigPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [whatsappSheetOpen, setWhatsappSheetOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    if (searchParams.get("google") === "connected") {
      toast.success("Google Agenda conectado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, queryClient, setSearchParams]);

  const toggleNotif = async (field: "notif_visitas" | "notif_leads_inativos" | "notif_resumo_diario") => {
    if (!profile) return;
    const newVal = !profile[field];
    const { error } = await supabase.from("profiles").update({ [field]: newVal }).eq("id", user!.id);
    if (error) return toast.error("Erro ao atualizar notificação");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success(newVal ? "Notificação ativada" : "Notificação desativada");
  };

  const handleGoogleCalendar = async () => {
    if (profile?.google_calendar_connected) {
      const { error } = await supabase.from("profiles").update({
        google_calendar_connected: false,
        google_access_token: null,
        google_refresh_token: null,
        google_token_expires_at: null
      } as any).eq("id", user!.id);
      if (error) return toast.error("Erro ao desconectar");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Google Agenda desconectado");
      return;
    }

    setConnectingGoogle(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-calendar-auth");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
      toast.error("Erro ao iniciar conexão com Google");
      setConnectingGoogle(false);
    }
  };

  const handleSaveWhatsApp = async (number: string) => {
    const updates: Record<string, unknown> = {
      whatsapp_notification_number: number || null,
      whatsapp_connected: !!number
    };
    const { error } = await supabase.from("profiles").update(updates as any).eq("id", user!.id);
    if (error) {
      toast.error("Erro ao salvar número");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    if (number) {
      toast.success("WhatsApp configurado! Você receberá notificações em breve.");
    } else {
      toast.success("WhatsApp desconectado");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleAction = (action?: string) => {
    if (action === "edit-profile") setEditProfileOpen(true);
    if (action === "change-password") setChangePasswordOpen(true);
    if (action === "google-calendar") handleGoogleCalendar();
    if (action === "whatsapp") setWhatsappSheetOpen(true);
  };

  const userName = profile?.nome || user?.user_metadata?.nome || "Corretor";
  const userCity = profile?.cidade || "Sem cidade";
  const whatsappNumber = (profile as any)?.whatsapp_notification_number || "";

  type SettingItem = {
    icon: React.ElementType;
    label: string;
    subtitle?: string;
    trailing?: "chevron" | "badge-green" | "badge-gray" | "toggle";
    action?: string;
    toggleField?: "notif_visitas" | "notif_leads_inativos" | "notif_resumo_diario";
    toggleValue?: boolean;
  };

  const sections: {title: string;items: SettingItem[];}[] = [
  {
    title: "Meu Perfil",
    items: [
    { icon: User, label: "Editar informações", trailing: "chevron", action: "edit-profile" },
    { icon: Lock, label: "Alterar senha", trailing: "chevron", action: "change-password" }]

  },
  {
    title: "Integrações",
    items: [
    {
      icon: Calendar,
      label: "Google Agenda",
      subtitle: profile?.google_calendar_connected ? "Clique para desconectar" : "Sincronize suas visitas",
      trailing: profile?.google_calendar_connected ? "badge-green" : "badge-gray",
      action: "google-calendar"
    },
    {
      icon: MessageCircle,
      label: "WhatsApp Notificações",
      subtitle: whatsappNumber ?
      `Ativo: +55 ${whatsappNumber.replace(/(\d{2})(\d{5})(\d{4})/, "$1 $2-$3")}` :
      "Receba alertas no seu WhatsApp",
      trailing: whatsappNumber ? "badge-green" : "badge-gray",
      action: "whatsapp"
    }]

  },
  {
    title: "Notificações",
    items: [
    { icon: Bell, label: "Lembretes de visita", trailing: "toggle", toggleField: "notif_visitas", toggleValue: profile?.notif_visitas ?? true },
    { icon: BellOff, label: "Leads sem contato (3+ dias)", trailing: "toggle", toggleField: "notif_leads_inativos", toggleValue: profile?.notif_leads_inativos ?? true },
    { icon: Clock, label: "Resumo diário às 7h30", trailing: "toggle", toggleField: "notif_resumo_diario", toggleValue: profile?.notif_resumo_diario ?? true }]

  },
  {
    title: "Sobre",
    items: [
    { icon: Info, label: "Versão 1.0.0", trailing: "chevron" }]

  }];


  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Configurações</h1>

      <div
        onClick={() => setEditProfileOpen(true)}
        className="flex items-center gap-4 rounded-2xl bg-card p-4 card-shadow border border-border mb-6 cursor-pointer active:bg-secondary/50 transition-colors">
        
        <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-coral text-primary-foreground font-bold text-xl">
          {userName.charAt(0)}
        </div>
        <div>
          <p className="text-base font-bold text-foreground">{userName}</p>
          <p className="text-sm text-muted-foreground">{userCity}</p>
        </div>
        <ChevronRight size={20} className="ml-auto text-muted-foreground" />
      </div>

      <div className="space-y-6">
        {sections.map((section) =>
        <div key={section.title}>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title}
            </p>
            <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
              {section.items.map((item) =>
            <div
              key={item.label}
              onClick={() => {
                if (item.trailing === "toggle" && item.toggleField) {
                  toggleNotif(item.toggleField);
                } else {
                  handleAction(item.action);
                }
              }}
              className="flex items-center gap-3 px-4 py-3.5 active:bg-secondary/50 transition-colors cursor-pointer">
              
                  <item.icon size={18} className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    {item.subtitle &&
                <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                }
                  </div>
                  {item.trailing === "chevron" && <ChevronRight size={16} className="text-muted-foreground" />}
                  {item.trailing === "badge-green" &&
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Conectado</span>
              }
                  {item.trailing === "badge-gray" && (
              item.action === "google-calendar" && connectingGoogle ?
              <Loader2 size={16} className="animate-spin text-muted-foreground" /> :

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Conectar</span>)

              }
                  {item.trailing === "toggle" &&
              <div className={`h-6 w-10 rounded-full relative cursor-pointer transition-colors ${item.toggleValue ? "bg-primary" : "bg-muted"}`}>
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-primary-foreground shadow-sm transition-all ${item.toggleValue ? "right-0.5" : "left-0.5"}`} />
                    </div>
              }
                </div>
            )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full mt-6 mb-8 rounded-2xl bg-destructive/10 py-4 text-sm font-bold text-destructive active:bg-destructive/20 transition-colors">
        
        <LogOut size={16} className="inline mr-2" />
        Sair
      </button>

      <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />
      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
      <WhatsAppConfigSheet
        open={whatsappSheetOpen}
        onClose={() => setWhatsappSheetOpen(false)}
        currentNumber={whatsappNumber}
        onSave={handleSaveWhatsApp} />
      
    </div>);

}