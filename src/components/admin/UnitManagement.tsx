import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useBuildings, useUnits, useUnitMutation } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

interface UnitFormData {
  buildingId: string;
  number: string;
  floor: string;
  ownerName: string;
  ownerEmail: string;
}

const UnitManagement = () => {
  const { data: buildings = [] } = useBuildings();
  const { data: units = [] } = useUnits();
  const unitMutation = useUnitMutation();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [formData, setFormData] = useState<UnitFormData>({
    buildingId: '',
    number: '',
    floor: '',
    ownerName: '',
    ownerEmail: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await unitMutation.mutateAsync({
        buildingId: formData.buildingId,
        number: formData.number,
        floor: formData.floor,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
      });
      
      setFormData({
        buildingId: '',
        number: '',
        floor: '',
        ownerName: '',
        ownerEmail: ''
      });
      setIsDialogOpen(false);
      
      toast({
        title: "Unidade cadastrada",
        description: "Unidade adicionada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar a unidade.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (unit: any) => {
    setEditingUnit(unit);
    setFormData({
      buildingId: unit.buildingId,
      number: unit.number,
      floor: unit.floor,
      ownerName: unit.ownerName || '',
      ownerEmail: unit.ownerEmail || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUnit) return;

    try {
      await unitMutation.mutateAsync({
        id: editingUnit.id,
        buildingId: formData.buildingId,
        number: formData.number,
        floor: formData.floor,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
      });
      
      setFormData({
        buildingId: '',
        number: '',
        floor: '',
        ownerName: '',
        ownerEmail: ''
      });
      setEditingUnit(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Unidade atualizada",
        description: "Unidade editada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a unidade.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (unit: any) => {
    try {
      await unitMutation.mutateAsync({
        id: unit.id,
        delete: true,
      });
      
      toast({
        title: "Unidade removida",
        description: "Unidade removida com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a unidade.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Unidades</h2>
          <p className="text-gray-600">Gerencie as unidades dos edifícios</p>
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
                <Label htmlFor="buildingId">Edifício</Label>
                <Select
                  value={formData.buildingId}
                  onValueChange={(value) => setFormData({...formData, buildingId: value})}
                >
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => setFormData({...formData, number: e.target.value})}
                    placeholder="Ex: 101"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="floor">Andar</Label>
                  <Input
                    id="floor"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    placeholder="Ex: 1º"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ownerName">Nome do Proprietário</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="ownerEmail">Email do Proprietário</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              <Button type="submit" disabled={!formData.buildingId || !formData.number || !formData.floor}>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Unidade
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Unidade</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-buildingId">Edifício</Label>
                <Select
                  value={formData.buildingId}
                  onValueChange={(value) => setFormData({...formData, buildingId: value})}
                >
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-number">Número</Label>
                  <Input
                    id="edit-number"
                    value={formData.number}
                    onChange={(e) => setFormData({...formData, number: e.target.value})}
                    placeholder="Ex: 101"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-floor">Andar</Label>
                  <Input
                    id="edit-floor"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    placeholder="Ex: 1º"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-ownerName">Nome do Proprietário</Label>
                  <Input
                    id="edit-ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-ownerEmail">Email do Proprietário</Label>
                  <Input
                    id="edit-ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              <Button type="submit" disabled={!formData.buildingId || !formData.number || !formData.floor}>
                Salvar Alterações
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => {
          const building = buildings.find(b => b.id === unit.buildingId);
          return (
            <Card key={unit.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Unidade {unit.number} - {unit.floor}
                    </CardTitle>
                    <CardDescription>
                      {building?.name || 'Edifício não encontrado'}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(unit)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(unit)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {unit.ownerName && (
                  <p className="text-sm text-gray-600">
                    Proprietário: {unit.ownerName}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {units.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
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