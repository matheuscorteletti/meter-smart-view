
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Home, Zap, Droplets, AlertTriangle, TrendingUp, Users, Clock } from 'lucide-react';
import { getBuildings, getUnits, getMeters, getReadings } from '@/lib/storage';
import BuildingManagement from './BuildingManagement';
import UnitManagement from './UnitManagement';
import MeterManagement from './MeterManagement';
import UserManagement from './UserManagement';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    buildings: 0,
    units: 0,
    meters: 0,
    alerts: 0,
  });

  const [consumptionData, setConsumptionData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const buildings = getBuildings();
    const units = getUnits();
    const meters = getMeters();
    const readings = getReadings();

    setStats({
      buildings: buildings.length,
      units: units.length,
      meters: meters.length,
      alerts: readings.filter(r => r.isAlert).length,
    });

    // Dados para gráfico de consumo
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      agua: Math.floor(Math.random() * 50) + 20,
      energia: Math.floor(Math.random() * 300) + 200,
    }));

    setConsumptionData(chartData);

    // Atividades recentes simuladas
    const activities = [
      { type: 'reading', message: 'Nova leitura registrada - Edifício Central, Apt 101', time: '5 min atrás', icon: Clock },
      { type: 'alert', message: 'Consumo alto detectado - Edifício Norte, Apt 205', time: '12 min atrás', icon: AlertTriangle },
      { type: 'user', message: 'Novo usuário cadastrado - Maria Silva', time: '1 hora atrás', icon: Users },
      { type: 'reading', message: 'Leitura atualizada - Edifício Sul, Apt 303', time: '2 horas atrás', icon: Clock },
      { type: 'alert', message: 'Alerta resolvido - Edifício Central, Apt 102', time: '3 horas atrás', icon: AlertTriangle },
    ];

    setRecentActivity(activities);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'alert': return 'text-red-600';
      case 'user': return 'text-blue-600';
      case 'reading': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-600">Gerencie todo o sistema de medidores</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Edifícios"
          value={stats.buildings}
          icon={Building2}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          description="Total de edifícios cadastrados"
        />
        <StatCard
          title="Unidades"
          value={stats.units}
          icon={Home}
          color="bg-gradient-to-r from-green-500 to-green-600"
          description="Apartamentos/salas cadastradas"
        />
        <StatCard
          title="Medidores"
          value={stats.meters}
          icon={Zap}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          description="Medidores ativos no sistema"
        />
        <StatCard
          title="Alertas"
          value={stats.alerts}
          icon={AlertTriangle}
          color="bg-gradient-to-r from-red-500 to-red-600"
          description="Consumos acima do limite"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Consumo nos Últimos 7 Dias</span>
            </CardTitle>
            <CardDescription>Consumo médio de água e energia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="agua" fill="#3B82F6" name="Água (L)" />
                <Bar dataKey="energia" fill="#10B981" name="Energia (kWh)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Atividades Recentes</span>
            </CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {recentActivity.map((activity, index) => {
                const ActivityIcon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm`}>
                      <ActivityIcon className={`w-4 h-4 ${getActivityColor(activity.type)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de gerenciamento */}
      <Tabs defaultValue="buildings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="buildings">Edifícios</TabsTrigger>
          <TabsTrigger value="units">Unidades</TabsTrigger>
          <TabsTrigger value="meters">Medidores</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="buildings">
          <BuildingManagement />
        </TabsContent>

        <TabsContent value="units">
          <UnitManagement />
        </TabsContent>

        <TabsContent value="meters">
          <MeterManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
