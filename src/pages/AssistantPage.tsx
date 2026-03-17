import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Bot, Volume2, VolumeX, Square } from "lucide-react";
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

// Check browser support for Web Speech API
const hasSpeechRecognition =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

const hasSpeechSynthesis =
  typeof window !== "undefined" && "speechSynthesis" in window;

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

function RecordingIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-600">
      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-xs font-medium">Ouvindo...</span>
    </div>
  );
}

export default function AssistantPage() {
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isStreaming]);

  // Cleanup recognition and synthesis on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (hasSpeechSynthesis) speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!hasSpeechSynthesis) return;
    speechSynthesis.cancel();
    // Strip markdown symbols for cleaner audio
    const clean = text
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*?|__?|~~|`{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^\s*[-*+]\s/gm, "")
      .trim();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = "pt-BR";
    utter.rate = 1.05;
    utter.pitch = 1;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    // Prefer a Brazilian Portuguese voice if available
    const voices = speechSynthesis.getVoices();
    const ptBR = voices.find((v) => v.lang === "pt-BR") || voices.find((v) => v.lang.startsWith("pt"));
    if (ptBR) utter.voice = ptBR;
    speechSynthesis.speak(utter);
  }, []);

  const stopSpeaking = () => {
    if (hasSpeechSynthesis) speechSynthesis.cancel();
    setIsSpeaking(false);
  };

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
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      await streamChat({
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        accessToken: session?.access_token || "",
        onDelta: updateAssistant,
        onDone: () => {
          setIsStreaming(false);
          if (autoSpeak && assistantContent) {
            speak(assistantContent);
          }
        },
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

  const startListening = () => {
    if (!hasSpeechRecognition) {
      toast.error("Reconhecimento de voz não suportado neste navegador");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition: SpeechRecognition = new SpeechRecognitionAPI();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      if (e.error !== "aborted") {
        toast.error("Erro no reconhecimento de voz. Tente novamente.");
      }
    };
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
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
            <p className="text-[11px] text-muted-foreground">
              {isListening ? "Ouvindo..." : isSpeaking ? "Falando..." : "Online"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-speak toggle */}
          {hasSpeechSynthesis && (
            <button
              onClick={() => {
                setAutoSpeak((v) => !v);
                if (isSpeaking) stopSpeaking();
                toast.info(autoSpeak ? "Leitura automática desativada" : "Leitura automática ativada");
              }}
              title={autoSpeak ? "Desativar leitura automática" : "Ativar leitura automática"}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                autoSpeak ? "gradient-coral" : "bg-secondary"
              }`}
            >
              {autoSpeak ? (
                <Volume2 size={16} className="text-primary-foreground" />
              ) : (
                <VolumeX size={16} className="text-muted-foreground" />
              )}
            </button>
          )}

          {/* Stop speaking button (visible while speaking) */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100"
            >
              <Square size={14} className="text-red-600 fill-red-600" />
            </button>
          )}
        </div>
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
            {hasSpeechRecognition && (
              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                <Mic size={12} /> Toque no microfone para falar
              </p>
            )}
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
                {/* Speak this message button */}
                {msg.role === "assistant" && hasSpeechSynthesis && (
                  <button
                    onClick={() => speak(msg.content)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary opacity-70 hover:opacity-100 transition-opacity"
                    title="Ouvir resposta"
                  >
                    <Volume2 size={13} className="text-muted-foreground" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <TypingIndicator />
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-surface-elevated px-4 py-3 safe-bottom">
        {isListening && (
          <div className="flex justify-center mb-2">
            <RecordingIndicator />
          </div>
        )}
        <div className="flex items-center gap-2">
          {/* Mic button */}
          {hasSpeechRecognition && (
            <button
              onClick={startListening}
              disabled={isStreaming}
              title={isListening ? "Parar gravação" : "Falar com o assistente"}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all disabled:opacity-40 ${
                isListening
                  ? "bg-red-500 animate-pulse"
                  : "bg-secondary hover:bg-primary/10"
              }`}
            >
              {isListening ? (
                <MicOff size={18} className="text-white" />
              ) : (
                <Mic size={18} className="text-muted-foreground" />
              )}
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder={isListening ? "Ouvindo..." : "Pergunte ao ImobiAI..."}
            disabled={isListening}
            className="flex-1 rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
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
