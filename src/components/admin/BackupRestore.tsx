import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Database, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBuildings, useUnits, useMeters, useReadings } from '@/hooks/useSupabaseData';

const BackupRestore = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: buildings = [] } = useBuildings();
  const { data: units = [] } = useUnits();
  const { data: meters = [] } = useMeters();
  const { data: readings = [] } = useReadings();

  const handleExport = () => {
    setIsLoading(true);
    
    try {
      const backup = {
        buildings,
        units,
        meters,
        readings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-medidores-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Backup criado",
        description: "Backup dos dados exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no backup",
        description: "Não foi possível criar o backup.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        toast({
          title: "Importação não disponível",
          description: "Funcionalidade de importação ainda não implementada com Supabase.",
          variant: "destructive",
        });
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Arquivo inválido ou corrompido.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Backup e Restauração</h2>
        <p className="text-gray-600">Gerencie backups dos dados do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Exportar Dados</span>
            </CardTitle>
            <CardDescription>
              Faça download de um backup completo dos dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Edifícios:</span>
                <span className="font-semibold">{buildings.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Unidades:</span>
                <span className="font-semibold">{units.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Medidores:</span>
                <span className="font-semibold">{meters.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Leituras:</span>
                <span className="font-semibold">{readings.length}</span>
              </div>
            </div>
            
            <Button 
              onClick={handleExport}
              disabled={isLoading}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {isLoading ? 'Gerando...' : 'Exportar Backup'}
            </Button>
          </CardContent>
        </Card>

        {/* Restore */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Importar Dados</span>
            </CardTitle>
            <CardDescription>
              Restaure dados de um arquivo de backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Selecione um arquivo de backup (.json)
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="backup-file"
                disabled={isLoading}
              />
              <label
                htmlFor="backup-file"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? 'Processando...' : 'Selecionar Arquivo'}
              </label>
            </div>
            
            <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Atenção!</p>
                <p>A importação substituirá todos os dados existentes. Faça um backup antes de continuar.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Status do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{buildings.length}</div>
              <p className="text-sm text-gray-600">Edifícios</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{units.length}</div>
              <p className="text-sm text-gray-600">Unidades</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{meters.length}</div>
              <p className="text-sm text-gray-600">Medidores</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{readings.length}</div>
              <p className="text-sm text-gray-600">Leituras</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupRestore;