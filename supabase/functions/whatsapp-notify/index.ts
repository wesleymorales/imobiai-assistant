import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Supported notification types and their Meta-approved template names
type TemplateType =
  | "lembrete_visita"
  | "lead_inativo"
  | "resumo_diario"
  | "novo_lead";

const TEMPLATE_NAMES: Record<TemplateType, string> = {
  lembrete_visita: "imobiai_lembrete_visita",
  lead_inativo: "imobiai_lead_inativo",
  resumo_diario: "imobiai_resumo_diario",
  novo_lead: "imobiai_novo_lead",
};

interface NotifyPayload {
  to: string; // phone number with country code, e.g. "5511999999999"
  template: TemplateType;
  params: string[]; // template body parameters in order
}

async function sendWhatsAppMessage(
  to: string,
  templateName: string,
  params: string[]
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  const token = Deno.env.get("WHATSAPP_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

  if (!token || !phoneNumberId) {
    return { success: false, error: "WhatsApp credentials not configured" };
  }

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: "pt_BR" },
      components: [
        {
          type: "body",
          parameters: params.map((text) => ({ type: "text", text })),
        },
      ],
    },
  };

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("WhatsApp API error:", data);
    return { success: false, error: data?.error?.message || "WhatsApp API error" };
  }

  return { success: true, message_id: data?.messages?.[0]?.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } =
      await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: NotifyPayload = await req.json();
    const { to, template, params } = payload;

    if (!to || !template || !params) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios: to, template, params" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const templateName = TEMPLATE_NAMES[template];
    if (!templateName) {
      return new Response(
        JSON.stringify({ error: `Template desconhecido: ${template}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize phone number (remove non-digits, ensure starts with country code)
    const normalized = to.replace(/\D/g, "");

    const result = await sendWhatsAppMessage(normalized, templateName, params);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("whatsapp-notify error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
