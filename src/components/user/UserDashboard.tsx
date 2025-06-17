
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building, Unit, Meter, Reading } from '@/types';
import { getBuildings, getUnits, getMeters, getReadings } from '@/lib/storage';
import { Building2, Droplets, Zap, AlertTriangle, TrendingUp } from 'lucide-react';

interface MeterWithDetails extends Meter {
  unitNumber: string;
  latestReading?: Reading;
}

const UserDashboard = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [meters, setMeters] = useState<MeterWithDetails[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);

  useEffect(() => {
    const buildingsData = getBuildings();
    setBuildings(buildingsData);
    
    // Selecionar primeiro prédio por padrão
    if (buildingsData.length > 0 && !selectedBuildingId) {
      setSelectedBuildingId(buildingsData[0].id);
    }
  }, []);

  useEffect(() => {
    if (!selectedBuildingId) return;

    const unitsData = getUnits();
    const metersData = getMeters();
    const readingsData = getReadings();
    
    setReadings(readingsData);

    // Filtrar unidades do prédio selecionado
    const buildingUnits = unitsData.filter(unit => unit.buildingId === selectedBuildingId);
    
    // Filtrar medidores das unidades do prédio
    const buildingMeters = metersData.filter(meter => 
      buildingUnits.some(unit => unit.id === meter.unitId)
    );

    // Adicionar informações da unidade aos medidores
    const metersWithDetails: MeterWithDetails[] = buildingMeters.map(meter => {
      const unit = buildingUnits.find(u => u.id === meter.unitId);
      const latestReading = readingsData
        .filter(r => r.meterId === meter.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      return {
        ...meter,
        unitNumber: unit?.number || 'N/A',
        latestReading,
      };
    });
    
    setMeters(metersWithDetails);
  }, [selectedBuildingId]);

  const getMeterIcon = (type: string) => {
    return type === 'water' ? Droplets : Zap;
  };

  const getMeterColor = (type: string) => {
    return type === 'water' 
      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
      : 'bg-gradient-to-r from-yellow-500 to-orange-500';
  };

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Usuário</h1>
          <p className="text-gray-600">Monitore seus medidores e consumo</p>
        </div>
        
        <div className="w-full sm:w-72">
          <Select value={selectedBuildingId} onValueChange={setSelectedBuildingId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um prédio" />
            </SelectTrigger>
            <SelectContent>
              {buildings.map((building) => (
                <SelectItem key={building.id} value={building.id}>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>{building.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedBuilding && (
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardTitle className="flex items-center space-x-3">
              <Building2 className="w-6 h-6 text-blue-600" />
              <span>{selectedBuilding.name}</span>
            </CardTitle>
            <CardDescription>{selectedBuilding.address}</CardDescription>
          </CardHeader>
        </Card>
      )}

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
                        <CardDescription>Unidade {meter.unitNumber}</CardDescription>
                      </div>
                    </div>
                    {isAlert && <AlertTriangle className="w-5 h-5 text-red-500" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Leitura Inicial</p>
                      <p className="text-lg font-bold">{meter.initialReading.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Limite</p>
                      <p className="text-lg font-bold">{meter.threshold}</p>
                    </div>
                  </div>
                  
                  {meter.latestReading && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Última Leitura</span>
                        <Badge variant={isAlert ? 'destructive' : 'default'}>
                          {isAlert ? 'Alerta' : 'Normal'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Leitura</p>
                          <p className="font-semibold">{meter.latestReading.reading.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Consumo</p>
                          <p className="font-semibold flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {meter.latestReading.consumption}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(meter.latestReading.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
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
              {selectedBuildingId ? 'Nenhum medidor encontrado' : 'Selecione um prédio'}
            </h3>
            <p className="text-gray-600">
              {selectedBuildingId 
                ? 'Este prédio não possui medidores cadastrados'
                : 'Escolha um prédio para visualizar os medidores'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;
