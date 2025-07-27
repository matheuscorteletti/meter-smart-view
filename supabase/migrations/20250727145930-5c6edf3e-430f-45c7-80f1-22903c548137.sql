-- Criar usuário admin@admin.local
INSERT INTO auth.users (
  id,
  email, 
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  'admin@admin.local',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(), 
  now(),
  'authenticated',
  'authenticated'
);

-- Criar perfil para o usuário admin
INSERT INTO public.profiles (id, name, role)
SELECT 
  u.id,
  'Admin User',
  'admin'
FROM auth.users u 
WHERE u.email = 'admin@admin.local';