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