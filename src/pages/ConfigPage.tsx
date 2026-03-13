import { useState } from "react";
import { ChevronRight, LogOut, User, Lock, Calendar, MessageCircle, Bell, BellOff, Clock, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import EditProfileDialog from "@/components/EditProfileDialog";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";

export default function ConfigPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const toggleNotif = async (field: "notif_visitas" | "notif_leads_inativos" | "notif_resumo_diario") => {
    if (!profile) return;
    const newVal = !profile[field];
    const { error } = await supabase.from("profiles").update({ [field]: newVal }).eq("id", user!.id);
    if (error) return toast.error("Erro ao atualizar notificação");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success(newVal ? "Notificação ativada" : "Notificação desativada");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleAction = (action?: string) => {
    if (action === "edit-profile") setEditProfileOpen(true);
    if (action === "change-password") setChangePasswordOpen(true);
    if (action === "google-calendar") toast.info("Integração com Google Agenda em breve! Será necessário configurar credenciais OAuth.");
    if (action === "whatsapp") toast.info("Integração com WhatsApp em breve! Será necessário escanear QR Code.");
  };

  const userName = profile?.nome || user?.user_metadata?.nome || "Corretor";
  const userCity = profile?.cidade || "Sem cidade";

  type SettingItem = {
    icon: React.ElementType;
    label: string;
    subtitle?: string;
    trailing?: "chevron" | "badge-green" | "badge-gray" | "badge-soon" | "toggle";
    action?: string;
    toggleField?: "notif_visitas" | "notif_leads_inativos" | "notif_resumo_diario";
    toggleValue?: boolean;
  };

  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: "Meu Perfil",
      items: [
        { icon: User, label: "Editar informações", trailing: "chevron", action: "edit-profile" },
        { icon: Lock, label: "Alterar senha", trailing: "chevron", action: "change-password" },
      ],
    },
    {
      title: "Integrações",
      items: [
        { icon: Calendar, label: "Google Agenda", subtitle: "Sincronize suas visitas", trailing: profile?.google_calendar_connected ? "badge-green" : "badge-gray", action: "google-calendar" },
        { icon: MessageCircle, label: "WhatsApp", subtitle: "Envie scripts pelo WhatsApp", trailing: profile?.whatsapp_connected ? "badge-green" : "badge-gray", action: "whatsapp" },
      ],
    },
    {
      title: "Notificações",
      items: [
        { icon: Bell, label: "Lembretes de visita", trailing: "toggle", toggleField: "notif_visitas", toggleValue: profile?.notif_visitas ?? true },
        { icon: BellOff, label: "Leads sem contato (3+ dias)", trailing: "toggle", toggleField: "notif_leads_inativos", toggleValue: profile?.notif_leads_inativos ?? true },
        { icon: Clock, label: "Resumo diário às 7h30", trailing: "toggle", toggleField: "notif_resumo_diario", toggleValue: profile?.notif_resumo_diario ?? true },
      ],
    },
    {
      title: "Sobre",
      items: [
        { icon: Info, label: "Versão 1.0.0", trailing: "chevron" },
      ],
    },
  ];

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Configurações</h1>

      <div
        onClick={() => setEditProfileOpen(true)}
        className="flex items-center gap-4 rounded-2xl bg-card p-4 card-shadow border border-border mb-6 cursor-pointer active:bg-secondary/50 transition-colors"
      >
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
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title}
            </p>
            <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  onClick={() => {
                    if (item.trailing === "toggle" && item.toggleField) {
                      toggleNotif(item.toggleField);
                    } else {
                      handleAction(item.action);
                    }
                  }}
                  className="flex items-center gap-3 px-4 py-3.5 active:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <item.icon size={18} className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                    )}
                  </div>
                  {item.trailing === "chevron" && <ChevronRight size={16} className="text-muted-foreground" />}
                  {item.trailing === "badge-green" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Conectado</span>
                  )}
                  {item.trailing === "badge-gray" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Conectar</span>
                  )}
                  {item.trailing === "toggle" && (
                    <div className={`h-6 w-10 rounded-full relative cursor-pointer transition-colors ${item.toggleValue ? "bg-primary" : "bg-muted"}`}>
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-primary-foreground shadow-sm transition-all ${item.toggleValue ? "right-0.5" : "left-0.5"}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="w-full mt-6 mb-8 rounded-2xl bg-destructive/10 py-4 text-sm font-bold text-destructive active:bg-destructive/20 transition-colors"
      >
        <LogOut size={16} className="inline mr-2" />
        Sair
      </button>

      <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />
      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </div>
  );
}
