
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building, Unit, User } from '@/types';
import { getBuildings, getUnits } from '@/lib/storage';
import { Users, Plus, Edit, Shield, UserCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserWithDetails extends User {
  buildingName?: string;
  unitNumber?: string;
}

const UserManagement = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    buildingId: '',
    unitId: '',
  });

  useEffect(() => {
    const buildingsData = getBuildings();
    const unitsData = getUnits();
    
    setBuildings(buildingsData);
    setUnits(unitsData);

    // Usuários demo com detalhes
    const demoUsers: UserWithDetails[] = [
      {
        id: 'admin-1',
        name: 'Administrador',
        email: 'admin@demo.com',
        role: 'admin',
      },
      {
        id: 'user-1013',
        name: 'João Silva',
        email: 'user@demo.com',
        role: 'user',
        buildingId: 'building-1013',
        unitId: 'unit-1013-externo',
        buildingName: buildingsData.find(b => b.id === 'building-1013')?.name,
        unitNumber: unitsData.find(u => u.id === 'unit-1013-externo')?.number,
      },
    ];
    
    setUsers(demoUsers);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser: UserWithDetails = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role as 'admin' | 'user',
      ...(formData.role === 'user' && {
        buildingId: formData.buildingId,
        unitId: formData.unitId,
        buildingName: buildings.find(b => b.id === formData.buildingId)?.name,
        unitNumber: units.find(u => u.id === formData.unitId)?.number,
      }),
    };

    setUsers([...users, newUser]);
    
    setFormData({
      name: '',
      email: '',
      role: '',
      buildingId: '',
      unitId: '',
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Usuário cadastrado",
      description: "Usuário adicionado com sucesso!",
    });
  };

  const handleEdit = (user: UserWithDetails) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      buildingId: user.buildingId || '',
      unitId: user.unitId || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    const updatedUsers = users.map(user =>
      user.id === editingUser.id
        ? {
            ...user,
            name: formData.name,
            email: formData.email,
            role: formData.role as 'admin' | 'user',
            ...(formData.role === 'user' && {
              buildingId: formData.buildingId,
              unitId: formData.unitId,
              buildingName: buildings.find(b => b.id === formData.buildingId)?.name,
              unitNumber: units.find(u => u.id === formData.unitId)?.number,
            }),
          }
        : user
    );

    setUsers(updatedUsers);
    
    setFormData({
      name: '',
      email: '',
      role: '',
      buildingId: '',
      unitId: '',
    });
    setEditingUser(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Usuário atualizado",
      description: "Usuário editado com sucesso!",
    });
  };

  const filteredUnits = units.filter(unit => unit.buildingId === formData.buildingId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h2>
          <p className="text-gray-600">Gerencie usuários e suas permissões</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value, buildingId: '', unitId: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.role === 'user' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="building">Edifício</Label>
                    <Select value={formData.buildingId} onValueChange={(value) => setFormData({ ...formData, buildingId: value, unitId: '' })}>
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
                  
                  {formData.buildingId && (
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unidade</Label>
                      <Select value={formData.unitId} onValueChange={(value) => setFormData({ ...formData, unitId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              Unidade {unit.number} - Andar {unit.floor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
              
              <Button type="submit" className="w-full" disabled={!formData.role || (formData.role === 'user' && (!formData.buildingId || !formData.unitId))}>
                Cadastrar Usuário
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Tipo de Usuário</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value, buildingId: '', unitId: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.role === 'user' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-building">Edifício</Label>
                    <Select value={formData.buildingId} onValueChange={(value) => setFormData({ ...formData, buildingId: value, unitId: '' })}>
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
                  
                  {formData.buildingId && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-unit">Unidade</Label>
                      <Select value={formData.unitId} onValueChange={(value) => setFormData({ ...formData, unitId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              Unidade {unit.number} - Andar {unit.floor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
              
              <Button type="submit" className="w-full" disabled={!formData.role || (formData.role === 'user' && (!formData.buildingId || !formData.unitId))}>
                Salvar Alterações
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${user.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-green-500'} rounded-lg flex items-center justify-center`}>
                    {user.role === 'admin' ? <Shield className="w-5 h-5 text-white" /> : <UserCheck className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(user)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role === 'admin' ? 'Administrador' : 'Usuário'}
              </Badge>
              
              {user.role === 'user' && user.buildingName && (
                <div className="text-sm text-gray-600">
                  <p><strong>Edifício:</strong> {user.buildingName}</p>
                  {user.unitNumber && <p><strong>Unidade:</strong> {user.unitNumber}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
