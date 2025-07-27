-- Criar perfil para o admin@admin.local se não existir
INSERT INTO public.profiles (id, name, role)
SELECT 
  'a3772a82-9215-4974-95f2-334716f631ca'::uuid,
  'Admin User',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = 'a3772a82-9215-4974-95f2-334716f631ca'::uuid
);