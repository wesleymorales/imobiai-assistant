-- Add CPF column to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cpf text;

-- Create storage bucket for property photos
INSERT INTO storage.buckets (id, name, public) VALUES ('imoveis-fotos', 'imoveis-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their folder
CREATE POLICY "Users can upload imovel photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'imoveis-fotos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read
CREATE POLICY "Public read imovel photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'imoveis-fotos');

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own imovel photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'imoveis-fotos' AND (storage.foldername(name))[1] = auth.uid()::text);