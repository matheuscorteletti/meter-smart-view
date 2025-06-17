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
    const totalReadings = filteredReadings.length;
    const activeMeters = metersData.filter(m => m.isActive !== false).length;

    // Gerar PDF usando jsPDF
    const doc = new jsPDF();
    let yPos = 30;
    
    // Função para adicionar nova página se necessário
    const checkPageSpace = (neededSpace: number) => {
      if (yPos + neededSpace > 280) {
        doc.addPage();
        yPos = 30;
      }
    };

    // Cabeçalho
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text('RELATÓRIO DE CONSUMO', 105, yPos, { align: 'center' });
    yPos += 15;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${format(now, 'dd/MM/yyyy HH:mm:ss')}`, 105, yPos, { align: 'center' });
    yPos += 20;

    // Informações de Filtros
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('INFORMAÇÕES DO RELATÓRIO', 20, yPos);
    yPos += 15;

    // Caixa de informações
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, yPos - 5, 170, 30);
    
    doc.setFontSize(10);
    const periodText = selectedPeriod === 'custom' && startDate && endDate
      ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
      : `Últimos ${selectedPeriod} dias`;
    
    const buildingText = selectedBuilding === 'all' 
      ? 'Todos os Edifícios' 
      : buildingsData.find(b => b.id === selectedBuilding)?.name || 'N/A';
    
    const unitText = selectedUnit === 'all'
      ? 'Todas as Unidades'
      : `Unidade ${unitsData.find(u => u.id === selectedUnit)?.number || 'N/A'}`;
    
    doc.text(`Período: ${periodText}`, 25, yPos + 5);
    doc.text(`Edifício: ${buildingText}`, 25, yPos + 12);
    doc.text(`Unidade: ${unitText}`, 25, yPos + 19);
    yPos += 40;

    // Resumo Executivo
    if (reportOptions.includeSummary) {
      checkPageSpace(50);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('RESUMO EXECUTIVO', 20, yPos);
      yPos += 15;
      
      // Tabela de resumo
      doc.setDrawColor(200, 200, 200);
      doc.rect(20, yPos - 5, 170, 50);
      
      // Cabeçalhos da tabela
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPos - 5, 85, 10, 'F');
      doc.rect(105, yPos - 5, 85, 10, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('MÉTRICA', 22, yPos + 2);
      doc.text('VALOR', 107, yPos + 2);
      yPos += 12;
      
      // Dados do resumo
      const summaryData = [
        ['Consumo Total de Água', `${totalWater.toFixed(3)} m³ (${(totalWater * 1000).toFixed(0)} L)`],
        ['Consumo Total de Energia', `${totalEnergy.toFixed(1)} kWh`],
        ['Total de Alertas', alerts.toString()],
        ['Total de Leituras', totalReadings.toString()],
        ['Medidores Ativos', activeMeters.toString()]
      ];
      
      summaryData.forEach(([metric, value], index) => {
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(20, yPos - 2, 170, 8, 'F');
        }
        doc.text(metric, 22, yPos + 2);
        doc.text(value, 107, yPos + 2);
        yPos += 8;
      });
      
      yPos += 15;
    }

    // Análise de Alertas
    if (reportOptions.includeAlerts && alerts > 0) {
      checkPageSpace(40);
      
      doc.setFontSize(14);
      doc.text('ANÁLISE DE ALERTAS', 20, yPos);
      yPos += 15;
      
      const alertReadings = filteredReadings.filter(r => r.isAlert);
      
      doc.setFontSize(10);
      doc.text(`Foram identificados ${alerts} alertas de consumo elevado no período.`, 20, yPos);
      yPos += 8;
      
      if (alertReadings.length > 0) {
        const waterAlerts = alertReadings.filter(r => 
          metersData.find(m => m.id === r.meterId)?.type === 'water'
        ).length;
        const energyAlerts = alertReadings.filter(r => 
          metersData.find(m => m.id === r.meterId)?.type === 'energy'
        ).length;
        
        doc.text(`• Alertas de Água: ${waterAlerts}`, 25, yPos);
        yPos += 6;
        doc.text(`• Alertas de Energia: ${energyAlerts}`, 25, yPos);
        yPos += 15;
      }
    }

    // Dados Detalhados
    if (reportOptions.includeDetails && filteredReadings.length > 0) {
      checkPageSpace(60);
      
      doc.setFontSize(14);
      doc.text('DADOS DETALHADOS', 20, yPos);
      yPos += 15;
      
      // Cabeçalho da tabela
      doc.setFillColor(52, 73, 94);
      doc.rect(20, yPos - 5, 170, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('Data', 22, yPos);
      doc.text('Edifício', 40, yPos);
      doc.text('Unidade', 70, yPos);
      doc.text('Tipo', 90, yPos);
      doc.text('Leitura', 110, yPos);
      doc.text('Consumo', 130, yPos);
      doc.text('Limite', 150, yPos);
      doc.text('Alerta', 170, yPos);
      yPos += 8;
      
      doc.setTextColor(0, 0, 0);
      
      // Mostrar até 25 leituras mais recentes
      const sortedReadings = filteredReadings
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 25);
      
      sortedReadings.forEach((reading, index) => {
        checkPageSpace(8);
        
        const meter = metersData.find(m => m.id === reading.meterId);
        const unit = unitsData.find(u => u.id === meter?.unitId);
        const building = buildingsData.find(b => b.id === unit?.buildingId);
        
        if (!meter || !unit || !building) return;
        
        // Alternar cor de fundo
        if (index % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(20, yPos - 2, 170, 6, 'F');
        }
        
        // Destacar alertas
        if (reading.isAlert) {
          doc.setFillColor(254, 242, 242);
          doc.rect(20, yPos - 2, 170, 6, 'F');
        }
        
        doc.setFontSize(7);
        doc.text(format(new Date(reading.date), 'dd/MM/yy'), 22, yPos + 2);
        doc.text(building.name.substring(0, 12), 40, yPos + 2);
        doc.text(unit.number.substring(0, 8), 70, yPos + 2);
        doc.text(meter.type === 'water' ? 'Água' : 'Energia', 90, yPos + 2);
        doc.text(reading.reading.toString(), 110, yPos + 2);
        // Updated consumption display with proper units
        const consumptionText = meter.type === 'water' 
          ? `${reading.consumption.toFixed(3)}m³`  
          : `${reading.consumption.toFixed(1)}kWh`;
        doc.text(consumptionText, 130, yPos + 2);
        doc.text(meter.threshold?.toString() || 'N/A', 150, yPos + 2);
        doc.text(reading.isAlert ? 'SIM' : 'Não', 170, yPos + 2);
        
        yPos += 6;
      });
      
      if (filteredReadings.length > 25) {
        yPos += 5;
        doc.setFontSize(8);
        doc.text(`... e mais ${filteredReadings.length - 25} leituras não exibidas`, 20, yPos);
      }
    }

    // Rodapé
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Página ${i} de ${totalPages}`, 105, 290, { align: 'center' });
      doc.text('Sistema de Gestão de Consumo', 20, 290);
    }
    
    // Salvar PDF
    doc.save(`relatorio-consumo-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);

    toast({
      title: "Relatório PDF gerado",
      description: "O relatório completo foi gerado e baixado com sucesso!",
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
