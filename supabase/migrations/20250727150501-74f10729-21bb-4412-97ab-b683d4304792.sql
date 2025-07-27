-- Deletar o usuário admin@admin.local criado manualmente
DELETE FROM auth.users WHERE email = 'admin@admin.local';

-- Deletar o perfil também
DELETE FROM public.profiles WHERE id = 'a3772a82-9215-4974-95f2-334716f631ca';