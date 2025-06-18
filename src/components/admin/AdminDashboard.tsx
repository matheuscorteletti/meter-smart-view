
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, Zap, BarChart3, AlertTriangle, Plus } from 'lucide-react';
import { useApiData } from '@/hooks/useApi';
import { Building as BuildingType, User, Meter, Reading } from '@/types';

const AdminDashboard = () => {
  const { data: buildings = [], loading: buildingsLoading } = useApiData<BuildingType>('/buildings');
  const { data: users = [], loading: usersLoading } = useApiData<User>('/users');
  const { data: meters = [], loading: metersLoading } = useApiData<Meter>('/meters');
  const { data: readings = [], loading: readingsLoading } = useApiData<Reading>('/readings');

  const isLoading = buildingsLoading || usersLoading || metersLoading || readingsLoading;

  // Calcular alertas - consumos acima de 50% do limite
  const alerts = readings.filter(reading => {
    const meter = meters.find(m => m.id === reading.meterId);
    if (!meter?.limit) return false;
    return reading.consumption > (meter.limit * 0.5);
  }).length;

  const activeMeters = meters.filter(meter => meter.isActive !== false).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Visão geral do sistema de medidores</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Medidor
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Edifícios</CardTitle>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : buildings.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Edifícios cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : users.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuários cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medidores Ativos</CardTitle>
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : activeMeters}
            </div>
            <p className="text-xs text-muted-foreground">
              De {meters.length} medidores totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : alerts}
            </div>
            <p className="text-xs text-muted-foreground">
              Medições acima do limite
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Gerenciar Edifícios</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Cadastre e gerencie edifícios, visualize informações detalhadas
            </CardDescription>
            <Button variant="outline" className="w-full mt-4">
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">Gerenciar Usuários</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Controle de acesso, permissões e cadastro de usuários
            </CardDescription>
            <Button variant="outline" className="w-full mt-4">
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg">Relatórios</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Análises detalhadas de consumo e relatórios gerenciais
            </CardDescription>
            <Button variant="outline" className="w-full mt-4">
              Acessar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
