import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit3 } from 'lucide-react';
import { Meter, Reading } from '@/types';
import { useReadings, useReadingMutation } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';

interface EditReadingDialogProps {
  meter: Meter;
  onReadingAdded: () => void;
}

const EditReadingDialog: React.FC<EditReadingDialogProps> = ({ meter, onReadingAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previousReading, setPreviousReading] = useState<number>(0);
  const [readingValue, setReadingValue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const { user } = useAuth();
  
  const { data: readings = [] } = useReadings();
  const readingMutation = useReadingMutation();

  useEffect(() => {
    // Get the latest reading from Supabase
    const meterReadings = readings
      .filter(r => r.meterId === meter.id)
      .sort((a, b) => new Date(b.readingDate || '').getTime() - new Date(a.readingDate || '').getTime());
    
    const latest = meterReadings[0];
    if (latest) {
      setPreviousReading(latest?.reading || meter.initialReading);
    } else {
      setPreviousReading(meter.initialReading);
    }
  }, [meter.id, meter.initialReading, readings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const reading = parseFloat(readingValue);
    if (isNaN(reading) || reading < 0) {
      alert('Por favor, insira uma leitura válida');
      return;
    }

    if (reading < previousReading) {
      alert('A nova leitura não pode ser menor que a anterior');
      return;
    }

    const consumption = reading - previousReading;
    const isAlert = consumption > meter.threshold;

    try {
      await readingMutation.mutateAsync({
        meterId: meter.id,
        readingDate: new Date().toISOString().split('T')[0],
        reading,
        consumption,
        notes,
        isAlert,
        alertReason: isAlert ? `Consumo alto: ${consumption.toFixed(2)}` : undefined,
      });

      setReadingValue('');
      setNotes('');
      setIsOpen(false);
      onReadingAdded();
    } catch (error) {
      alert('Erro ao salvar leitura. Tente novamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full">
          <Edit3 className="w-4 h-4 mr-2" />
          Adicionar Leitura
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Leitura</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meterType" className="text-right">
              Tipo
            </Label>
            <div className="col-span-3">
              <Input
                id="meterType"
                value={meter.type === 'agua' ? 'Água' : meter.type === 'energia' ? 'Energia' : 'Gás'}
                disabled
                className="capitalize"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="previousReading" className="text-right">
              Leitura Anterior
            </Label>
            <div className="col-span-3">
              <Input
                id="previousReading"
                value={previousReading.toLocaleString('pt-BR')}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reading" className="text-right">
              Nova Leitura *
            </Label>
            <div className="col-span-3">
              <Input
                id="reading"
                type="number"
                value={readingValue}
                onChange={(e) => setReadingValue(e.target.value)}
                placeholder="Digite a nova leitura"
                required
                min={previousReading}
                step="0.01"
              />
            </div>
          </div>

          {readingValue && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Consumo</Label>
              <div className="col-span-3">
                <Input
                  value={`${(parseFloat(readingValue) - previousReading).toFixed(2)} ${meter.type === 'agua' ? 'm³' : 'kWh'}`}
                  disabled
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Observações
            </Label>
            <div className="col-span-3">
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre a leitura (opcional)"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!readingValue}>
              Salvar Leitura
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReadingDialog;