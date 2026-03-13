import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const userId = url.searchParams.get("state");

    if (!code || !userId) {
      return new Response("<html><body><h2>Erro: código ou estado ausente</h2></body></html>", {
        status: 400, headers: { "Content-Type": "text/html" },
      });
    }

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const redirectUri = `${supabaseUrl}/functions/v1/google-calendar-callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokenRes.ok || !tokens.access_token) {
      console.error("Token exchange failed:", tokens);
      return new Response("<html><body><h2>Erro ao obter tokens do Google</h2></body></html>", {
        status: 400, headers: { "Content-Type": "text/html" },
      });
    }

    // Save tokens using service role
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("profiles").update({
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token || null,
      google_token_expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
      google_calendar_connected: true,
    }).eq("id", userId);

    if (error) {
      console.error("DB update error:", error);
      return new Response("<html><body><h2>Erro ao salvar tokens</h2></body></html>", {
        status: 500, headers: { "Content-Type": "text/html" },
      });
    }

    // Redirect back to app config page
    const appUrl = req.headers.get("origin") || "https://id-preview--091aeb1b-e425-4bec-af11-5bc9721fddda.lovable.app";
    return new Response(`<html><head><meta http-equiv="refresh" content="0;url=${appUrl}/config?google=connected"></head><body><p>Conectado! Redirecionando...</p></body></html>`, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (e) {
    console.error("google-calendar-callback error:", e);
    return new Response("<html><body><h2>Erro interno</h2></body></html>", {
      status: 500, headers: { "Content-Type": "text/html" },
    });
  }
});
