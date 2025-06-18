
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building, Unit } from '@/types';
import { useApiData, useApi } from '@/hooks/useApi';
import { Home, Plus, Building2, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UnitWithBuilding extends Unit {
  buildingName?: string;
}

const UnitManagement = () => {
  const { data: buildings } = useApiData<Building>('/buildings');
  const { data: units, loading, refetch } = useApiData<UnitWithBuilding>('/units');
  const { apiCall } = useApi();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({ building_id: '', number: '', floor: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiCall('/units', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setFormData({ building_id: '', number: '', floor: '' });
      setIsDialogOpen(false);
      refetch();
      
      toast({
        title: "Unidade cadastrada",
        description: "Unidade adicionada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao cadastrar unidade",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({ 
      building_id: unit.buildingId, 
      number: unit.number, 
      floor: unit.floor 
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUnit) return;

    try {
      await apiCall(`/units/${editingUnit.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      setFormData({ building_id: '', number: '', floor: '' });
      setEditingUnit(null);
      setIsEditDialogOpen(false);
      refetch();
      
      toast({
        title: "Unidade atualizada",
        description: "Unidade editada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar unidade",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (unitId: string) => {
    try {
      await apiCall(`/units/${unitId}`, {
        method: 'DELETE',
      });

      refetch();
      
      toast({
        title: "Unidade removida",
        description: "Unidade removida com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao remover unidade",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

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
                <Select value={formData.building_id} onValueChange={(value) => setFormData({ ...formData, building_id: value })}>
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
              <Button type="submit" className="w-full" disabled={!formData.building_id}>
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
                <Label htmlFor="edit-building">Edifício</Label>
                <Select value={formData.building_id} onValueChange={(value) => setFormData({ ...formData, building_id: value })}>
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
                <Label htmlFor="edit-number">Número da Unidade</Label>
                <Input
                  id="edit-number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Ex: 101, 205, Sala A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-floor">Andar</Label>
                <Input
                  id="edit-floor"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="Ex: 1, 2, Térreo"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={!formData.building_id}>
                Salvar Alterações
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <Card key={unit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Unidade {unit.number}</CardTitle>
                    <CardDescription>Andar {unit.floor}</CardDescription>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(unit)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover a unidade {unit.number}? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(unit.id)}>
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">{unit.buildingName || 'N/A'}</span>
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
