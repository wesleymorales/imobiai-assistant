import { useState, useRef, useEffect } from "react";
import { Send, Mic, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mockUser } from "@/lib/mock-data";

type Message = { role: "user" | "assistant"; content: string };

const suggestions = [
  "Gerar script para lead",
  "Analisar meu funil de vendas",
  "Sugerir pitch para visita",
  "Resumo do meu dia",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-coral shrink-0">
        <Bot size={16} className="text-primary-foreground" />
      </div>
      <div className="flex gap-1 rounded-2xl bg-secondary px-4 py-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: getSimulatedResponse(text),
        },
      ]);
    }, 1500);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-elevated">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-coral">
            <Bot size={18} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Assistente ImobiAI</p>
            <p className="text-[11px] text-muted-foreground">Online</p>
          </div>
        </div>
        <button
          onClick={() => {
            // Placeholder for Whisper
            alert("Reconhecimento de voz em breve!");
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
        >
          <Mic size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-coral mb-4">
              <Bot size={28} className="text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              Olá, {mockUser.nome}! 👋
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
              Sou o ImobiAI, seu assistente para o mercado imobiliário. Como posso te ajudar hoje?
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-coral">
                    <Bot size={14} className="text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "gradient-coral text-primary-foreground rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-surface-elevated px-4 py-3 safe-bottom">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Pergunte ao ImobiAI..."
            className="flex-1 rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full gradient-coral disabled:opacity-40 transition-opacity"
          >
            <Send size={18} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getSimulatedResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("script") || lower.includes("lead"))
    return "Claro! Para gerar um script personalizado, me diga: qual lead você quer abordar e por qual canal (WhatsApp, ligação ou e-mail)? Vou criar um texto sob medida com base no perfil do cliente.";
  if (lower.includes("funil") || lower.includes("conversão"))
    return "Seu funil atual: 4 leads ativos, 1 quente (João Silva), 2 mornos e 1 frio. Taxa de conversão estimada: 25%. Recomendo focar no João — ele está pronto para fechar. Quer que eu gere um script de fechamento?";
  if (lower.includes("pitch") || lower.includes("visita"))
    return "Para a visita de hoje com João Silva no Itaim, destaque: vaga dupla (ele tem cachorro grande e precisa de espaço), andar alto (preferência da esposa), e portaria 24h. Comece perguntando sobre o pet — cria conexão!";
  if (lower.includes("resumo") || lower.includes("dia"))
    return "📋 Seu dia: 2 compromissos — visita com João Silva (10h, Ap Itaim) e reunião de proposta com Maria Costa (14h). Meta do mês em 70%. 3 leads sem contato há mais de 3 dias. Prioridade: fechar com João hoje!";
  return "Entendi! Posso te ajudar com scripts de abordagem, análise de leads, sugestão de imóveis e muito mais. Me diga mais detalhes sobre o que precisa!";
}
