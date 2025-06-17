import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Building, Unit } from '@/types';
import { getBuildings, getUnits, getMeters, getReadings } from '@/lib/storage';
import { FileText, Calendar as CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const ReportsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportOptions, setReportOptions] = useState({
    includeCharts: true,
    includeSummary: true,
    includeDetails: true,
    includeAlerts: true,
  });

  useEffect(() => {
    const buildingsData = getBuildings();
    const unitsData = getUnits();
    setBuildings(buildingsData);
    setUnits(unitsData);
  }, []);

  useEffect(() => {
    // Filtrar unidades quando um edifício é selecionado
    if (selectedBuilding === 'all') {
      setUnits(getUnits());
      setSelectedUnit('all');
    } else {
      const filteredUnits = getUnits().filter(unit => unit.buildingId === selectedBuilding);
      setUnits(filteredUnits);
      setSelectedUnit('all');
    }
  }, [selectedBuilding]);

  const generatePDFReport = () => {
    // Coletar dados para o relatório
    const buildingsData = getBuildings();
    const unitsData = getUnits();
    const metersData = getMeters();
    const readingsData = getReadings();

    let filteredReadings = readingsData;

    // Aplicar filtros
    const now = new Date();
    let dateFrom = new Date();
    
    if (selectedPeriod === 'custom' && startDate && endDate) {
      dateFrom = startDate;
      filteredReadings = filteredReadings.filter(r => {
        const readingDate = new Date(r.date);
        return readingDate >= startDate && readingDate <= endDate;
      });
    } else {
      dateFrom.setDate(now.getDate() - parseInt(selectedPeriod));
      filteredReadings = filteredReadings.filter(r => new Date(r.date) >= dateFrom);
    }

    if (selectedBuilding !== 'all' || selectedUnit !== 'all') {
      let buildingUnits = unitsData;
      
      if (selectedBuilding !== 'all') {
        buildingUnits = buildingUnits.filter(u => u.buildingId === selectedBuilding);
      }
      
      if (selectedUnit !== 'all') {
        buildingUnits = buildingUnits.filter(u => u.id === selectedUnit);
      }
      
      const buildingMeters = metersData.filter(m => buildingUnits.some(u => u.id === m.unitId));
      filteredReadings = filteredReadings.filter(r => buildingMeters.some(m => m.id === r.meterId));
    }

    // Processar dados
    const totalWater = filteredReadings
      .filter(r => metersData.find(m => m.id === r.meterId)?.type === 'water')
      .reduce((sum, r) => sum + r.consumption, 0);
    
    const totalEnergy = filteredReadings
      .filter(r => metersData.find(m => m.id === r.meterId)?.type === 'energy')
      .reduce((sum, r) => sum + r.consumption, 0);

    const alerts = filteredReadings.filter(r => r.isAlert).length;

    // Gerar PDF usando jsPDF
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Relatório de Consumo', 20, 30);
    
    // Período
    const periodText = selectedPeriod === 'custom' && startDate && endDate
      ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
      : `Últimos ${selectedPeriod} dias`;
    doc.setFontSize(12);
    doc.text(`Período: ${periodText}`, 20, 45);
    
    // Edifício e Unidade
    const buildingText = selectedBuilding === 'all' 
      ? 'Todos os Edifícios' 
      : buildingsData.find(b => b.id === selectedBuilding)?.name || 'N/A';
    const unitText = selectedUnit === 'all'
      ? 'Todas as Unidades'
      : `Unidade ${unitsData.find(u => u.id === selectedUnit)?.number || 'N/A'}`;
    
    doc.text(`Edifício: ${buildingText}`, 20, 55);
    doc.text(`Unidade: ${unitText}`, 20, 65);
    
    // Resumo
    if (reportOptions.includeSummary) {
      doc.setFontSize(14);
      doc.text('Resumo Executivo', 20, 85);
      doc.setFontSize(10);
      doc.text(`Consumo Total de Água: ${totalWater.toFixed(1)} L`, 20, 100);
      doc.text(`Consumo Total de Energia: ${totalEnergy.toFixed(1)} kWh`, 20, 110);
      doc.text(`Total de Alertas: ${alerts}`, 20, 120);
      doc.text(`Total de Leituras: ${filteredReadings.length}`, 20, 130);
    }
    
    // Detalhes
    if (reportOptions.includeDetails && filteredReadings.length > 0) {
      doc.setFontSize(14);
      doc.text('Dados Detalhados', 20, 150);
      doc.setFontSize(8);
      
      let yPos = 165;
      doc.text('Data', 20, yPos);
      doc.text('Tipo', 50, yPos);
      doc.text('Leitura', 80, yPos);
      doc.text('Consumo', 110, yPos);
      doc.text('Alerta', 140, yPos);
      
      filteredReadings.slice(0, 20).forEach((reading, index) => {
        const meter = metersData.find(m => m.id === reading.meterId);
        yPos += 10;
        
        if (yPos > 280) {
          doc.addPage();
          yPos = 30;
        }
        
        doc.text(format(new Date(reading.date), 'dd/MM/yyyy'), 20, yPos);
        doc.text(meter?.type === 'water' ? 'Água' : 'Energia', 50, yPos);
        doc.text(reading.reading.toString(), 80, yPos);
        doc.text(reading.consumption.toFixed(1), 110, yPos);
        doc.text(reading.isAlert ? 'Sim' : 'Não', 140, yPos);
      });
    }
    
    // Salvar PDF
    doc.save(`relatorio-consumo-${format(new Date(), 'yyyy-MM-dd')}.pdf`);

    toast({
      title: "Relatório PDF gerado",
      description: "O relatório foi gerado e baixado com sucesso!",
    });

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <FileText className="w-4 h-4 mr-2" />
          Gerar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerar Relatório PDF</DialogTitle>
          <DialogDescription>
            Configure os parâmetros para gerar um relatório detalhado de consumo
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Edifício</Label>
              <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Edifícios</SelectItem>
                  {buildings.map(building => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Unidades</SelectItem>
                  {units.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      Unidade {unit.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                  <SelectItem value="custom">Período personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPeriod === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Opções do Relatório */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Incluir no Relatório</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="summary"
                  checked={reportOptions.includeSummary}
                  onCheckedChange={(checked) => 
                    setReportOptions(prev => ({ ...prev, includeSummary: checked as boolean }))
                  }
                />
                <Label htmlFor="summary">Resumo Executivo</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="details"
                  checked={reportOptions.includeDetails}
                  onCheckedChange={(checked) => 
                    setReportOptions(prev => ({ ...prev, includeDetails: checked as boolean }))
                  }
                />
                <Label htmlFor="details">Dados Detalhados</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alerts"
                  checked={reportOptions.includeAlerts}
                  onCheckedChange={(checked) => 
                    setReportOptions(prev => ({ ...prev, includeAlerts: checked as boolean }))
                  }
                />
                <Label htmlFor="alerts">Alertas e Anomalias</Label>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={generatePDFReport}>
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
