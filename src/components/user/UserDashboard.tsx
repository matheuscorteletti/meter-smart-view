
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Unit, Meter, Reading } from '@/types';
import { useBuildings, useUnits, useMeters, useReadings } from '@/hooks/useSupabaseData';
import { Building2, Droplets, Zap, AlertTriangle, TrendingUp, ArrowLeft } from 'lucide-react';
import EditReadingDialog from './EditReadingDialog';
import BuildingSelector from './BuildingSelector';

interface MeterWithDetails extends Meter {
  unitNumber: string;
  buildingName: string;
  latestReading?: Reading;
}

const UserDashboard = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [meters, setMeters] = useState<MeterWithDetails[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: buildings = [] } = useBuildings();
  const { data: units = [] } = useUnits();
  const { data: allMeters = [] } = useMeters();
  const { data: readings = [] } = useReadings();

  useEffect(() => {
    if (!selectedBuildingId) return;

    // Filter units by selected building
    const buildingUnits = units.filter(unit => unit.buildingId === selectedBuildingId);
    const buildingUnitIds = buildingUnits.map(unit => unit.id);

    const metersWithDetails: MeterWithDetails[] = allMeters
      .filter(meter => meter.active !== false && buildingUnitIds.includes(meter.unitId))
      .map(meter => {
        const unit = units.find(u => u.id === meter.unitId);
        const building = buildings.find(b => b.id === unit?.buildingId);
        const latestReading = readings
          .filter(r => r.meterId === meter.id)
          .sort((a, b) => new Date(b.readingDate || '').getTime() - new Date(a.readingDate || '').getTime())[0];
        
        return {
          ...meter,
          unitNumber: unit?.number || 'N/A',
          buildingName: building?.name || 'N/A',
          latestReading,
        };
      });
    
    setMeters(metersWithDetails);
  }, [selectedBuildingId, refreshTrigger, buildings, units, allMeters, readings]);

  const handleReadingAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
  };

  const handleBackToBuildings = () => {
    setSelectedBuildingId(null);
  };

  const getMeterIcon = (type: string) => {
    return type === 'agua' ? Droplets : Zap;
  };

  const getMeterColor = (type: string) => {
    return type === 'agua' 
      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
      : 'bg-gradient-to-r from-yellow-500 to-orange-500';
  };

  // If no building is selected, show building selector
  if (!selectedBuildingId) {
    return <BuildingSelector buildings={buildings} onSelectBuilding={handleSelectBuilding} />;
  }

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBackToBuildings}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar aos Edifícios</span>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedBuilding?.name || 'Edifício'}
          </h1>
          <p className="text-gray-600">Monitore os medidores e registre leituras</p>
        </div>
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
                          {meter.type === 'agua' ? 'Água' : meter.type === 'energia' ? 'Energia' : 'Gás'}
                        </CardTitle>
                        <CardDescription>
                          Unidade {meter.unitNumber}
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
                          <div className="font-semibold text-lg flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {meter.type === 'agua' ? (
                              <div>
                                <div>{meter.latestReading.consumption.toLocaleString('pt-BR')}m³</div>
                                <div className="text-xs text-gray-500">({(meter.latestReading.consumption * 1000).toLocaleString('pt-BR')} litros)</div>
                              </div>
                            ) : (
                              <div>{meter.latestReading.consumption.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}kWh</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>{new Date(meter.latestReading.readingDate || '').toLocaleDateString('pt-BR')} às {new Date(meter.latestReading.readingDate || '').toLocaleTimeString('pt-BR')}</p>
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
              Não há medidores ativos cadastrados neste edifício
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;
