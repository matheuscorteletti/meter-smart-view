
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit3 } from 'lucide-react';
import { Meter, Reading } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface EditReadingDialogProps {
  meter: Meter & { unitNumber: string };
  onReadingAdded: () => void;
}

const EditReadingDialog: React.FC<EditReadingDialogProps> = ({ meter, onReadingAdded }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reading, setReading] = useState('');
  const [currentReading, setCurrentReading] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchLatestReading();
    }
  }, [isOpen, meter.id]);

  const fetchLatestReading = async () => {
    try {
      const { data: readings } = await supabase
        .from('readings')
        .select('reading')
        .eq('meter_id', meter.id)
        .order('reading_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1);
      
      const latestReading = readings && readings.length > 0 ? readings[0].reading : meter.initialReading;
      setCurrentReading(Number(latestReading));
    } catch (error) {
      console.error('Erro ao buscar leituras:', error);
      setCurrentReading(Number(meter.initialReading));
    }
  };

  const validateReading = (value: string) => {
    setError('');
    
    if (!value) return;

    const numValue = Number(value);
    
    // Check if it's a valid number
    if (isNaN(numValue)) {
      setError('Por favor, insira um valor numérico válido');
      return;
    }

    // Check if it's not lower than current reading
    if (numValue <= currentReading) {
      setError(`O valor deve ser maior que a leitura atual: ${currentReading.toLocaleString('pt-BR')}`);
      return;
    }

    // Check digits count if defined
    if (meter.totalDigits && value.length !== meter.totalDigits) {
      setError(`O valor deve conter exatamente ${meter.totalDigits} dígitos`);
      return;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReading(value);
    validateReading(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const readingValue = Number(reading);
    
    // Final validation
    if (isNaN(readingValue) || readingValue <= currentReading) {
      setError(`O valor deve ser maior que a leitura atual: ${currentReading.toLocaleString('pt-BR')}`);
      return;
    }

    if (meter.totalDigits && reading.length !== meter.totalDigits) {
      setError(`O valor deve conter exatamente ${meter.totalDigits} dígitos`);
      return;
    }

    try {
      const consumption = Math.max(0, readingValue - currentReading);
      const isAlert = consumption > Number(meter.threshold);

      const newReading = {
        meter_id: meter.id,
        reading: readingValue,
        consumption,
        reading_date: new Date().toISOString().split('T')[0],
        is_alert: isAlert,
        reader_id: user?.id,
      };

      const { error } = await supabase
        .from('readings')
        .insert([newReading]);

      if (error) {
        throw new Error(error.message);
      }

      onReadingAdded();
      setReading('');
      setError('');
      setIsOpen(false);
      
      toast({
        title: "Leitura registrada",
        description: `Leitura de ${readingValue.toLocaleString('pt-BR')} registrada com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao registrar leitura",
        variant: "destructive",
      });
    }
  };

  const isFormValid = reading && !error && Number(reading) > currentReading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit3 className="w-4 h-4 mr-2" />
          Lançar Leitura
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lançar Nova Leitura</DialogTitle>
          <DialogDescription>
            Medidor de {meter.type === 'water' ? 'Água' : 'Energia'} - Unidade {meter.unitNumber}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reading">Leitura Atual</Label>
            <div className="space-y-2">
              <Input
                id="reading"
                type="number"
                value={reading}
                onChange={handleInputChange}
                placeholder={`Digite a leitura atual (maior que ${currentReading.toLocaleString('pt-BR')})`}
                required
                min={currentReading + 1}
                className={error ? 'border-red-500' : ''}
              />
              <div className="text-sm text-gray-600">
                <p>Leitura anterior: <strong>{currentReading.toLocaleString('pt-BR')}</strong></p>
                {meter.totalDigits && (
                  <p>Deve conter exatamente <strong>{meter.totalDigits} dígitos</strong></p>
                )}
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              Salvar Leitura
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReadingDialog;
