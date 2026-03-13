import { useState, useRef, useEffect } from "react";
import { Send, Mic, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { streamChat } from "@/lib/ai-stream";
import { toast } from "sonner";

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
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      await streamChat({
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        accessToken: session?.access_token || "",
        onDelta: updateAssistant,
        onDone: () => setIsStreaming(false),
        onError: (msg) => {
          toast.error(msg);
          setIsStreaming(false);
        },
      });
    } catch {
      toast.error("Erro ao conectar com o assistente");
      setIsStreaming(false);
    }
  };

  const isEmpty = messages.length === 0;
  const userName = user?.user_metadata?.nome || "Corretor";

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
          onClick={() => toast.info("Reconhecimento de voz em breve!")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
        >
          <Mic size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isEmpty && !isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-coral mb-4">
              <Bot size={28} className="text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              Olá, {userName}! 👋
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
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && <TypingIndicator />}
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
            disabled={!input.trim() || isStreaming}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full gradient-coral disabled:opacity-40 transition-opacity"
          >
            <Send size={18} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
