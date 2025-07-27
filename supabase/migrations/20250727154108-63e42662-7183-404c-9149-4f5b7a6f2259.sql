-- Corrigir os roles dos usuários para corresponder à interface

-- admin@demo.com deve ser admin
UPDATE public.profiles 
SET role = 'admin', name = 'Administrador'
WHERE id = '24b7774d-8edb-4ed2-b731-f0099f64b48a';

-- viewer@demo.com deve ser viewer  
UPDATE public.profiles 
SET role = 'viewer', name = 'Maria Santos'
WHERE id = 'bcdf4965-cc16-4717-b638-5f4f46c22074';

-- user@demo.com ajustar o nome
UPDATE public.profiles 
SET name = 'João Silva'
WHERE id = 'fd3e14a6-fba6-4552-9236-ceb560186f4b';