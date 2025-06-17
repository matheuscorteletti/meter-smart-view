
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
import { Users, Plus, Edit, Shield, UserCheck, Eye } from 'lucide-react';
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
  });

  useEffect(() => {
    const buildingsData = getBuildings();
    const unitsData = getUnits();
    
    setBuildings(buildingsData);
    setUnits(unitsData);

    // Usuários demo
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
      },
      {
        id: 'viewer-1',
        name: 'Maria Santos',
        email: 'viewer@demo.com',
        role: 'viewer',
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
      role: formData.role as 'admin' | 'user' | 'viewer',
    };

    setUsers([...users, newUser]);
    
    setFormData({
      name: '',
      email: '',
      role: '',
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
            role: formData.role as 'admin' | 'user' | 'viewer',
          }
        : user
    );

    setUsers(updatedUsers);
    
    setFormData({
      name: '',
      email: '',
      role: '',
    });
    setEditingUser(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Usuário atualizado",
      description: "Usuário editado com sucesso!",
    });
  };

  const getUserIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'viewer':
        return Eye;
      default:
        return UserCheck;
    }
  };

  const getUserColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'viewer':
        return 'bg-gradient-to-r from-orange-500 to-red-500';
      default:
        return 'bg-gradient-to-r from-blue-500 to-green-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'viewer':
        return 'Visualizador';
      default:
        return 'Usuário';
    }
  };

  const renderUserForm = (isEdit = false) => (
    <form onSubmit={isEdit ? handleEditSubmit : handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-name" : "name"}>Nome</Label>
        <Input
          id={isEdit ? "edit-name" : "name"}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nome completo"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-email" : "email"}>E-mail</Label>
        <Input
          id={isEdit ? "edit-email" : "email"}
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="usuario@email.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-role" : "role"}>Tipo de Usuário</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
            <SelectItem value="viewer">Visualizador</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!formData.role}
      >
        {isEdit ? 'Salvar Alterações' : 'Cadastrar Usuário'}
      </Button>
    </form>
  );

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
            {renderUserForm()}
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            {renderUserForm(true)}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => {
          const UserIcon = getUserIcon(user.role);
          
          return (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getUserColor(user.role)} rounded-lg flex items-center justify-center`}>
                      <UserIcon className="w-5 h-5 text-white" />
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
                <Badge variant={user.role === 'admin' ? 'default' : user.role === 'viewer' ? 'secondary' : 'outline'}>
                  {getRoleLabel(user.role)}
                </Badge>
                
                {user.role === 'viewer' && (
                  <div className="text-sm text-gray-600">
                    <p>Acesso de visualização a todos os dados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UserManagement;
