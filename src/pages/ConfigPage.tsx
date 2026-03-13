import { useState } from "react";
import { ChevronRight, LogOut, User, Lock, Calendar, MessageCircle, Bell, BellOff, Clock, Info, Mic, Volume2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import EditProfileDialog from "@/components/EditProfileDialog";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";

type SettingItem = {
  icon: React.ElementType;
  label: string;
  subtitle?: string;
  trailing?: "chevron" | "badge-green" | "badge-gray" | "badge-soon" | "toggle";
  action?: string;
};

export default function ConfigPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleAction = (action?: string) => {
    if (action === "edit-profile") setEditProfileOpen(true);
    if (action === "change-password") setChangePasswordOpen(true);
    if (action === "google-calendar") toast.info("Integração com Google Agenda em breve!");
    if (action === "whatsapp") toast.info("Integração com WhatsApp em breve!");
  };

  const userName = profile?.nome || user?.user_metadata?.nome || "Corretor";
  const userCity = profile?.cidade || "Sem cidade";

  const sections = [
    {
      title: "Meu Perfil",
      items: [
        { icon: User, label: "Editar informações", trailing: "chevron" as const, action: "edit-profile" },
        { icon: Lock, label: "Alterar senha", trailing: "chevron" as const, action: "change-password" },
      ],
    },
    {
      title: "Integrações",
      items: [
        { icon: Calendar, label: "Google Agenda", subtitle: "Sincronize suas visitas", trailing: "badge-gray" as const, action: "google-calendar" },
        { icon: MessageCircle, label: "WhatsApp", subtitle: "Envie scripts pelo WhatsApp", trailing: "badge-gray" as const, action: "whatsapp" },
      ],
    },
    {
      title: "Notificações",
      items: [
        { icon: Bell, label: "Lembretes de visita", trailing: "toggle" as const },
        { icon: BellOff, label: "Leads sem contato (3+ dias)", trailing: "toggle" as const },
        { icon: Clock, label: "Resumo diário às 7h30", trailing: "toggle" as const },
      ],
    },
    {
      title: "Sobre",
      items: [
        { icon: Info, label: "Versão 1.0.0", trailing: "chevron" as const },
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
                  onClick={() => handleAction(item.action)}
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
                  {item.trailing === "badge-soon" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-coral-light text-primary">Em breve</span>
                  )}
                  {item.trailing === "toggle" && (
                    <div className="h-6 w-10 rounded-full bg-primary relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-primary-foreground shadow-sm" />
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
