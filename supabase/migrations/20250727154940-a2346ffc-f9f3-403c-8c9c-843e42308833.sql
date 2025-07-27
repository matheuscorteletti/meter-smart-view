-- Inserir alguns edifícios de exemplo
INSERT INTO public.buildings (name, address, contact_email, contact_phone, active) VALUES
('Edifício Central', 'Rua das Flores, 123, Centro', 'admin@central.com', '(11) 1234-5678', true),
('Residencial Vista Verde', 'Av. das Palmeiras, 456, Jardim Botânico', 'contato@vistaverde.com', '(11) 9876-5432', true),
('Condomínio Águas Claras', 'Rua dos Lagos, 789, Águas Claras', 'administracao@aguasclaras.com', '(11) 5555-1234', true)
ON CONFLICT (name) DO NOTHING;

-- Inserir algumas unidades de exemplo
INSERT INTO public.units (building_id, number, floor, owner_name, owner_email, active) 
SELECT 
  b.id,
  u.number,
  u.floor,
  u.owner_name,
  u.owner_email,
  true
FROM public.buildings b
CROSS JOIN (
  VALUES 
    ('101', '1º', 'João Silva', 'joao.silva@email.com'),
    ('102', '1º', 'Maria Santos', 'maria.santos@email.com'),
    ('201', '2º', 'Pedro Costa', 'pedro.costa@email.com'),
    ('301', '3º', 'Ana Lima', 'ana.lima@email.com')
) AS u(number, floor, owner_name, owner_email)
WHERE b.name = 'Edifício Central'
ON CONFLICT (building_id, number) DO NOTHING;

-- Inserir alguns medidores de exemplo
INSERT INTO public.meters (unit_id, serial_number, type, brand, model, threshold, total_digits, calculation_digits, initial_reading, active)
SELECT 
  u.id,
  m.serial_number,
  m.type::text,
  m.brand,
  m.model,
  m.threshold,
  8,
  5,
  0,
  true
FROM public.units u
CROSS JOIN (
  VALUES 
    ('AGU001', 'agua', 'Hidrômetros SA', 'HM-200', 50.00),
    ('ENE001', 'energia', 'EletricMed', 'EM-300', 200.00)
) AS m(serial_number, type, brand, model, threshold)
WHERE u.number = '101'
ON CONFLICT (serial_number) DO NOTHING;