
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  cidade TEXT,
  foco TEXT[] DEFAULT '{}',
  meta_mensal NUMERIC DEFAULT 0,
  comissao_media NUMERIC DEFAULT 1.5,
  ticket_medio NUMERIC DEFAULT 0,
  taxa_conversao NUMERIC DEFAULT 0,
  visitas_por_semana INT DEFAULT 0,
  google_calendar_connected BOOLEAN DEFAULT FALSE,
  whatsapp_connected BOOLEAN DEFAULT FALSE,
  notif_visitas BOOLEAN DEFAULT TRUE,
  notif_leads_inativos BOOLEAN DEFAULT TRUE,
  notif_resumo_diario BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  orcamento NUMERIC,
  bairros TEXT[] DEFAULT '{}',
  quartos_min INT,
  tipo_imovel_preferido TEXT,
  perfil TEXT,
  renda_mensal_estimada NUMERIC,
  como_chegou TEXT,
  urgencia TEXT,
  possui_imovel_vender BOOLEAN DEFAULT FALSE,
  valor_imovel_atual NUMERIC,
  forma_pagamento TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'novo',
  temperatura INT DEFAULT 50,
  ultima_interacao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own leads" ON public.leads FOR ALL USING (auth.uid() = corretor_id) WITH CHECK (auth.uid() = corretor_id);

-- Imoveis table
CREATE TABLE public.imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  tipo TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  preco NUMERIC,
  area_m2 NUMERIC,
  quartos INT,
  vagas INT,
  condominio NUMERIC,
  diferenciais TEXT[] DEFAULT '{}',
  descricao TEXT,
  status TEXT DEFAULT 'disponivel',
  fotos_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own imoveis" ON public.imoveis FOR ALL USING (auth.uid() = corretor_id) WITH CHECK (auth.uid() = corretor_id);

-- Eventos agenda
CREATE TABLE public.eventos_agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  tipo TEXT,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE SET NULL,
  notas TEXT,
  google_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.eventos_agenda ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own eventos" ON public.eventos_agenda FOR ALL USING (auth.uid() = corretor_id) WITH CHECK (auth.uid() = corretor_id);

-- Scripts
CREATE TABLE public.scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  tipo TEXT,
  tom TEXT,
  conteudo TEXT,
  usado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scripts" ON public.scripts FOR ALL USING (auth.uid() = corretor_id) WITH CHECK (auth.uid() = corretor_id);

-- Mensagens chat
CREATE TABLE public.mensagens_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mensagens_chat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own messages" ON public.mensagens_chat FOR ALL USING (auth.uid() = corretor_id) WITH CHECK (auth.uid() = corretor_id);

-- Interacoes
CREATE TABLE public.interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  corretor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT,
  descricao TEXT,
  objecoes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.interacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own interacoes" ON public.interacoes FOR ALL USING (auth.uid() = corretor_id) WITH CHECK (auth.uid() = corretor_id);

-- Calculadoras meta
CREATE TABLE public.calculadoras_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  renda_desejada NUMERIC,
  comissao_media NUMERIC,
  ticket_medio NUMERIC,
  visitas_semana INT,
  taxa_conversao NUMERIC,
  resultado_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.calculadoras_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own calculadoras" ON public.calculadoras_meta FOR ALL USING (auth.uid() = corretor_id) WITH CHECK (auth.uid() = corretor_id);

-- WhatsApp sessions
CREATE TABLE public.whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  session_data TEXT,
  status TEXT DEFAULT 'disconnected',
  connected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own whatsapp" ON public.whatsapp_sessions FOR ALL USING (auth.uid() = corretor_id) WITH CHECK (auth.uid() = corretor_id);
