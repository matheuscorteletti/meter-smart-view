
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Home, Zap, Droplets, AlertTriangle, TrendingUp } from 'lucide-react';
import { getBuildings, getUnits, getMeters, getReadings } from '@/lib/storage';
import BuildingManagement from './BuildingManagement';
import UnitManagement from './UnitManagement';
import MeterManagement from './MeterManagement';
import UserManagement from './UserManagement';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    buildings: 0,
    units: 0,
    meters: 0,
    alerts: 0,
  });

  const [consumptionData, setConsumptionData] = useState([]);
  const [meterTypeData, setMeterTypeData] = useState([]);

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

    // Dados para gráfico de tipos de medidor
    const waterMeters = meters.filter(m => m.type === 'water').length;
    const energyMeters = meters.filter(m => m.type === 'energy').length;

    setMeterTypeData([
      { name: 'Água', value: waterMeters, color: '#3B82F6' },
      { name: 'Energia', value: energyMeters, color: '#10B981' },
    ]);
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
              <Droplets className="w-5 h-5" />
              <span>Distribuição de Medidores</span>
            </CardTitle>
            <CardDescription>Tipos de medidores no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={meterTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {meterTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
