
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit3 } from 'lucide-react';
import { Meter, Reading } from '@/types';
import { addReading } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

interface EditReadingDialogProps {
  meter: Meter;
  onReadingAdded: () => void;
}

const EditReadingDialog: React.FC<EditReadingDialogProps> = ({ meter, onReadingAdded }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reading, setReading] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const readingValue = Number(reading);
    if (isNaN(readingValue) || readingValue < 0) {
      alert('Por favor, insira uma leitura válida');
      return;
    }

    const lastReading = meter.latestReading?.reading || meter.initialReading;
    const consumption = Math.max(0, readingValue - lastReading);
    const isAlert = consumption > meter.threshold;

    const newReading: Omit<Reading, 'id'> = {
      meterId: meter.id,
      reading: readingValue,
      consumption,
      date: new Date().toISOString(),
      isAlert,
      meterType: meter.type,
      unitNumber: meter.unitNumber,
      launchedBy: user?.name || 'Usuário',
    };

    addReading(newReading);
    onReadingAdded();
    setReading('');
    setIsOpen(false);
  };

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
            <Input
              id="reading"
              type="number"
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              placeholder="Digite a leitura atual"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Leitura
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReadingDialog;
