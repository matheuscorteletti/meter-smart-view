-- Inserir alguns edifícios de exemplo
INSERT INTO public.buildings (name, address, contact_email, contact_phone, active) VALUES
('Edifício Central', 'Rua das Flores, 123, Centro', 'admin@central.com', '(11) 1234-5678', true),
('Residencial Vista Verde', 'Av. das Palmeiras, 456, Jardim Botânico', 'contato@vistaverde.com', '(11) 9876-5432', true),
('Condomínio Águas Claras', 'Rua dos Lagos, 789, Águas Claras', 'administracao@aguasclaras.com', '(11) 5555-1234', true);

-- Buscar o ID do edifício Central para inserir unidades
WITH central_building AS (
  SELECT id FROM public.buildings WHERE name = 'Edifício Central' LIMIT 1
)
INSERT INTO public.units (building_id, number, floor, owner_name, owner_email, active) 
SELECT 
  cb.id,
  u.number,
  u.floor,
  u.owner_name,
  u.owner_email,
  true
FROM central_building cb
CROSS JOIN (
  VALUES 
    ('101', '1º', 'João Silva', 'joao.silva@email.com'),
    ('102', '1º', 'Maria Santos', 'maria.santos@email.com'),
    ('201', '2º', 'Pedro Costa', 'pedro.costa@email.com'),
    ('301', '3º', 'Ana Lima', 'ana.lima@email.com')
) AS u(number, floor, owner_name, owner_email);