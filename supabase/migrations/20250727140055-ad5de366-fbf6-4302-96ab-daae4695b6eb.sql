-- Criar tabela de prédios
CREATE TABLE public.buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de unidades
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  floor TEXT NOT NULL,
  owner_name TEXT,
  owner_email TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(building_id, number)
);

-- Criar tabela de medidores
CREATE TABLE public.meters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('water', 'energy')),
  serial_number TEXT UNIQUE NOT NULL,
  brand TEXT,
  model TEXT,
  total_digits INTEGER NOT NULL DEFAULT 8,
  calculation_digits INTEGER NOT NULL DEFAULT 5,
  initial_reading DECIMAL(12,5) NOT NULL DEFAULT 0,
  threshold DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
  active BOOLEAN DEFAULT TRUE,
  installation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de leituras
CREATE TABLE public.readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meter_id UUID NOT NULL REFERENCES public.meters(id) ON DELETE CASCADE,
  reading DECIMAL(12,5) NOT NULL,
  consumption DECIMAL(12,5) NOT NULL DEFAULT 0,
  reading_date DATE NOT NULL,
  is_alert BOOLEAN DEFAULT FALSE,
  alert_reason TEXT,
  notes TEXT,
  reader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(meter_id, reading_date)
);

-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'viewer')) DEFAULT 'user',
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Políticas RLS para buildings
CREATE POLICY "Anyone can view buildings" 
ON public.buildings FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage buildings" 
ON public.buildings FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Políticas RLS para units
CREATE POLICY "Anyone can view units" 
ON public.units FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage units" 
ON public.units FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Políticas RLS para meters
CREATE POLICY "Anyone can view meters" 
ON public.meters FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage meters" 
ON public.meters FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Políticas RLS para readings
CREATE POLICY "Anyone can view readings" 
ON public.readings FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create readings" 
ON public.readings FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all readings" 
ON public.readings FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Função para trigger de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_buildings_updated_at
  BEFORE UPDATE ON public.buildings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meters_updated_at
  BEFORE UPDATE ON public.meters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_readings_updated_at
  BEFORE UPDATE ON public.readings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função e trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email), 
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Índices para performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_building ON public.profiles(building_id);
CREATE INDEX idx_units_building ON public.units(building_id);
CREATE INDEX idx_meters_unit ON public.meters(unit_id);
CREATE INDEX idx_meters_type ON public.meters(type);
CREATE INDEX idx_readings_meter ON public.readings(meter_id);
CREATE INDEX idx_readings_date ON public.readings(reading_date);
CREATE INDEX idx_readings_alert ON public.readings(is_alert);