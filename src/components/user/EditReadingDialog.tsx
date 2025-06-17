
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit3 } from 'lucide-react';
import { Meter, Reading } from '@/types';
import { addReading } from '@/lib/storage';

interface EditReadingDialogProps {
  meter: Meter;
  onReadingAdded: () => void;
}

const EditReadingDialog: React.FC<EditReadingDialogProps> = ({ meter, onReadingAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reading, setReading] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const readingValue = Number(reading);
    if (isNaN(readingValue) || readingValue < 0) {
      alert('Por favor, insira uma leitura válida');
      return;
    }

    const consumption = Math.max(0, readingValue - meter.initialReading);
    const isAlert = consumption > meter.threshold;

    const newReading: Omit<Reading, 'id'> = {
      meterId: meter.id,
      reading: readingValue,
      consumption,
      date: new Date().toISOString(),
      isAlert,
      meterType: meter.type,
      unitNumber: meter.unitNumber,
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
            <p className="text-sm text-gray-600 mt-1">
              Leitura inicial: {meter.initialReading.toLocaleString('pt-BR')}
            </p>
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
