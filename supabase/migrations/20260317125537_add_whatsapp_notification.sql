-- Add whatsapp notification number to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_notification_number TEXT;

-- Track last whatsapp notification sent per lead to avoid spam
ALTER TABLE public.whatsapp_sessions
  ADD COLUMN IF NOT EXISTS last_inactive_notif_at TIMESTAMPTZ;
