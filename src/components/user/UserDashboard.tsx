
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
import { Droplets, Zap, Plus, AlertTriangle, TrendingUp, Calendar, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  const getTotalConsumption = (type: 'water' | 'energy') => {
    return readings
      .filter(r => r.meterType === type)
      .reduce((total, reading) => total + reading.consumption, 0);
  };

  const getAlertsCount = () => {
    return readings.filter(r => r.isAlert).length;
  };

  const StatCard = ({ title, value, unit, icon: Icon, color, isAlert = false }) => (
    <Card className={`hover:shadow-lg transition-shadow border-l-4 ${isAlert ? 'border-l-red-500 bg-red-50' : 'border-l-blue-500'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-900">{value}</span>
              <span className="text-lg text-gray-600">{unit}</span>
              {isAlert && <AlertTriangle className="w-5 h-5 text-red-500" />}
            </div>
          </div>
          <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Olá, {user?.name}!</h1>
        <p className="text-xl text-gray-600">Acompanhe seu consumo de água e energia</p>
      </div>

      {/* Alertas */}
      {readings.some(r => r.isAlert) && (
        <Alert className="bg-red-50 border-red-200 border-l-4 border-l-red-500">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-700 text-lg">
            <strong>Atenção!</strong> Você possui leituras com consumo acima do limite estabelecido.
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Consumo de Água (mês)"
          value={getTotalConsumption('water')}
          unit="L"
          icon={Droplets}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Consumo de Energia (mês)"
          value={getTotalConsumption('energy')}
          unit="kWh"
          icon={Zap}
          color="bg-gradient-to-br from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Alertas Ativos"
          value={getAlertsCount()}
          unit="alertas"
          icon={AlertTriangle}
          color="bg-gradient-to-br from-red-500 to-red-600"
          isAlert={getAlertsCount() > 0}
        />
      </div>

      {/* Gráfico de consumo */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardTitle className="flex items-center space-x-3 text-2xl">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span>Histórico de Consumo (30 dias)</span>
          </CardTitle>
          <CardDescription className="text-lg">Acompanhe a evolução do seu consumo diário</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="agua" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Água (L)"
                dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: 'white' }}
              />
              <Line 
                type="monotone" 
                dataKey="energia" 
                stroke="#F59E0B" 
                strokeWidth={3}
                name="Energia (kWh)"
                dot={{ fill: '#F59E0B', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Seção de Medidores */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Seus Medidores */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardTitle className="flex items-center space-x-3 text-2xl">
              <Activity className="w-6 h-6 text-blue-600" />
              <span>Seus Medidores</span>
            </CardTitle>
            <CardDescription className="text-lg">Registre as leituras dos seus medidores</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {meters.map((meter) => {
                const MeterIcon = meter.type === 'water' ? Droplets : Zap;
                const currentConsumption = getCurrentConsumption(meter);
                const isOverThreshold = currentConsumption > meter.threshold;
                
                return (
                  <div key={meter.id} className="p-5 border-2 rounded-xl hover:shadow-md transition-all duration-200 hover:border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 ${meter.type === 'water' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-yellow-500 to-orange-500'} rounded-xl flex items-center justify-center shadow-lg`}>
                          <MeterIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold capitalize text-gray-900">
                            {meter.type === 'water' ? 'Água' : 'Energia'}
                          </h3>
                          <p className="text-gray-600">
                            Consumo atual: <span className="font-semibold">{currentConsumption} {meter.type === 'water' ? 'L' : 'kWh'}</span>
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedMeter(meter);
                          setIsDialogOpen(true);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Leitura
                      </Button>
                    </div>
                    {isOverThreshold && (
                      <Badge variant="destructive" className="text-sm px-3 py-1">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Acima do limite ({meter.threshold} {meter.type === 'water' ? 'L' : 'kWh'})
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Histórico recente */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="flex items-center space-x-3 text-2xl">
              <Calendar className="w-6 h-6 text-green-600" />
              <span>Leituras Recentes</span>
            </CardTitle>
            <CardDescription className="text-lg">Suas últimas 5 leituras registradas</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {readings
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((reading) => {
                  const MeterIcon = reading.meterType === 'water' ? Droplets : Zap;
                  return (
                    <div key={reading.id} className="flex items-center justify-between p-4 border-2 rounded-xl hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${reading.meterType === 'water' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                          <MeterIcon className={`w-5 h-5 ${reading.meterType === 'water' ? 'text-blue-600' : 'text-orange-600'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-lg capitalize text-gray-900">
                            {reading.meterType === 'water' ? 'Água' : 'Energia'}
                          </p>
                          <p className="text-gray-600">
                            {new Date(reading.date).toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${reading.isAlert ? 'text-red-600' : 'text-gray-900'}`}>
                          {reading.consumption} {reading.meterType === 'water' ? 'L' : 'kWh'}
                        </p>
                        {reading.isAlert && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            Alto Consumo
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              {readings.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">Nenhuma leitura registrada ainda</p>
                  <p className="text-gray-400">Adicione sua primeira leitura usando os botões acima</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para adicionar leitura */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Adicionar Leitura - {selectedMeter?.type === 'water' ? 'Água' : 'Energia'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-700 text-base">
                <strong>Instruções:</strong> Digite a leitura completa do medidor com exatamente{' '}
                <strong>{selectedMeter?.totalDigits} dígitos</strong>. 
                O sistema considerará os {selectedMeter?.calculationDigits} dígitos principais para calcular o consumo.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Label htmlFor="reading" className="text-lg font-semibold">Leitura do Medidor</Label>
              <Input
                id="reading"
                value={newReading}
                onChange={(e) => setNewReading(e.target.value.replace(/\D/g, ''))}
                placeholder={`Digite ${selectedMeter?.totalDigits} dígitos`}
                maxLength={selectedMeter?.totalDigits}
                className="text-2xl font-mono text-center py-4 text-gray-900"
              />
              <p className="text-center text-gray-600">
                Dígitos digitados: <span className="font-semibold">{newReading.length}/{selectedMeter?.totalDigits}</span>
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleAddReading}
                disabled={newReading.length !== selectedMeter?.totalDigits}
                className="flex-1 py-3 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                Registrar Leitura
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setNewReading('');
                }}
                className="px-6 py-3"
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
