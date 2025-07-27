import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Building, Unit, Meter, Reading } from '@/types';
import { useBuildings, useUnits, useMeters, useReadings } from '@/hooks/useSupabaseData';
import { TrendingUp, Calendar as CalendarIcon, Download, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

const ConsumptionDashboard = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [chartData, setChartData] = useState<any[]>([]);

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

  const loadConsumptionData = () => {
    let filteredReadings = readingsData;

    // Filtrar por edifício
    if (selectedBuilding !== 'all') {
      const buildingUnits = unitsData.filter(unit => unit.buildingId === selectedBuilding);
      const buildingUnitIds = buildingUnits.map(unit => unit.id);
      const buildingMeters = metersData.filter(meter => buildingUnitIds.includes(meter.unitId));
      const buildingMeterIds = buildingMeters.map(meter => meter.id);
      filteredReadings = filteredReadings.filter(reading => buildingMeterIds.includes(reading.meterId));
    }

    // Filtrar por unidade
    if (selectedUnit !== 'all') {
      const unitMeters = metersData.filter(meter => meter.unitId === selectedUnit);
      const unitMeterIds = unitMeters.map(meter => meter.id);
      filteredReadings = filteredReadings.filter(reading => unitMeterIds.includes(reading.meterId));
    }

    // Processar dados para o gráfico
    const consumptionByMonth = filteredReadings.reduce((acc: any, reading) => {
      const meter = metersData.find(m => m.id === reading.meterId);
      if (!meter) return acc;

      const unit = unitsData.find(u => u.id === meter?.unitId);
      if (!unit) return acc;

      const month = new Date(reading.readingDate || '').toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      });

      if (!acc[month]) {
        acc[month] = { month, agua: 0, energia: 0 };
      }

      if (meter.type === 'agua') {
        acc[month].agua += reading.consumption || 0;
      } else if (meter.type === 'energia') {
        acc[month].energia += reading.consumption || 0;
      }

      return acc;
    }, {});

    const chartData = Object.values(consumptionByMonth);
    setChartData(chartData);
  };

  useEffect(() => {
    loadConsumptionData();
  }, [selectedBuilding, selectedUnit, startDate, endDate, buildingsData, unitsData, metersData, readingsData]);

  const chartConfig = {
    agua: {
      label: "Água (m³)",
      color: "hsl(221, 83%, 53%)",
    },
    energia: {
      label: "Energia (kWh)",
      color: "hsl(142, 76%, 36%)",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Consumo</h1>
        <p className="text-gray-600">Visualize e analise o consumo de água e energia</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione os critérios para análise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="building">Edifício</Label>
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
              <Label htmlFor="unit">Unidade</Label>
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
        </CardContent>
      </Card>

      {/* Gráfico de Consumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Consumo por Período</span>
          </CardTitle>
          <CardDescription>Análise de consumo de água e energia</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="agua" fill="var(--color-agua)" name="Água (m³)" />
              <Bar dataKey="energia" fill="var(--color-energia)" name="Energia (kWh)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Medidores</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metersData.filter(m => m.active !== false).length}</div>
            <p className="text-xs text-muted-foreground">Total no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leituras Registradas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readingsData.length}</div>
            <p className="text-xs text-muted-foreground">Total de registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {readingsData.filter(r => r.isAlert).length}
            </div>
            <p className="text-xs text-muted-foreground">Consumos acima do limite</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsumptionDashboard;