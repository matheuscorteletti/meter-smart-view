import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building, Unit, Meter } from '@/types';
import { getBuildings, getUnits, getMeters, saveMeters } from '@/lib/storage';
import { Zap, Droplets, Plus, AlertTriangle, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MeterWithDetails extends Meter {
  unitNumber: string;
  buildingId: string;
  buildingName: string;
}

interface MetersByBuildingType {
  [key: string]: {
    building: Building;
    meters: MeterWithDetails[];
  };
}

const MeterManagement = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [meters, setMeters] = useState<MeterWithDetails[]>([]);
  const [metersByBuilding, setMetersByBuilding] = useState<MetersByBuildingType>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    unitId: '',
    type: '',
    totalDigits: '',
    calculationDigits: '',
    initialReading: '',
    threshold: '',
  });

  useEffect(() => {
    const buildingsData = getBuildings();
    const unitsData = getUnits();
    const metersData = getMeters();
    
    setBuildings(buildingsData);
    setUnits(unitsData);
    
    // Adicionar informações da unidade e edifício aos medidores
    const metersWithDetails: MeterWithDetails[] = metersData.map(meter => {
      const unit = unitsData.find(u => u.id === meter.unitId);
      const building = buildingsData.find(b => b.id === unit?.buildingId);
      return {
        ...meter,
        unitNumber: unit?.number || 'N/A',
        buildingId: unit?.buildingId || '',
        buildingName: building?.name || 'N/A'
      };
    });
    
    setMeters(metersWithDetails);

    // Agrupar medidores por edifício
    const grouped: MetersByBuildingType = buildingsData.reduce((acc, building) => {
      const buildingMeters = metersWithDetails.filter(meter => meter.buildingId === building.id);
      if (buildingMeters.length > 0) {
        acc[building.id] = {
          building,
          meters: buildingMeters
        };
      }
      return acc;
    }, {} as MetersByBuildingType);

    setMetersByBuilding(grouped);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMeter: Meter = {
      id: `meter-${Date.now()}`,
      unitId: formData.unitId,
      type: formData.type as 'water' | 'energy',
      totalDigits: parseInt(formData.totalDigits),
      calculationDigits: parseInt(formData.calculationDigits),
      initialReading: parseInt(formData.initialReading),
      threshold: parseInt(formData.threshold),
    };

    const updatedMeters = [...meters.filter(m => !m.unitNumber && !m.buildingName), newMeter];
    
    // Adicionar informações da unidade e edifício
    const metersWithDetails: MeterWithDetails[] = updatedMeters.map(meter => {
      const unit = units.find(u => u.id === meter.unitId);
      const building = buildings.find(b => b.id === unit?.buildingId);
      return {
        ...meter,
        unitNumber: unit?.number || 'N/A',
        buildingId: unit?.buildingId || '',
        buildingName: building?.name || 'N/A'
      };
    });
    
    setMeters(metersWithDetails);
    saveMeters(updatedMeters);

    // Reagrupar medidores por edifício
    const grouped: MetersByBuildingType = buildings.reduce((acc, building) => {
      const buildingMeters = metersWithDetails.filter(meter => meter.buildingId === building.id);
      if (buildingMeters.length > 0) {
        acc[building.id] = {
          building,
          meters: buildingMeters
        };
      }
      return acc;
    }, {} as MetersByBuildingType);

    setMetersByBuilding(grouped);
    
    setFormData({
      unitId: '',
      type: '',
      totalDigits: '',
      calculationDigits: '',
      initialReading: '',
      threshold: '',
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Medidor cadastrado",
      description: "Medidor adicionado com sucesso!",
    });
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Medidores</h2>
          <p className="text-gray-600">Cadastre e configure medidores das unidades</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Medidor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Medidor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Select value={formData.unitId} onValueChange={(value) => setFormData({ ...formData, unitId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => {
                      const building = buildings.find(b => b.id === unit.buildingId);
                      return (
                        <SelectItem key={unit.id} value={unit.id}>
                          {building?.name} - Unidade {unit.number}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo do Medidor</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water">Água</SelectItem>
                    <SelectItem value="energy">Energia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalDigits">Total de Dígitos</Label>
                  <Input
                    id="totalDigits"
                    type="number"
                    value={formData.totalDigits}
                    onChange={(e) => setFormData({ ...formData, totalDigits: e.target.value })}
                    placeholder="Ex: 8"
                    min="1"
                    max="12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calculationDigits">Dígitos para Cálculo</Label>
                  <Input
                    id="calculationDigits"
                    type="number"
                    value={formData.calculationDigits}
                    onChange={(e) => setFormData({ ...formData, calculationDigits: e.target.value })}
                    placeholder="Ex: 5"
                    min="1"
                    max="12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialReading">Leitura Inicial</Label>
                <Input
                  id="initialReading"
                  type="number"
                  value={formData.initialReading}
                  onChange={(e) => setFormData({ ...formData, initialReading: e.target.value })}
                  placeholder="Ex: 12345"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Limite (Threshold)</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                  placeholder={formData.type === 'water' ? 'Ex: 50 litros' : 'Ex: 300 kWh'}
                  min="1"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={!formData.unitId || !formData.type}>
                Cadastrar Medidor
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Medidores agrupados por edifício */}
      <div className="space-y-8">
        {Object.entries(metersByBuilding).map(([buildingId, data]) => (
          <Card key={buildingId} className="border-2">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span>{data.building.name}</span>
              </CardTitle>
              <CardDescription>{data.building.address}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.meters.map((meter) => {
                  const MeterIcon = getMeterIcon(meter.type);
                  return (
                    <Card key={meter.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${getMeterColor(meter.type)} rounded-lg flex items-center justify-center`}>
                              <MeterIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg capitalize">
                                {meter.type === 'water' ? 'Água' : 'Energia'}
                              </CardTitle>
                              <CardDescription>Unidade {meter.unitNumber}</CardDescription>
                            </div>
                          </div>
                          <Badge 
                            variant={meter.type === 'water' ? 'default' : 'secondary'}
                            className={meter.type === 'water' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}
                          >
                            {meter.type === 'water' ? 'Água' : 'Energia'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Dígitos Total:</span>
                            <div className="font-semibold">{meter.totalDigits}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">P/ Cálculo:</span>
                            <div className="font-semibold">{meter.calculationDigits}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Leitura Inicial:</span>
                            <div className="font-semibold">{meter.initialReading.toLocaleString('pt-BR')}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Limite:</span>
                            <div className="font-semibold flex items-center space-x-1">
                              <span>{meter.threshold}</span>
                              {meter.threshold > 100 && <AlertTriangle className="w-3 h-3 text-orange-500" />}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {meters.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum medidor cadastrado</h3>
            <p className="text-gray-600 mb-4">
              {units.length === 0 
                ? "Primeiro cadastre unidades para adicionar medidores"
                : "Comece adicionando seu primeiro medidor"
              }
            </p>
            {units.length > 0 && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Cadastrar Primeiro Medidor</Button>
                </DialogTrigger>
              </Dialog>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeterManagement;
