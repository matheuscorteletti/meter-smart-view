
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload, Database, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBuildings, getUnits, getMeters, getReadings, saveBuildings, saveUnits, saveMeters, saveReadings } from '@/lib/storage';

const BackupRestore = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [backupData, setBackupData] = useState('');
  const { toast } = useToast();

  const generateBackup = () => {
    setIsLoading(true);
    
    try {
      const buildings = getBuildings();
      const units = getUnits();
      const meters = getMeters();
      const readings = getReadings();

      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          buildings,
          units,
          meters,
          readings
        },
        stats: {
          buildings: buildings.length,
          units: units.length,
          meters: meters.length,
          readings: readings.length
        }
      };

      const backupJson = JSON.stringify(backup, null, 2);
      
      // Download do arquivo
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-medidores-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup realizado com sucesso!",
        description: `Backup gerado com ${backup.stats.buildings} edifícios, ${backup.stats.units} unidades, ${backup.stats.meters} medidores e ${backup.stats.readings} leituras.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar backup",
        description: "Ocorreu um erro ao criar o arquivo de backup.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBackupData(content);
    };
    reader.readAsText(file);
  };

  const restoreBackup = () => {
    if (!backupData.trim()) {
      toast({
        title: "Nenhum dado para restaurar",
        description: "Por favor, carregue um arquivo de backup ou cole os dados JSON.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const backup = JSON.parse(backupData);
      
      // Validar estrutura do backup
      if (!backup.data || !backup.version) {
        throw new Error('Formato de backup inválido');
      }

      const { buildings, units, meters, readings } = backup.data;

      // Validar dados
      if (!Array.isArray(buildings) || !Array.isArray(units) || 
          !Array.isArray(meters) || !Array.isArray(readings)) {
        throw new Error('Dados de backup corrompidos');
      }

      // Restaurar dados
      saveBuildings(buildings);
      saveUnits(units);
      saveMeters(meters);
      saveReadings(readings);

      toast({
        title: "Restauração concluída!",
        description: `Dados restaurados: ${buildings.length} edifícios, ${units.length} unidades, ${meters.length} medidores e ${readings.length} leituras.`,
      });

      // Limpar textarea
      setBackupData('');
      
      // Recarregar página para refletir mudanças
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      toast({
        title: "Erro na restauração",
        description: "Arquivo de backup inválido ou corrompido. Verifique o formato JSON.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Backup e Restore</h2>
        <p className="text-gray-600">Gerencie backups e restauração dos dados do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-blue-600" />
              <span>Gerar Backup</span>
            </CardTitle>
            <CardDescription>
              Criar arquivo de backup com todos os dados do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Database className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">O backup incluirá:</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Todos os edifícios cadastrados</li>
                    <li>• Todas as unidades</li>
                    <li>• Todos os medidores</li>
                    <li>• Todas as leituras registradas</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={generateBackup} 
              disabled={isLoading}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {isLoading ? 'Gerando...' : 'Gerar e Baixar Backup'}
            </Button>
          </CardContent>
        </Card>

        {/* Restore */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-green-600" />
              <span>Restaurar Backup</span>
            </CardTitle>
            <CardDescription>
              Restaurar dados a partir de um arquivo de backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Atenção:</p>
                  <p className="text-sm text-amber-700 mt-1">
                    A restauração irá substituir TODOS os dados atuais do sistema.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="backup-file">Carregar arquivo de backup</Label>
                <Input
                  id="backup-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="backup-data">Ou cole os dados JSON aqui:</Label>
                <Textarea
                  id="backup-data"
                  value={backupData}
                  onChange={(e) => setBackupData(e.target.value)}
                  placeholder='{"version": "1.0", "data": {...}}'
                  className="mt-1 h-32 font-mono text-xs"
                />
              </div>
            </div>

            <Button 
              onClick={restoreBackup} 
              disabled={isLoading || !backupData.trim()}
              variant="secondary"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isLoading ? 'Restaurando...' : 'Restaurar Dados'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span>Informações Técnicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-900">Formato do Backup:</p>
              <ul className="mt-1 space-y-1">
                <li>• Arquivo JSON estruturado</li>
                <li>• Inclui versão e timestamp</li>
                <li>• Contém estatísticas dos dados</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-900">Compatibilidade:</p>
              <ul className="mt-1 space-y-1">
                <li>• Versão atual: 1.0</li>
                <li>• Preserva relacionamentos</li>
                <li>• Mantém IDs originais</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupRestore;
