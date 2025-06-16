
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Meter, Reading } from '@/types';
import { getMeters, getReadings, saveReadings } from '@/lib/storage';
import { Droplets, Zap, Plus, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const UserDashboard = () => {
  const { user } = useAuth();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [newReading, setNewReading] = useState('');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (user?.unitId) {
      const allMeters = getMeters();
      const userMeters = allMeters.filter(meter => meter.unitId === user.unitId);
      setMeters(userMeters);

      const allReadings = getReadings();
      const userReadings = allReadings.filter(reading => {
        const meter = userMeters.find(m => m.id === reading.meterId);
        return meter !== undefined;
      });

      // Adicionar informações do medidor às leituras
      const readingsWithMeterInfo = userReadings.map(reading => {
        const meter = userMeters.find(m => m.id === reading.meterId);
        return {
          ...reading,
          meterType: meter?.type || 'unknown'
        };
      });

      setReadings(readingsWithMeterInfo);

      // Preparar dados para gráfico
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const chartData = last30Days.map(date => {
        const dayReadings = readingsWithMeterInfo.filter(r => 
          r.date.split('T')[0] === date
        );
        
        return {
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          agua: dayReadings.find(r => r.meterType === 'water')?.consumption || 0,
          energia: dayReadings.find(r => r.meterType === 'energy')?.consumption || 0,
        };
      });

      setChartData(chartData);
    }
  }, [user]);

  const handleAddReading = () => {
    if (!selectedMeter || !newReading) return;

    const readingValue = parseInt(newReading);
    
    // Validar número de dígitos
    if (newReading.length !== selectedMeter.totalDigits) {
      toast({
        title: "Erro na leitura",
        description: `A leitura deve ter exatamente ${selectedMeter.totalDigits} dígitos.`,
        variant: "destructive",
      });
      return;
    }

    // Calcular consumo baseado nos dígitos de cálculo
    const lastReading = readings
      .filter(r => r.meterId === selectedMeter.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const previousReading = lastReading ? lastReading.reading : selectedMeter.initialReading;
    
    // Extrair apenas os dígitos para cálculo
    const currentCalcValue = Math.floor(readingValue / Math.pow(10, selectedMeter.totalDigits - selectedMeter.calculationDigits));
    const previousCalcValue = Math.floor(previousReading / Math.pow(10, selectedMeter.totalDigits - selectedMeter.calculationDigits));
    
    const consumption = Math.max(0, currentCalcValue - previousCalcValue);
    const isAlert = consumption > selectedMeter.threshold;

    const newReadingEntry: Reading = {
      id: `reading-${Date.now()}`,
      meterId: selectedMeter.id,
      reading: readingValue,
      consumption,
      date: new Date().toISOString(),
      isAlert,
      meterType: selectedMeter.type,
    };

    const updatedReadings = [...readings, newReadingEntry];
    setReadings(updatedReadings);
    
    // Salvar sem as informações extras
    const readingsToSave = updatedReadings.map(({ meterType, ...reading }) => reading);
    saveReadings([...getReadings(), newReadingEntry]);

    setNewReading('');
    setIsDialogOpen(false);

    if (isAlert) {
      toast({
        title: "⚠️ Consumo Alto Detectado",
        description: `Consumo de ${consumption} ${selectedMeter.type === 'water' ? 'L' : 'kWh'} está acima do limite!`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Leitura registrada",
        description: `Consumo: ${consumption} ${selectedMeter.type === 'water' ? 'L' : 'kWh'}`,
      });
    }
  };

  const getCurrentConsumption = (meter: Meter) => {
    const meterReadings = readings.filter(r => r.meterId === meter.id);
    if (meterReadings.length === 0) return 0;
    
    const lastReading = meterReadings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return lastReading.consumption;
  };

  const getMeterIcon = (type: string) => {
    return type === 'water' ? Droplets : Zap;
  };

  const getMeterColor = (type: string) => {
    return type === 'water' 
      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
      : 'bg-gradient-to-r from-yellow-500 to-orange-500';
  };

  const getTotalConsumption = (type: 'water' | 'energy') => {
    return readings
      .filter(r => r.meterType === type)
      .reduce((total, reading) => total + reading.consumption, 0);
  };

  const getAlertsCount = () => {
    return readings.filter(r => r.isAlert).length;
  };

  const StatCard = ({ title, value, unit, icon: Icon, color, isAlert = false }) => (
    <Card className={`hover:shadow-lg transition-shadow ${isAlert ? 'ring-2 ring-red-200' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <span>{value}</span>
          <span className="text-sm font-normal text-gray-600">{unit}</span>
          {isAlert && <AlertTriangle className="w-4 h-4 text-red-500" />}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Olá, {user?.name}!</h1>
        <p className="text-gray-600">Acompanhe seu consumo de água e energia</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Consumo de Água (mês)"
          value={getTotalConsumption('water')}
          unit="L"
          icon={Droplets}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Consumo de Energia (mês)"
          value={getTotalConsumption('energy')}
          unit="kWh"
          icon={Zap}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Alertas Ativos"
          value={getAlertsCount()}
          unit="alertas"
          icon={AlertTriangle}
          color="bg-gradient-to-r from-red-500 to-red-600"
          isAlert={getAlertsCount() > 0}
        />
      </div>

      {/* Alertas */}
      {readings.some(r => r.isAlert) && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>Atenção!</strong> Você possui leituras com consumo acima do limite estabelecido.
            Verifique seu consumo para evitar gastos excessivos.
          </AlertDescription>
        </Alert>
      )}

      {/* Gráfico de consumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Histórico de Consumo (30 dias)</span>
          </CardTitle>
          <CardDescription>Acompanhe a evolução do seu consumo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="agua" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Água (L)" 
              />
              <Line 
                type="monotone" 
                dataKey="energia" 
                stroke="#F59E0B" 
                strokeWidth={3}
                name="Energia (kWh)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Medidores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seus Medidores</CardTitle>
            <CardDescription>Registre as leituras dos seus medidores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {meters.map((meter) => {
              const MeterIcon = getMeterIcon(meter.type);
              const currentConsumption = getCurrentConsumption(meter);
              const isOverThreshold = currentConsumption > meter.threshold;
              
              return (
                <div key={meter.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${getMeterColor(meter.type)} rounded-lg flex items-center justify-center`}>
                      <MeterIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">
                        {meter.type === 'water' ? 'Água' : 'Energia'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Consumo atual: {currentConsumption} {meter.type === 'water' ? 'L' : 'kWh'}
                      </p>
                      {isOverThreshold && (
                        <Badge variant="destructive" className="mt-1">
                          Acima do limite
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedMeter(meter);
                      setIsDialogOpen(true);
                    }}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Leitura
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Histórico recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Leituras Recentes</span>
            </CardTitle>
            <CardDescription>Suas últimas 5 leituras registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {readings
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((reading) => {
                  const MeterIcon = getMeterIcon(reading.meterType || 'energy');
                  return (
                    <div key={reading.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MeterIcon className={`w-5 h-5 ${reading.meterType === 'water' ? 'text-blue-500' : 'text-orange-500'}`} />
                        <div>
                          <p className="font-medium capitalize">
                            {reading.meterType === 'water' ? 'Água' : 'Energia'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(reading.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${reading.isAlert ? 'text-red-600' : 'text-gray-900'}`}>
                          {reading.consumption} {reading.meterType === 'water' ? 'L' : 'kWh'}
                        </p>
                        {reading.isAlert && (
                          <Badge variant="destructive" className="text-xs">
                            Alto
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              {readings.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma leitura registrada ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para adicionar leitura */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Adicionar Leitura - {selectedMeter?.type === 'water' ? 'Água' : 'Energia'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-700">
                <strong>Instruções:</strong> Digite a leitura completa do medidor com exatamente{' '}
                <strong>{selectedMeter?.totalDigits} dígitos</strong>. 
                O sistema considerará os {selectedMeter?.calculationDigits} dígitos principais para calcular o consumo.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="reading">Leitura do Medidor</Label>
              <Input
                id="reading"
                value={newReading}
                onChange={(e) => setNewReading(e.target.value.replace(/\D/g, ''))}
                placeholder={`Digite ${selectedMeter?.totalDigits} dígitos`}
                maxLength={selectedMeter?.totalDigits}
                className="text-lg font-mono"
              />
              <p className="text-sm text-gray-600">
                Dígitos digitados: {newReading.length}/{selectedMeter?.totalDigits}
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleAddReading}
                disabled={newReading.length !== selectedMeter?.totalDigits}
                className="flex-1"
              >
                Registrar Leitura
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setNewReading('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
