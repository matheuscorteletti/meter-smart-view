import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building, Unit, Meter, Reading } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

// Hook para edifícios
export const useBuildings = () => {
  return useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      
      return data.map(building => ({
        id: building.id,
        name: building.name,
        address: building.address,
        contactEmail: building.contact_email,
        contactPhone: building.contact_phone,
        active: building.active,
      })) as Building[];
    },
  });
};

// Hook para unidades
export const useUnits = (buildingId?: string) => {
  return useQuery({
    queryKey: ['units', buildingId],
    queryFn: async () => {
      let query = supabase
        .from('units')
        .select('*')
        .eq('active', true)
        .order('number');
      
      if (buildingId) {
        query = query.eq('building_id', buildingId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(unit => ({
        id: unit.id,
        buildingId: unit.building_id,
        number: unit.number,
        floor: unit.floor,
        ownerName: unit.owner_name,
        ownerEmail: unit.owner_email,
        active: unit.active,
      })) as Unit[];
    },
  });
};

// Hook para medidores
export const useMeters = (unitId?: string) => {
  return useQuery({
    queryKey: ['meters', unitId],
    queryFn: async () => {
      let query = supabase
        .from('meters')
        .select('*')
        .eq('active', true)
        .order('type');
      
      if (unitId) {
        query = query.eq('unit_id', unitId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(meter => ({
        id: meter.id,
        unitId: meter.unit_id,
        serialNumber: meter.serial_number,
        type: meter.type as 'agua' | 'energia' | 'gas',
        brand: meter.brand,
        model: meter.model,
        installationDate: meter.installation_date,
        multiplier: Number(meter.multiplier),
        threshold: Number(meter.threshold),
        totalDigits: meter.total_digits,
        calculationDigits: meter.calculation_digits,
        initialReading: Number(meter.initial_reading),
        active: meter.active,
      })) as Meter[];
    },
  });
};

// Hook para leituras
export const useReadings = (meterId?: string) => {
  return useQuery({
    queryKey: ['readings', meterId],
    queryFn: async () => {
      let query = supabase
        .from('readings')
        .select('*')
        .order('reading_date', { ascending: false });
      
      if (meterId) {
        query = query.eq('meter_id', meterId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(reading => ({
        id: reading.id,
        meterId: reading.meter_id,
        readingDate: reading.reading_date,
        reading: Number(reading.reading),
        consumption: Number(reading.consumption),
        readerId: reading.reader_id,
        notes: reading.notes,
        isAlert: reading.is_alert,
        alertReason: reading.alert_reason,
      })) as Reading[];
    },
  });
};

// Hook para usuários do Supabase
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Buscar perfis diretamente e criar uma query para incluir emails dos usuários conhecidos
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      
      // Mapear usuários conhecidos com emails
      const usersMap = new Map([
        ['24b7774d-8edb-4ed2-b731-f0099f64b48a', 'admin@demo.com'],
        ['fd3e14a6-fba6-4552-9236-ceb560186f4b', 'user@demo.com'],
        ['bcdf4965-cc16-4717-b638-5f4f46c22074', 'viewer@demo.com'],
        ['8756dbb4-a692-4aa9-849e-7e794e7e8147', 'admin@admin.local'],
        ['a3734093-29e2-4413-80e5-bef2b61d3d2b', 'matheuscorteletti@gmail.com'],
      ]);
      
      return profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: usersMap.get(profile.id) || 'email@nao-encontrado.com',
        role: profile.role as 'admin' | 'user' | 'viewer',
        buildingId: profile.building_id,
        unitId: profile.unit_id,
        active: profile.active,
      }));
    },
  });
};

// Mutations para criar/editar/deletar dados
export const useBuildingMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (building: Partial<Building> & { id?: string; delete?: boolean }) => {
      if (building.delete && building.id) {
        // Delete - marcar como inativo em vez de deletar
        const { data, error } = await supabase
          .from('buildings')
          .update({ active: false })
          .eq('id', building.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
      
      const buildingData = {
        name: building.name,
        address: building.address,
        contact_email: building.contactEmail,
        contact_phone: building.contactPhone,
        active: building.active ?? true,
      };
      
      if (building.id) {
        // Update
        const { data, error } = await supabase
          .from('buildings')
          .update(buildingData)
          .eq('id', building.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('buildings')
          .insert(buildingData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
};

export const useUnitMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (unit: Partial<Unit> & { id?: string; delete?: boolean }) => {
      if (unit.delete && unit.id) {
        // Delete - marcar como inativo em vez de deletar
        const { data, error } = await supabase
          .from('units')
          .update({ active: false })
          .eq('id', unit.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
      
      const unitData = {
        building_id: unit.buildingId,
        number: unit.number,
        floor: unit.floor,
        owner_name: unit.ownerName,
        owner_email: unit.ownerEmail,
        active: unit.active ?? true,
      };
      
      if (unit.id) {
        // Update
        const { data, error } = await supabase
          .from('units')
          .update(unitData)
          .eq('id', unit.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('units')
          .insert(unitData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};

export const useMeterMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (meter: Partial<Meter> & { id?: string; delete?: boolean }) => {
      if (meter.delete && meter.id) {
        // Delete - marcar como inativo em vez de deletar
        const { data, error } = await supabase
          .from('meters')
          .update({ active: false })
          .eq('id', meter.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
      
      const meterData = {
        unit_id: meter.unitId,
        serial_number: meter.serialNumber || '',
        type: meter.type,
        brand: meter.brand,
        model: meter.model,
        installation_date: meter.installationDate,
        multiplier: meter.multiplier || 1,
        threshold: meter.threshold,
        total_digits: meter.totalDigits || 8,
        calculation_digits: meter.calculationDigits || 5,
        initial_reading: meter.initialReading || 0,
        active: meter.active ?? true,
      };
      
      if (meter.id) {
        // Update
        const { data, error } = await supabase
          .from('meters')
          .update(meterData)
          .eq('id', meter.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('meters')
          .insert(meterData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meters'] });
    },
  });
};

export const useReadingMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (reading: Partial<Reading> & { id?: string }) => {
      const readingData = {
        meter_id: reading.meterId,
        reading_date: reading.readingDate,
        reading: reading.reading,
        consumption: reading.consumption,
        reader_id: user?.id,
        notes: reading.notes,
        is_alert: reading.isAlert,
        alert_reason: reading.alertReason,
      };
      
      if (reading.id) {
        // Update
        const { data, error } = await supabase
          .from('readings')
          .update(readingData)
          .eq('id', reading.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('readings')
          .insert(readingData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });
};