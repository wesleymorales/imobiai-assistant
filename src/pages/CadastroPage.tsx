import { useState } from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";

export default function CadastroPage() {
  const [form, setForm] = useState({ nome: "", whatsapp: "", email: "", senha: "" });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const fields = [
    { key: "nome", label: "Nome completo", type: "text", placeholder: "Seu nome" },
    { key: "whatsapp", label: "WhatsApp", type: "tel", placeholder: "(11) 99999-9999" },
    { key: "email", label: "E-mail", type: "email", placeholder: "seu@email.com" },
    { key: "senha", label: "Senha", type: "password", placeholder: "••••••••" },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-coral mb-3">
            <Bot size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Criar conta</h1>
        </div>

        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full rounded-2xl bg-secondary px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ))}

          <Link to="/">
            <button className="w-full rounded-2xl gradient-coral py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform mt-2">
              Criar conta
            </button>
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{" "}
          <Link to="/login" className="font-semibold text-primary">
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
