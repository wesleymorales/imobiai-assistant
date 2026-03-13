import { useState } from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-coral mb-3 shadow-lg shadow-primary/20">
            <Bot size={32} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ImobiAI</h1>
          <p className="text-sm text-muted-foreground mt-1">Seu assistente imobiliário</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-2xl bg-secondary px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl bg-secondary px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <Link to="/">
            <button className="w-full rounded-2xl gradient-coral py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform mt-2">
              Entrar
            </button>
          </Link>

          <button className="w-full rounded-2xl border-2 border-border bg-card py-4 text-sm font-medium text-foreground active:bg-secondary transition-colors">
            Continuar com Google
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold text-primary">
            Criar conta
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
