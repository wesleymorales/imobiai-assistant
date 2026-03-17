import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotifyPayload {
  to: string;
  message?: string;
  template?: string;
  params?: string[];
}

async function sendZAPIMessage(
  to: string,
  message: string
): Promise<{ success: boolean; message_id?: string; error?: string; debug?: unknown }> {
  const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
  const token = Deno.env.get("ZAPI_TOKEN");
  const clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");

  console.log("Z-API config check:", {
    hasInstanceId: !!instanceId,
    hasToken: !!token,
    hasClientToken: !!clientToken,
    instanceIdLength: instanceId?.length,
    tokenLength: token?.length,
  });

  if (!instanceId || !token) {
    return { success: false, error: "Z-API credentials not configured (missing ZAPI_INSTANCE_ID or ZAPI_TOKEN)" };
  }

  // Normalize phone: digits only, ensure country code 55
  let phone = to.replace(/\D/g, "");
  if (!phone.startsWith("55")) {
    phone = "55" + phone;
  }

  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;

  console.log("Z-API request:", { url, phone, messageLength: message.length });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (clientToken) {
    headers["Client-Token"] = clientToken;
  }

  const body = JSON.stringify({ phone, message });
  console.log("Z-API body:", body);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    const responseText = await res.text();
    console.log("Z-API response status:", res.status);
    console.log("Z-API response body:", responseText);

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    if (!res.ok) {
      return { success: false, error: `Z-API error (${res.status})`, debug: data };
    }

    // Z-API returns zapiMessageId or messageId on success
    const messageId = data?.zapiMessageId || data?.messageId || data?.id;
    return { success: true, message_id: messageId, debug: data };
  } catch (fetchError) {
    console.error("Z-API fetch error:", fetchError);
    return { success: false, error: `Fetch error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}` };
  }
}

function buildTemplateMessage(template: string, params: string[]): string {
  switch (template) {
    case "lembrete_visita":
      return `📅 *Lembrete de Visita*\n\nVocê tem uma visita agendada às *${params[0]}*:\n${params[1]}\n\nBoa visita! 🏠`;
    case "lead_inativo":
      return `⚠️ *Lead sem contato*\n\nO lead *${params[0]}* está sem interação há ${params[1]} dias.\n\nQue tal retomar o contato? 📞`;
    case "resumo_diario":
      return `☀️ *Bom dia! Seu resumo diário:*\n\n${params[0]}`;
    case "novo_lead":
      return `🆕 *Novo Lead Cadastrado*\n\nNome: *${params[0]}*\nTemperatura: ${params[1]}\n\nAcesse o app para mais detalhes!`;
    case "teste":
      return `✅ *Teste ImobiAI*\n\nSua integração com WhatsApp está funcionando! 🎉\n\nVocê receberá alertas de leads, visitas e resumo diário aqui.`;
    default:
      return params.join(" ");
  }
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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } =
      await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      console.error("Auth error:", claimsErr);
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: NotifyPayload = await req.json();
    console.log("Received payload:", JSON.stringify(payload));
    const { to, message, template, params } = payload;

    if (!to) {
      return new Response(
        JSON.stringify({ error: "Parâmetro obrigatório: to" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let finalMessage = message;
    if (!finalMessage && template) {
      finalMessage = buildTemplateMessage(template, params || []);
    }
    if (!finalMessage) {
      return new Response(
        JSON.stringify({ error: "Informe 'message' ou 'template' + 'params'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending message to:", to, "message:", finalMessage.substring(0, 50) + "...");

    const result = await sendZAPIMessage(to, finalMessage);
    console.log("Send result:", JSON.stringify(result));

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
