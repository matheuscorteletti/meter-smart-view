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
    includeCharts: true,
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

  // Função para desenhar gráfico de barras simples
  const drawBarChart = (doc: jsPDF, x: number, y: number, width: number, height: number, data: any[], title: string) => {
    // Título do gráfico
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(title, x, y - 5);
    
    // Borda do gráfico
    doc.setDrawColor(200, 200, 200);
    doc.rect(x, y, width, height);
    
    if (data.length === 0) return;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = width / data.length * 0.8;
    const spacing = width / data.length * 0.2;
    
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * (height - 20);
      const barX = x + (index * (barWidth + spacing)) + spacing/2;
      const barY = y + height - barHeight - 10;
      
      // Desenhar barra
      doc.setFillColor(52, 152, 219);
      doc.rect(barX, barY, barWidth, barHeight, 'F');
      
      // Label do valor
      doc.setFontSize(8);
      doc.text(item.value.toString(), barX + barWidth/2, barY - 2, { align: 'center' });
      
      // Label da categoria
      doc.text(item.label, barX + barWidth/2, y + height + 5, { align: 'center' });
    });
  };

  // Função para desenhar gráfico de pizza simples
  const drawPieChart = (doc: jsPDF, centerX: number, centerY: number, radius: number, data: any[], title: string) => {
    // Título do gráfico
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(title, centerX, centerY - radius - 10, { align: 'center' });
    
    if (data.length === 0) return;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    const colors = [
      [52, 152, 219],  // Azul
      [46, 204, 113],  // Verde
      [231, 76, 60],   // Vermelho
      [241, 196, 15],  // Amarelo
      [155, 89, 182],  // Roxo
    ];
    
    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 360;
      const color = colors[index % colors.length];
      
      // Desenhar fatia
      doc.setFillColor(color[0], color[1], color[2]);
      
      // Criar pontos para a fatia
      const startAngle = currentAngle * Math.PI / 180;
      const endAngle = (currentAngle + sliceAngle) * Math.PI / 180;
      
      const x1 = centerX + Math.cos(startAngle) * radius;
      const y1 = centerY + Math.sin(startAngle) * radius;
      const x2 = centerX + Math.cos(endAngle) * radius;
      const y2 = centerY + Math.sin(endAngle) * radius;
      
      // Desenhar triângulo para simular fatia
      doc.triangle(centerX, centerY, x1, y1, x2, y2, 'F');
      
      // Label da porcentagem
      const labelAngle = (currentAngle + sliceAngle/2) * Math.PI / 180;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      const percentage = ((item.value / total) * 100).toFixed(1);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(`${percentage}%`, labelX, labelY, { align: 'center' });
      
      currentAngle += sliceAngle;
    });
    
    // Legenda
    data.forEach((item, index) => {
      const color = colors[index % colors.length];
      const legendY = centerY + radius + 15 + (index * 10);
      
      // Quadrado colorido
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(centerX - 60, legendY - 3, 5, 5, 'F');
      
      // Texto da legenda
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text(`${item.label}: ${item.value}`, centerX - 50, legendY);
    });
  };

  // Função para desenhar gráfico de linha
  const drawLineChart = (doc: jsPDF, x: number, y: number, width: number, height: number, data: any[], title: string) => {
    // Título do gráfico
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(title, x, y - 5);
    
    // Borda do gráfico
    doc.setDrawColor(200, 200, 200);
    doc.rect(x, y, width, height);
    
    if (data.length < 2) return;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;
    
    // Desenhar pontos e linhas
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(2);
    
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = x + 10 + (i / (data.length - 1)) * (width - 20);
      const y1 = y + height - 10 - ((data[i].value - minValue) / valueRange) * (height - 20);
      const x2 = x + 10 + ((i + 1) / (data.length - 1)) * (width - 20);
      const y2 = y + height - 10 - ((data[i + 1].value - minValue) / valueRange) * (height - 20);
      
      doc.line(x1, y1, x2, y2);
      
      // Pontos
      doc.setFillColor(52, 152, 219);
      doc.circle(x1, y1, 2, 'F');
    }
    
    // Último ponto
    const lastX = x + 10 + ((data.length - 1) / (data.length - 1)) * (width - 20);
    const lastY = y + height - 10 - ((data[data.length - 1].value - minValue) / valueRange) * (height - 20);
    doc.circle(lastX, lastY, 2, 'F');
    
    // Labels dos eixos
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    data.forEach((item, index) => {
      const labelX = x + 10 + (index / (data.length - 1)) * (width - 20);
      doc.text(item.label, labelX, y + height + 8, { align: 'center' });
    });
  };

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
      
      // Dados do resumo com formatação brasileira corrigida
      const summaryData = [
        ['Consumo Total de Água', `${totalWater.toLocaleString('pt-BR')}m³ (${(totalWater * 1000).toLocaleString('pt-BR')} litros)`],
        ['Consumo Total de Energia', `${totalEnergy.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}kWh`],
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

    // Gráficos
    if (reportOptions.includeCharts && filteredReadings.length > 0) {
      // Nova página para gráficos
      doc.addPage();
      yPos = 30;
      
      doc.setFontSize(18);
      doc.setTextColor(44, 62, 80);
      doc.text('ANÁLISE GRÁFICA', 105, yPos, { align: 'center' });
      yPos += 20;

      // Gráfico 1: Consumo por Tipo
      const waterConsumption = filteredReadings
        .filter(r => metersData.find(m => m.id === r.meterId)?.type === 'water')
        .reduce((sum, r) => sum + r.consumption, 0);
      
      const energyConsumption = filteredReadings
        .filter(r => metersData.find(m => m.id === r.meterId)?.type === 'energy')
        .reduce((sum, r) => sum + r.consumption, 0);

      const consumptionByType = [
        { label: 'Água (m³)', value: Math.round(waterConsumption) },
        { label: 'Energia (kWh)', value: Math.round(energyConsumption) }
      ];

      drawBarChart(doc, 20, yPos, 80, 50, consumptionByType, 'Consumo por Tipo');

      // Gráfico 2: Alertas por Edifício
      const alertsByBuilding = buildingsData.map(building => {
        const buildingUnits = unitsData.filter(u => u.buildingId === building.id);
        const buildingMeters = metersData.filter(m => 
          buildingUnits.some(u => u.id === m.unitId)
        );
        const buildingAlerts = filteredReadings.filter(r => 
          r.isAlert && buildingMeters.some(m => m.id === r.meterId)
        ).length;
        
        return {
          label: building.name.substring(0, 8),
          value: buildingAlerts
        };
      }).filter(item => item.value > 0);

      if (alertsByBuilding.length > 0) {
        drawPieChart(doc, 150, yPos + 25, 25, alertsByBuilding, 'Alertas por Edifício');
      }

      yPos += 80;

      // Gráfico 3: Consumo ao Longo do Tempo (últimos 7 dias)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const timeSeriesData = last7Days.map(date => {
        const dayReadings = filteredReadings.filter(r => 
          new Date(r.date).toISOString().split('T')[0] === date
        );
        const totalConsumption = dayReadings.reduce((sum, r) => sum + r.consumption, 0);
        
        return {
          label: format(new Date(date), 'dd/MM'),
          value: Math.round(totalConsumption)
        };
      });

      if (timeSeriesData.some(d => d.value > 0)) {
        drawLineChart(doc, 20, yPos, 170, 60, timeSeriesData, 'Consumo nos Últimos 7 Dias');
        yPos += 80;
      }

      // Gráfico 4: Consumo por Edifício
      const consumptionByBuilding = buildingsData.map(building => {
        const buildingUnits = unitsData.filter(u => u.buildingId === building.id);
        const buildingMeters = metersData.filter(m => 
          buildingUnits.some(u => u.id === m.unitId)
        );
        const buildingReadings = filteredReadings.filter(r => 
          buildingMeters.some(m => m.id === r.meterId)
        );
        const totalConsumption = buildingReadings.reduce((sum, r) => sum + r.consumption, 0);
        
        return {
          label: building.name.substring(0, 8),
          value: Math.round(totalConsumption)
        };
      }).filter(item => item.value > 0);

      if (consumptionByBuilding.length > 0) {
        checkPageSpace(80);
        drawBarChart(doc, 20, yPos, 170, 60, consumptionByBuilding, 'Consumo por Edifício');
        yPos += 80;
      }
    }

    // Análise Detalhada de Alertas
    if (reportOptions.includeAlerts && alerts > 0) {
      checkPageSpace(60);
      
      doc.setFontSize(16);
      doc.setTextColor(220, 53, 69);
      doc.text('🚨 ANÁLISE DETALHADA DE ALERTAS', 20, yPos);
      yPos += 20;
      
      const alertReadings = filteredReadings.filter(r => r.isAlert);
      
      // Análise por edifício
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('ALERTAS POR EDIFÍCIO', 20, yPos);
      yPos += 10;
      
      buildingsData.forEach(building => {
        const buildingUnits = unitsData.filter(u => u.buildingId === building.id);
        const buildingMeters = metersData.filter(m => 
          buildingUnits.some(u => u.id === m.unitId)
        );
        const buildingAlerts = alertReadings.filter(r => 
          buildingMeters.some(m => m.id === r.meterId)
        );
        
        if (buildingAlerts.length > 0) {
          const waterAlerts = buildingAlerts.filter(r => 
            metersData.find(m => m.id === r.meterId)?.type === 'water'
          ).length;
          const energyAlerts = buildingAlerts.filter(r => 
            metersData.find(m => m.id === r.meterId)?.type === 'energy'
          ).length;
          
          doc.setFontSize(10);
          doc.setFillColor(254, 242, 242);
          doc.rect(20, yPos - 3, 170, 12, 'F');
          doc.setTextColor(220, 53, 69);
          doc.text(`${building.name}: ${buildingAlerts.length} alertas`, 25, yPos + 2);
          doc.setTextColor(100, 100, 100);
          doc.text(`(${waterAlerts} água, ${energyAlerts} energia)`, 25, yPos + 8);
          yPos += 18;
        }
      });
      
      yPos += 10;
      
      // TOP 5 Maiores Ofensores
      checkPageSpace(60);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('🏆 TOP 5 MAIORES OFENSORES', 20, yPos);
      yPos += 10;
      
      // Calcular consumo por unidade
      const consumptionByUnit = unitsData.map(unit => {
        const unitMeters = metersData.filter(m => m.unitId === unit.id);
        const unitReadings = filteredReadings.filter(r => 
          unitMeters.some(m => m.id === r.meterId)
        );
        const unitAlerts = unitReadings.filter(r => r.isAlert).length;
        const totalConsumption = unitReadings.reduce((sum, r) => sum + r.consumption, 0);
        const building = buildingsData.find(b => b.id === unit.buildingId);
        
        return {
          unitNumber: unit.number,
          buildingName: building?.name || 'N/A',
          consumption: totalConsumption,
          alerts: unitAlerts,
          readings: unitReadings.length
        };
      })
      .filter(item => item.consumption > 0)
      .sort((a, b) => b.consumption - a.consumption)
      .slice(0, 5);
      
      consumptionByUnit.forEach((unit, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
        
        if (index < 3) {
          doc.setFillColor(255, 248, 220);
        } else {
          doc.setFillColor(248, 249, 250);
        }
        doc.rect(20, yPos - 3, 170, 15, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${medal} Unidade ${unit.unitNumber} - ${unit.buildingName}`, 25, yPos + 3);
        doc.setTextColor(100, 100, 100);
        doc.text(`Consumo: ${unit.consumption.toLocaleString('pt-BR')} | Alertas: ${unit.alerts} | Leituras: ${unit.readings}`, 25, yPos + 9);
        
        yPos += 20;
      });
      
      yPos += 10;
      
      // Estatísticas de Alertas
      checkPageSpace(40);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('📊 ESTATÍSTICAS DE ALERTAS', 20, yPos);
      yPos += 10;
      
      const totalUnitsWithAlerts = new Set(
        alertReadings.map(r => {
          const meter = metersData.find(m => m.id === r.meterId);
          return meter?.unitId;
        }).filter(Boolean)
      ).size;
      
      const avgAlertsPerUnit = totalUnitsWithAlerts > 0 ? (alerts / totalUnitsWithAlerts).toFixed(1) : '0';
      const alertRate = totalReadings > 0 ? ((alerts / totalReadings) * 100).toFixed(1) : '0';
      
      const alertStats = [
        `• Unidades com alertas: ${totalUnitsWithAlerts}`,
        `• Média de alertas por unidade: ${avgAlertsPerUnit}`,
        `• Taxa de alertas: ${alertRate}% das leituras`,
        `• Período de maior incidência: ${format(new Date(), 'MMMM/yyyy', { locale: ptBR })}`
      ];
      
      doc.setFontSize(10);
      alertStats.forEach(stat => {
        doc.text(stat, 25, yPos);
        yPos += 8;
      });
      
      yPos += 15;
      
      // Recomendações
      checkPageSpace(40);
      doc.setFontSize(12);
      doc.setTextColor(25, 135, 84);
      doc.text('💡 RECOMENDAÇÕES', 20, yPos);
      yPos += 10;
      
      const recommendations = [
        '• Realizar auditoria nos maiores consumidores identificados',
        '• Implementar programa de conscientização sobre consumo sustentável',
        '• Verificar possíveis vazamentos ou equipamentos defeituosos',
        '• Estabelecer metas de redução de consumo por edifício',
        '• Considerar implementação de medidores inteligentes'
      ];
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      recommendations.forEach(rec => {
        doc.text(rec, 25, yPos);
        yPos += 8;
      });
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
        doc.text(reading.reading.toLocaleString('pt-BR'), 110, yPos + 2);
        // Updated consumption display with corrected Brazilian formatting
        const consumptionText = meter.type === 'water' 
          ? `${reading.consumption.toLocaleString('pt-BR')}m³`  
          : `${reading.consumption.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}kWh`;
        doc.text(consumptionText, 130, yPos + 2);
        doc.text(meter.threshold?.toLocaleString('pt-BR') || 'N/A', 150, yPos + 2);
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
      description: "O relatório completo com análise detalhada de alertas foi gerado e baixado com sucesso!",
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
            Configure os parâmetros para gerar um relatório detalhado de consumo com gráficos
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
                  id="charts"
                  checked={reportOptions.includeCharts}
                  onCheckedChange={(checked) => 
                    setReportOptions(prev => ({ ...prev, includeCharts: checked as boolean }))
                  }
                />
                <Label htmlFor="charts">Gráficos e Análises</Label>
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
