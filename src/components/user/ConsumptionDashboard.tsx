import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Building, Unit, Meter, Reading } from '@/types';
import { getBuildings, getUnits, getMeters, getReadings } from '@/lib/storage';
import { TrendingUp, Calendar as CalendarIcon, FileText, Download, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import ReportsDialog from './ReportsDialog';

interface ConsumptionData {
  date: string;
  agua: number;
  energia: number;
  building: string;
  unit: string;
}

const ConsumptionDashboard = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [summaryData, setSummaryData] = useState({
    totalWater: 0,
    totalEnergy: 0,
    avgWater: 0,
    avgEnergy: 0,
    alerts: 0,
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

  useEffect(() => {
    loadConsumptionData();
  }, [selectedBuilding, selectedUnit, selectedPeriod, startDate, endDate]);

  const loadConsumptionData = () => {
    const buildingsData = getBuildings();
    const unitsData = getUnits();
    const metersData = getMeters();
    const readingsData = getReadings();

    let filteredReadings = readingsData;

    // Filtrar por período
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

    // Filtrar por edifício e unidade
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

    // Processar dados para gráficos
    const dailyConsumption = new Map<string, { agua: number; energia: number; count: number }>();
    
    filteredReadings.forEach(reading => {
      const meter = metersData.find(m => m.id === reading.meterId);
      const unit = unitsData.find(u => u.id === meter?.unitId);
      const building = buildingsData.find(b => b.id === unit?.buildingId);
      
      if (!meter || !unit || !building) return;

      const dateKey = new Date(reading.date).toISOString().split('T')[0];
      
      if (!dailyConsumption.has(dateKey)) {
        dailyConsumption.set(dateKey, { agua: 0, energia: 0, count: 0 });
      }
      
      const dayData = dailyConsumption.get(dateKey)!;
      if (meter.type === 'water') {
        dayData.agua += reading.consumption;
      } else {
        dayData.energia += reading.consumption;
      }
      dayData.count++;
    });

    // Converter para array para gráficos
    const chartData: ConsumptionData[] = Array.from(dailyConsumption.entries()).map(([date, data]) => ({
      date: format(new Date(date), 'dd/MM', { locale: ptBR }),
      agua: data.agua,
      energia: data.energia,
      building: '',
      unit: '',
    })).sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());

    setConsumptionData(chartData);

    // Calcular resumo
    const totalWater = chartData.reduce((sum, item) => sum + item.agua, 0);
    const totalEnergy = chartData.reduce((sum, item) => sum + item.energia, 0);
    const alerts = filteredReadings.filter(r => r.isAlert).length;

    setSummaryData({
      totalWater,
      totalEnergy,
      avgWater: chartData.length > 0 ? totalWater / chartData.length : 0,
      avgEnergy: chartData.length > 0 ? totalEnergy / chartData.length : 0,
      alerts,
    });
  };

  const exportDataToCSV = () => {
    // Criar dados CSV
    const csvHeaders = ['Data', 'Água (L)', 'Energia (kWh)'];
    const csvData = consumptionData.map(item => [
      item.date,
      item.agua.toFixed(2),
      item.energia.toFixed(2)
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dados-consumo-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Dados exportados",
      description: "Os dados foram exportados com sucesso para CSV!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visualização de Consumo</h1>
          <p className="text-gray-600">Análise detalhada do consumo de água e energia</p>
        </div>
        <div className="flex gap-2">
          <ReportsDialog />
          <Button variant="outline" onClick={exportDataToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <SelectItem value="custom">Período personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedPeriod === 'custom' && (
            <>
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Total Água</CardTitle>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalWater.toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Média: {summaryData.avgWater.toFixed(1)}L/dia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Total Energia</CardTitle>
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalEnergy.toFixed(1)}kWh</div>
            <p className="text-xs text-muted-foreground">Média: {summaryData.avgEnergy.toFixed(1)}kWh/dia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.alerts}</div>
            <p className="text-xs text-muted-foreground">Consumos acima do limite</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medidores Ativos</CardTitle>
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getMeters().filter(m => m.isActive !== false).length}</div>
            <p className="text-xs text-muted-foreground">Total no sistema</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico expandido para largura total */}
      <Card>
        <CardHeader>
          <CardTitle>Consumo dos Últimos 30 Dias</CardTitle>
          <CardDescription>Evolução do consumo ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="agua" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Água (L)" />
              <Area type="monotone" dataKey="energia" stackId="1" stroke="#10B981" fill="#10B981" name="Energia (kWh)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tendência de Consumo</CardTitle>
          <CardDescription>Comparativo detalhado por tipo de recurso</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="agua" stroke="#3B82F6" strokeWidth={2} name="Água (L)" />
              <Line type="monotone" dataKey="energia" stroke="#10B981" strokeWidth={2} name="Energia (kWh)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsumptionDashboard;
