
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, Zap, Droplets } from 'lucide-react';
import { useApiData } from '@/hooks/useApi';
import { Meter, Building, Unit } from '@/types';

const MeterManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: meters = [], loading: metersLoading, refetch: refetchMeters } = useApiData<Meter>('/meters');
  const { data: buildings = [] } = useApiData<Building>('/buildings');
  const { data: units = [] } = useApiData<Unit>('/units');

  // Filtrar medidores
  const filteredMeters = meters.filter(meter => {
    const unit = units.find(u => u.id === meter.unitId);
    const building = buildings.find(b => b.id === unit?.buildingId);
    
    const matchesSearch = meter.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meter.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         building?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit?.number.toString().includes(searchTerm);
    
    const matchesBuilding = selectedBuilding === 'all' || unit?.buildingId === selectedBuilding;
    
    return matchesSearch && matchesBuilding;
  });

  const getMeterIcon = (type: string) => {
    return type === 'water' ? Droplets : Zap;
  };

  const getMeterTypeLabel = (type: string) => {
    return type === 'water' ? 'Água' : 'Energia';
  };

  const getMeterTypeColor = (type: string) => {
    return type === 'water' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Medidores</h1>
          <p className="text-gray-600">Cadastre e gerencie medidores de água e energia</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Medidor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Medidor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serialNumber">Número de Série</Label>
                  <Input id="serialNumber" placeholder="Ex: 12345678" />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="water">Água</SelectItem>
                      <SelectItem value="energy">Energia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="building">Edifício</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o edifício" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map(building => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="unit">Unidade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>
                        Unidade {unit.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-green-600">
                  Criar Medidor
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Buscar por número de série, tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="building-filter">Edifício</Label>
            <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Edifícios</SelectItem>
                {buildings.map(building => (
                  <SelectItem key={building.id} value={building.id}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{meters.length}</p>
              </div>
              <Zap className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Água</p>
                <p className="text-2xl font-bold text-blue-600">
                  {meters.filter(m => m.type === 'water').length}
                </p>
              </div>
              <Droplets className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Energia</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {meters.filter(m => m.type === 'energy').length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Medidores */}
      <Card>
        <CardHeader>
          <CardTitle>Medidores ({filteredMeters.length})</CardTitle>
          <CardDescription>
            Lista de todos os medidores cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metersLoading ? (
            <div className="text-center py-8">Carregando medidores...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número de Série</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Edifício</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeters.map((meter) => {
                  const unit = units.find(u => u.id === meter.unitId);
                  const building = buildings.find(b => b.id === unit?.buildingId);
                  const Icon = getMeterIcon(meter.type);
                  
                  return (
                    <TableRow key={meter.id}>
                      <TableCell className="font-medium">{meter.serialNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <Badge className={getMeterTypeColor(meter.type)}>
                            {getMeterTypeLabel(meter.type)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{building?.name || 'N/A'}</TableCell>
                      <TableCell>Unidade {unit?.number || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={meter.isActive !== false ? "default" : "secondary"}>
                          {meter.isActive !== false ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MeterManagement;
