
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building, Unit } from '@/types';
import { getBuildings, getUnits, saveUnits } from '@/lib/storage';
import { Home, Plus, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const UnitManagement = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ buildingId: '', number: '', floor: '' });

  useEffect(() => {
    const buildingsData = getBuildings();
    const unitsData = getUnits();
    
    setBuildings(buildingsData);
    
    // Adicionar nome do edifício às unidades
    const unitsWithBuildingName = unitsData.map(unit => ({
      ...unit,
      buildingName: buildingsData.find(b => b.id === unit.buildingId)?.name || 'N/A'
    }));
    
    setUnits(unitsWithBuildingName);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      buildingId: formData.buildingId,
      number: formData.number,
      floor: formData.floor,
    };

    const updatedUnits = [...units.filter(u => !u.buildingName), newUnit];
    const unitsWithBuildingName = updatedUnits.map(unit => ({
      ...unit,
      buildingName: buildings.find(b => b.id === unit.buildingId)?.name || 'N/A'
    }));
    
    setUnits(unitsWithBuildingName);
    saveUnits(updatedUnits);
    
    setFormData({ buildingId: '', number: '', floor: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Unidade cadastrada",
      description: "Unidade adicionada com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Unidades</h2>
          <p className="text-gray-600">Cadastre e gerencie unidades dos edifícios</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Unidade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Unidade</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="building">Edifício</Label>
                <Select value={formData.buildingId} onValueChange={(value) => setFormData({ ...formData, buildingId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um edifício" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número da Unidade</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Ex: 101, 205, Sala A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Andar</Label>
                <Input
                  id="floor"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="Ex: 1, 2, Térreo"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={!formData.buildingId}>
                Cadastrar Unidade
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <Card key={unit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Unidade {unit.number}</CardTitle>
                  <CardDescription>Andar {unit.floor}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">{unit.buildingName}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {units.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma unidade cadastrada</h3>
            <p className="text-gray-600 mb-4">
              {buildings.length === 0 
                ? "Primeiro cadastre um edifício para adicionar unidades"
                : "Comece adicionando sua primeira unidade"
              }
            </p>
            {buildings.length > 0 && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Cadastrar Primeira Unidade</Button>
                </DialogTrigger>
              </Dialog>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnitManagement;
