
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Unit, Meter, Reading } from '@/types';
import { getBuildings, getUnits, getMeters, getReadings } from '@/lib/storage';
import { Building2, Droplets, Zap, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import EditReadingDialog from './EditReadingDialog';
import ReportsDialog from './ReportsDialog';

interface MeterWithDetails extends Meter {
  unitNumber: string;
  buildingName: string;
  latestReading?: Reading;
}

const UserDashboard = () => {
  const [meters, setMeters] = useState<MeterWithDetails[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const buildingsData = getBuildings();
    const unitsData = getUnits();
    const metersData = getMeters();
    const readingsData = getReadings();

    const metersWithDetails: MeterWithDetails[] = metersData
      .filter(meter => meter.isActive !== false)
      .map(meter => {
        const unit = unitsData.find(u => u.id === meter.unitId);
        const building = buildingsData.find(b => b.id === unit?.buildingId);
        const latestReading = readingsData
          .filter(r => r.meterId === meter.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        return {
          ...meter,
          unitNumber: unit?.number || 'N/A',
          buildingName: building?.name || 'N/A',
          latestReading,
        };
      });
    
    setMeters(metersWithDetails);
  }, [refreshTrigger]);

  const handleReadingAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const getMeterIcon = (type: string) => {
    return type === 'water' ? Droplets : Zap;
  };

  const getMeterColor = (type: string) => {
    return type === 'water' 
      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
      : 'bg-gradient-to-r from-yellow-500 to-orange-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Usuário</h1>
          <p className="text-gray-600">Monitore seus medidores e registre leituras</p>
        </div>
        <ReportsDialog />
      </div>

      {meters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meters.map((meter) => {
            const MeterIcon = getMeterIcon(meter.type);
            const isAlert = meter.latestReading?.isAlert || false;
            
            return (
              <Card key={meter.id} className={`hover:shadow-lg transition-shadow ${isAlert ? 'border-red-300 bg-red-50' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${getMeterColor(meter.type)} rounded-lg flex items-center justify-center`}>
                        <MeterIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">
                          {meter.type === 'water' ? 'Água' : 'Energia'}
                        </CardTitle>
                        <CardDescription>
                          {meter.buildingName} - Unidade {meter.unitNumber}
                        </CardDescription>
                      </div>
                    </div>
                    {isAlert && <AlertTriangle className="w-5 h-5 text-red-500" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {meter.latestReading && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Última Leitura</span>
                        <Badge variant={isAlert ? 'destructive' : 'default'}>
                          {isAlert ? 'Alerta' : 'Normal'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Leitura</p>
                          <p className="font-semibold text-lg">{meter.latestReading.reading.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Consumo</p>
                          <p className="font-semibold text-lg flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {meter.latestReading.consumption}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>{new Date(meter.latestReading.date).toLocaleDateString('pt-BR')} às {new Date(meter.latestReading.date).toLocaleTimeString('pt-BR')}</p>
                        {meter.latestReading.launchedBy && (
                          <p>Lançado por: {meter.latestReading.launchedBy}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <EditReadingDialog meter={meter} onReadingAdded={handleReadingAdded} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum medidor encontrado
            </h3>
            <p className="text-gray-600">
              Não há medidores ativos cadastrados no sistema
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;
