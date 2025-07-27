import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Zap, Droplets, Building2, RotateCcw, Power } from 'lucide-react';
import { useBuildings, useUnits, useMeters, useMeterMutation } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

interface MeterFormData {
  unitId: string;
  type: string;
  totalDigits: string;
  calculationDigits: string;
  initialReading: string;
  threshold: string;
}

const MeterManagement = () => {
  const { data: buildings = [] } = useBuildings();
  const { data: units = [] } = useUnits();
  const { data: meters = [] } = useMeters();
  const meterMutation = useMeterMutation();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState<any>(null);
  const [formData, setFormData] = useState<MeterFormData>({
    unitId: '',
    type: '',
    totalDigits: '8',
    calculationDigits: '5',
    initialReading: '0',
    threshold: '50',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await meterMutation.mutateAsync({
        unitId: formData.unitId,
        type: formData.type as 'agua' | 'energia' | 'gas',
        totalDigits: parseInt(formData.totalDigits),
        calculationDigits: parseInt(formData.calculationDigits),
        initialReading: parseFloat(formData.initialReading),
        threshold: parseFloat(formData.threshold),
      });
      
      setFormData({
        unitId: '',
        type: '',
        totalDigits: '8',
        calculationDigits: '5',
        initialReading: '0',
        threshold: '50',
      });
      setIsDialogOpen(false);
      
      toast({
        title: "Medidor cadastrado",
        description: "Medidor adicionado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o medidor.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (meter: any) => {
    setEditingMeter(meter);
    setFormData({
      unitId: meter.unitId,
      type: meter.type,
      totalDigits: meter.totalDigits?.toString() || '8',
      calculationDigits: meter.calculationDigits?.toString() || '5',
      initialReading: meter.initialReading?.toString() || '0',
      threshold: meter.threshold?.toString() || '50',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMeter) return;

    try {
      await meterMutation.mutateAsync({
        id: editingMeter.id,
        unitId: formData.unitId,
        type: formData.type as 'agua' | 'energia' | 'gas',
        totalDigits: parseInt(formData.totalDigits),
        calculationDigits: parseInt(formData.calculationDigits),
        initialReading: parseFloat(formData.initialReading),
        threshold: parseFloat(formData.threshold),
      });
      
      setFormData({
        unitId: '',
        type: '',
        totalDigits: '8',
        calculationDigits: '5',
        initialReading: '0',
        threshold: '50',
      });
      setEditingMeter(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Medidor atualizado",
        description: "Medidor editado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o medidor.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (meter: any) => {
    try {
      await meterMutation.mutateAsync({
        id: meter.id,
        delete: true,
      });
      
      toast({
        title: "Medidor removido",
        description: "Medidor removido com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o medidor.",
        variant: "destructive",
      });
    }
  };

  const getMeterIcon = (type: string) => {
    return type === 'agua' ? Droplets : Zap;
  };

  const getMeterColor = (type: string) => {
    return type === 'agua' 
      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
      : 'bg-gradient-to-r from-yellow-500 to-orange-500';
  };

  // Agrupar medidores por edifício
  const metersByBuilding = buildings.reduce((acc: any, building) => {
    const buildingMeters = meters.filter(meter => {
      const unit = units.find(u => u.id === meter.unitId);
      return unit?.buildingId === building.id;
    });
    
    if (buildingMeters.length > 0) {
      acc[building.id] = {
        building,
        meters: buildingMeters.map(meter => {
          const unit = units.find(u => u.id === meter.unitId);
          return {
            ...meter,
            unitNumber: unit?.number || 'N/A',
            buildingName: building.name,
          };
        })
      };
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Medidores</h2>
          <p className="text-gray-600">Gerencie os medidores das unidades</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Medidor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Medidor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unitId">Unidade</Label>
                <Select
                  value={formData.unitId}
                  onValueChange={(value) => setFormData({...formData, unitId: value})}
                >
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
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Tipo de Medidor</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agua">Água</SelectItem>
                      <SelectItem value="energia">Energia</SelectItem>
                      <SelectItem value="gas">Gás</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalDigits">Total de Dígitos</Label>
                    <Input
                      id="totalDigits"
                      type="number"
                      value={formData.totalDigits}
                      onChange={(e) => setFormData({...formData, totalDigits: e.target.value})}
                      placeholder="8"
                      min="4"
                      max="12"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Quantos dígitos o medidor possui</p>
                  </div>
                  <div>
                    <Label htmlFor="calculationDigits">Dígitos para Cálculo</Label>
                    <Input
                      id="calculationDigits"
                      type="number"
                      value={formData.calculationDigits}
                      onChange={(e) => setFormData({...formData, calculationDigits: e.target.value})}
                      placeholder="5"
                      min="3"
                      max="10"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Quantos dígitos considerar no cálculo</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="initialReading">Leitura Inicial</Label>
                    <Input
                      id="initialReading"
                      type="number"
                      value={formData.initialReading}
                      onChange={(e) => setFormData({...formData, initialReading: e.target.value})}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="threshold">Limite de Alerta</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={formData.threshold}
                      onChange={(e) => setFormData({...formData, threshold: e.target.value})}
                      placeholder="50"
                      min="0"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Valor acima do qual gerar alerta</p>
                  </div>
                </div>
              </div>
              
              <Button type="submit" disabled={!formData.unitId || !formData.type}>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Medidor
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Medidor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-unitId">Unidade</Label>
                <Select
                  value={formData.unitId}
                  onValueChange={(value) => setFormData({...formData, unitId: value})}
                >
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
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-type">Tipo de Medidor</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agua">Água</SelectItem>
                      <SelectItem value="energia">Energia</SelectItem>
                      <SelectItem value="gas">Gás</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-totalDigits">Total de Dígitos</Label>
                    <Input
                      id="edit-totalDigits"
                      type="number"
                      value={formData.totalDigits}
                      onChange={(e) => setFormData({...formData, totalDigits: e.target.value})}
                      min="4"
                      max="12"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-calculationDigits">Dígitos para Cálculo</Label>
                    <Input
                      id="edit-calculationDigits"
                      type="number"
                      value={formData.calculationDigits}
                      onChange={(e) => setFormData({...formData, calculationDigits: e.target.value})}
                      min="3"
                      max="10"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-initialReading">Leitura Inicial</Label>
                    <Input
                      id="edit-initialReading"
                      type="number"
                      value={formData.initialReading}
                      onChange={(e) => setFormData({...formData, initialReading: e.target.value})}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-threshold">Limite de Alerta</Label>
                    <Input
                      id="edit-threshold"
                      type="number"
                      value={formData.threshold}
                      onChange={(e) => setFormData({...formData, threshold: e.target.value})}
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <Button type="submit" disabled={!formData.unitId || !formData.type}>
                Salvar Alterações
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Medidores agrupados por edifício */}
      <div className="space-y-8">
        {Object.entries(metersByBuilding).map(([buildingId, data]: [string, any]) => (
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
                {data.meters.map((meter: any) => {
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
                              <CardTitle className="text-lg capitalize">{meter.type}</CardTitle>
                              <CardDescription>Unidade {meter.unitNumber}</CardDescription>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(meter)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover este medidor? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(meter)}>
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total de dígitos:</span>
                          <span className="font-medium">{meter.totalDigits}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Dígitos para cálculo:</span>
                          <span className="font-medium">{meter.calculationDigits}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Leitura inicial:</span>
                          <span className="font-medium">{meter.initialReading}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Limite de alerta:</span>
                          <span className="font-medium">{meter.threshold}</span>
                        </div>
                        <Badge variant={meter.active ? "default" : "secondary"}>
                          {meter.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(metersByBuilding).length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum medidor cadastrado</h3>
            <p className="text-gray-600 mb-4">
              {units.length === 0 
                ? "Primeiro cadastre edifícios e unidades para adicionar medidores"
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