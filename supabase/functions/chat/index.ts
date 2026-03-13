import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Get user from auth header
    const authHeader = req.headers.get("authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

    // Fetch user context
    const [profileRes, leadsRes, imoveisRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("leads").select("*").eq("corretor_id", user.id).limit(20),
      supabase.from("imoveis").select("*").eq("corretor_id", user.id).limit(20),
    ]);

    const profile = profileRes.data;
    const leads = leadsRes.data || [];
    const imoveis = imoveisRes.data || [];

    const systemPrompt = `Você é o ImobiAI, assistente pessoal de ${profile?.nome || "corretor"}, corretor de imóveis em ${profile?.cidade || "São Paulo"}.
Foco: ${(profile?.foco || []).join(", ") || "Residencial"}.
Meta mensal: R$ ${profile?.meta_mensal || 0}.

Responda SEMPRE em português brasileiro, seja direto e prático. Priorize ações concretas.
Use formatação markdown quando apropriado (negrito, listas, etc).

Contexto — Leads do corretor:
${leads.map((l: any) => `- ${l.nome} | Temp: ${l.temperatura} | Orçamento: R$${l.orcamento} | Bairros: ${(l.bairros || []).join(",")} | Status: ${l.status} | Obs: ${l.observacoes || "N/A"}`).join("\n") || "Nenhum lead cadastrado ainda."}

Imóveis do portfólio:
${imoveis.map((i: any) => `- ${i.titulo} | ${i.bairro} | R$${i.preco} | ${i.quartos}q | ${i.vagas}v | ${i.area_m2}m² | Status: ${i.status}`).join("\n") || "Nenhum imóvel cadastrado ainda."}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
