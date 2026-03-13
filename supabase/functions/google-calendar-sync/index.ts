import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Refresh failed: ${JSON.stringify(data)}`);
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Get body - either sync a single event or all unsync'd
    const body = await req.json().catch(() => ({}));
    const eventId = body.event_id;

    // Get profile tokens using service role
    const adminSupabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: profile } = await adminSupabase.from("profiles")
      .select("google_access_token, google_refresh_token, google_token_expires_at, google_calendar_connected")
      .eq("id", userId).single();

    if (!profile?.google_calendar_connected || !profile.google_refresh_token) {
      return new Response(JSON.stringify({ error: "Google Calendar não conectado" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if token needs refresh
    let accessToken = profile.google_access_token;
    const expiresAt = new Date(profile.google_token_expires_at || 0);
    if (expiresAt.getTime() < Date.now() + 60000) {
      const refreshed = await refreshAccessToken(profile.google_refresh_token);
      accessToken = refreshed.access_token;
      await adminSupabase.from("profiles").update({
        google_access_token: accessToken,
        google_token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
      }).eq("id", userId);
    }

    // Fetch events to sync
    let query = supabase.from("eventos_agenda").select("*").eq("corretor_id", userId);
    if (eventId) {
      query = query.eq("id", eventId);
    } else {
      query = query.is("google_event_id", null);
    }
    const { data: eventos } = await query;

    if (!eventos || eventos.length === 0) {
      return new Response(JSON.stringify({ synced: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let synced = 0;
    for (const evento of eventos) {
      const gcEvent = {
        summary: evento.titulo,
        description: evento.notas || "",
        start: {
          dateTime: evento.data_inicio,
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: evento.data_fim || evento.data_inicio,
          timeZone: "America/Sao_Paulo",
        },
      };

      const method = evento.google_event_id ? "PATCH" : "POST";
      const gcUrl = evento.google_event_id
        ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${evento.google_event_id}`
        : "https://www.googleapis.com/calendar/v3/calendars/primary/events";

      const gcRes = await fetch(gcUrl, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gcEvent),
      });

      const gcData = await gcRes.json();
      if (gcRes.ok && gcData.id) {
        await supabase.from("eventos_agenda")
          .update({ google_event_id: gcData.id })
          .eq("id", evento.id);
        synced++;
      } else {
        console.error("GC API error for event", evento.id, gcData);
      }
    }

    return new Response(JSON.stringify({ synced }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("google-calendar-sync error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
