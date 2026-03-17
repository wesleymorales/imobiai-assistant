import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

// This function is designed to be called by a Supabase cron job.
// It handles two types of scheduled WhatsApp notifications:
//   1. Daily morning briefing (eventos do dia + leads quentes)
//   2. Inactive leads alert (leads sem contato há 3+ dias)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendWhatsApp(
  to: string,
  templateName: string,
  params: string[]
): Promise<boolean> {
  const token = Deno.env.get("WHATSAPP_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  if (!token || !phoneNumberId) return false;

  const normalized = to.replace(/\D/g, "");
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalized,
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
      }),
    }
  );
  return res.ok;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const nowBRT = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    const todayStart = new Date(nowBRT);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(nowBRT);
    todayEnd.setHours(23, 59, 59, 999);

    const body = await req.json().catch(() => ({}));
    const mode: "briefing" | "inactive" = body.mode ?? "briefing";

    let briefingSent = 0;
    let inactiveSent = 0;

    if (mode === "briefing") {
      // Fetch all users with resumo diario enabled and a whatsapp number
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, nome, whatsapp_notification_number")
        .eq("notif_resumo_diario", true)
        .not("whatsapp_notification_number", "is", null);

      for (const profile of profiles ?? []) {
        if (!profile.whatsapp_notification_number) continue;

        // Count today's events
        const { count: eventCount } = await admin
          .from("eventos_agenda")
          .select("id", { count: "exact", head: true })
          .eq("corretor_id", profile.id)
          .gte("data_inicio", todayStart.toISOString())
          .lte("data_inicio", todayEnd.toISOString());

        // Count hot leads (temperatura >= 70)
        const { count: hotLeads } = await admin
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("corretor_id", profile.id)
          .gte("temperatura", 70);

        const ok = await sendWhatsApp(
          profile.whatsapp_notification_number,
          "imobiai_resumo_diario",
          [String(eventCount ?? 0), String(hotLeads ?? 0)]
        );
        if (ok) briefingSent++;
      }
    }

    if (mode === "inactive") {
      // 3 days ago
      const threeDaysAgo = new Date(nowBRT);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: profiles } = await admin
        .from("profiles")
        .select("id, whatsapp_notification_number")
        .eq("notif_leads_inativos", true)
        .not("whatsapp_notification_number", "is", null);

      for (const profile of profiles ?? []) {
        if (!profile.whatsapp_notification_number) continue;

        // Find inactive leads (ultima_interacao older than 3 days)
        const { data: inactiveLeads } = await admin
          .from("leads")
          .select("id, nome, ultima_interacao")
          .eq("corretor_id", profile.id)
          .lt("ultima_interacao", threeDaysAgo.toISOString())
          .neq("status", "fechado")
          .limit(3); // cap at 3 notifications per run

        for (const lead of inactiveLeads ?? []) {
          const lastContact = new Date(lead.ultima_interacao);
          const diffDays = Math.floor(
            (nowBRT.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
          );
          const ok = await sendWhatsApp(
            profile.whatsapp_notification_number,
            "imobiai_lead_inativo",
            [lead.nome, String(diffDays)]
          );
          if (ok) inactiveSent++;
        }
      }
    }

    return new Response(
      JSON.stringify({ mode, briefingSent, inactiveSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("whatsapp-scheduled error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
