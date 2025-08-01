-- Inserir usuário usando função auth.users nativa
SELECT auth.uid() as current_user_id;

-- Criar usuário admin usando extensão do Supabase
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@admin.local',
  crypt('admin123', gen_salt('bf')),
  now(),
  null,
  null,
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin User"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);