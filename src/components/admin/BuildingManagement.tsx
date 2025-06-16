
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building } from '@/types';
import { getBuildings, saveBuildings } from '@/lib/storage';
import { Building2, Plus, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BuildingManagement = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '' });

  useEffect(() => {
    setBuildings(getBuildings());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newBuilding: Building = {
      id: `building-${Date.now()}`,
      name: formData.name,
      address: formData.address,
      createdAt: new Date().toISOString(),
    };

    const updatedBuildings = [...buildings, newBuilding];
    setBuildings(updatedBuildings);
    saveBuildings(updatedBuildings);
    
    setFormData({ name: '', address: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Edifício cadastrado",
      description: "Edifício adicionado com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Edifícios</h2>
          <p className="text-gray-600">Cadastre e gerencie edifícios do sistema</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Edifício
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Edifício</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Edifício</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Edifício Central"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: Rua das Flores, 123"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Cadastrar Edifício
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildings.map((building) => (
          <Card key={building.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{building.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{building.address}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Criado em {new Date(building.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {buildings.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum edifício cadastrado</h3>
            <p className="text-gray-600 mb-4">Comece adicionando seu primeiro edifício</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Cadastrar Primeiro Edifício</Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BuildingManagement;
