import { ChevronRight, LogOut, User, Lock, Calendar, MessageCircle, Bell, BellOff, Clock, Info, Mic, Volume2, Bot } from "lucide-react";
import { mockUser } from "@/lib/mock-data";

type SettingItem = {
  icon: React.ElementType;
  label: string;
  subtitle?: string;
  trailing?: "chevron" | "badge-green" | "badge-gray" | "badge-soon" | "toggle";
  danger?: boolean;
};

type SettingSection = {
  title: string;
  items: SettingItem[];
};

const sections: SettingSection[] = [
  {
    title: "Meu Perfil",
    items: [
      { icon: User, label: "Editar informações", trailing: "chevron" },
      { icon: Lock, label: "Alterar senha", trailing: "chevron" },
    ],
  },
  {
    title: "Integrações",
    items: [
      { icon: Calendar, label: "Google Agenda", subtitle: "Sincronize suas visitas", trailing: "badge-gray" },
      { icon: MessageCircle, label: "WhatsApp", subtitle: "Envie scripts pelo WhatsApp", trailing: "badge-gray" },
    ],
  },
  {
    title: "Assistente IA",
    items: [
      { icon: Bot, label: "Provedor ativo", subtitle: "Configurado pela equipe ImobiAI", trailing: "chevron" },
      { icon: Volume2, label: "Respostas em áudio", subtitle: "Integração com ElevenLabs", trailing: "badge-soon" },
      { icon: Mic, label: "Reconhecimento de voz", subtitle: "Integração com Whisper", trailing: "badge-soon" },
    ],
  },
  {
    title: "Notificações",
    items: [
      { icon: Bell, label: "Lembretes de visita", trailing: "toggle" },
      { icon: BellOff, label: "Leads sem contato (3+ dias)", trailing: "toggle" },
      { icon: Clock, label: "Resumo diário às 7h30", trailing: "toggle" },
    ],
  },
  {
    title: "Sobre",
    items: [
      { icon: Info, label: "Versão 1.0.0", trailing: "chevron" },
    ],
  },
];

export default function ConfigPage() {
  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Configurações</h1>

      {/* Profile Card */}
      <div className="flex items-center gap-4 rounded-2xl bg-card p-4 card-shadow border border-border mb-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-coral text-primary-foreground font-bold text-xl">
          {mockUser.nome.charAt(0)}
        </div>
        <div>
          <p className="text-base font-bold text-foreground">{mockUser.nome}</p>
          <p className="text-sm text-muted-foreground">{mockUser.cidade}</p>
        </div>
        <ChevronRight size={20} className="ml-auto text-muted-foreground" />
      </div>

      {/* Sections */}
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
                  className="flex items-center gap-3 px-4 py-3.5 active:bg-secondary/50 transition-colors"
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

      {/* Logout */}
      <button className="w-full mt-6 mb-8 rounded-2xl bg-red-50 py-4 text-sm font-bold text-red-500 active:bg-red-100 transition-colors">
        <LogOut size={16} className="inline mr-2" />
        Sair
      </button>
    </div>
  );
}
