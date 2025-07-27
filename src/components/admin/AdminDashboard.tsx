import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Home, Zap, Droplets, AlertTriangle, TrendingUp, Users, Clock, Database } from 'lucide-react';
import { useBuildings, useUnits, useMeters, useReadings } from '@/hooks/useSupabaseData';
import RefreshButton from '@/components/ui/refresh-button';
import BuildingManagement from './BuildingManagement';
import UnitManagement from './UnitManagement';
import MeterManagement from './MeterManagement';
import UserManagement from './UserManagement';
import BackupRestore from './BackupRestore';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBuildings: 0,
    totalUnits: 0,
    totalMeters: 0,
    totalReadings: 0,
    alertCount: 0,
    lastUpdate: new Date().toLocaleDateString('pt-BR'),
  });

  const { data: buildings = [] } = useBuildings();
  const { data: units = [] } = useUnits();
  const { data: meters = [] } = useMeters();
  const { data: readings = [] } = useReadings();

  useEffect(() => {
    const activeBuildings = buildings.filter(b => b.active !== false);
    const activeUnits = units.filter(u => u.active !== false);
    const activeMeters = meters.filter(m => m.active !== false);
    const alertCount = readings.filter(r => r.isAlert).length;

    setStats({
      totalBuildings: activeBuildings.length,
      totalUnits: activeUnits.length,
      totalMeters: activeMeters.length,
      totalReadings: readings.length,
      alertCount,
      lastUpdate: new Date().toLocaleDateString('pt-BR'),
    });
  }, [buildings, units, meters, readings]);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie todo o sistema de medidores</p>
        </div>
        <RefreshButton />
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Edifícios"
          value={stats.totalBuildings}
          icon={Building2}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          description="Total de edifícios cadastrados"
        />
        <StatCard
          title="Unidades"
          value={stats.totalUnits}
          icon={Home}
          color="bg-gradient-to-r from-green-500 to-green-600"
          description="Apartamentos/salas cadastradas"
        />
        <StatCard
          title="Medidores"
          value={stats.totalMeters}
          icon={Zap}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          description="Medidores ativos no sistema"
        />
        <StatCard
          title="Alertas"
          value={stats.alertCount}
          icon={AlertTriangle}
          color="bg-gradient-to-r from-red-500 to-red-600"
          description="Consumos acima do limite"
        />
      </div>

      {/* Tabs de gerenciamento */}
      <Tabs defaultValue="buildings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="buildings">Edifícios</TabsTrigger>
          <TabsTrigger value="units">Unidades</TabsTrigger>
          <TabsTrigger value="meters">Medidores</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="backup">
            <Database className="w-4 h-4 mr-2" />
            Backup
          </TabsTrigger>
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

        <TabsContent value="backup">
          <BackupRestore />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;