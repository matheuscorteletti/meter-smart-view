import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Building, Unit } from '@/types';
import { useBuildings, useUnits, useMeters, useReadings } from '@/hooks/useSupabaseData';
import { FileText, Calendar as CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

const ReportsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [includeConsumption, setIncludeConsumption] = useState(true);
  const [includeAlerts, setIncludeAlerts] = useState(true);

  const { data: buildingsData = [] } = useBuildings();
  const { data: unitsData = [] } = useUnits();
  const { data: metersData = [] } = useMeters();
  const { data: readingsData = [] } = useReadings();

  useEffect(() => {
    setBuildings(buildingsData);
    setUnits(unitsData);
  }, [buildingsData, unitsData]);

  useEffect(() => {
    if (selectedBuilding === 'all') {
      setUnits(unitsData);
      setSelectedUnit('all');
    } else {
      const filteredUnits = unitsData.filter(unit => unit.buildingId === selectedBuilding);
      setUnits(filteredUnits);
      setSelectedUnit('all');
    }
  }, [selectedBuilding, unitsData]);

  const generatePDFReport = () => {
    try {
      const pdf = new jsPDF();
      
      // Título
      pdf.setFontSize(20);
      pdf.text('Relatório de Consumo', 20, 30);
      
      // Data de geração
      pdf.setFontSize(12);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
      
      // Filtros aplicados
      pdf.setFontSize(14);
      pdf.text('Filtros Aplicados:', 20, 65);
      
      pdf.setFontSize(10);
      let yPos = 75;
      
      if (selectedBuilding !== 'all') {
        const building = buildingsData.find(b => b.id === selectedBuilding);
        pdf.text(`Edifício: ${building?.name || 'N/A'}`, 25, yPos);
        yPos += 10;
      }
      
      if (selectedUnit !== 'all') {
        const unit = unitsData.find(u => u.id === selectedUnit);
        pdf.text(`Unidade: ${unit?.number || 'N/A'}`, 25, yPos);
        yPos += 10;
      }
      
      if (startDate) {
        pdf.text(`Data Inicial: ${format(startDate, 'dd/MM/yyyy')}`, 25, yPos);
        yPos += 10;
      }
      
      if (endDate) {
        pdf.text(`Data Final: ${format(endDate, 'dd/MM/yyyy')}`, 25, yPos);
        yPos += 10;
      }
      
      // Download do PDF
      pdf.save(`relatorio-consumo-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Gerar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerar Relatório de Consumo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="reportBuilding">Edifício</Label>
              <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os edifícios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os edifícios</SelectItem>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reportUnit">Unidade</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      Unidade {unit.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Data Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Incluir no Relatório</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeConsumption"
                    checked={includeConsumption}
                    onCheckedChange={(checked) => setIncludeConsumption(checked === true)}
                  />
                  <Label htmlFor="includeConsumption" className="text-sm">
                    Dados de consumo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeAlerts"
                    checked={includeAlerts}
                    onCheckedChange={(checked) => setIncludeAlerts(checked === true)}
                  />
                  <Label htmlFor="includeAlerts" className="text-sm">
                    Alertas de consumo alto
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={generatePDFReport}>
              <Download className="w-4 h-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportsDialog;