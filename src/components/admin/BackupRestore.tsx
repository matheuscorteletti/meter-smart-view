
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';

const BackupRestore = () => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { apiCall } = useApi();

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Para demonstração - em um sistema real, isso seria uma chamada API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular download de backup
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: 'backup_content_here'
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup criado com sucesso",
        description: "O arquivo de backup foi baixado automaticamente.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar backup",
        description: "Não foi possível criar o backup. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo de backup.",
        variant: "destructive"
      });
      return;
    }

    setIsRestoringBackup(true);
    try {
      // Para demonstração - em um sistema real, isso seria uma chamada API
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "Backup restaurado com sucesso",
        description: "O sistema foi restaurado para o estado do backup selecionado.",
      });
      
      setSelectedFile(null);
      // Reset input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      toast({
        title: "Erro ao restaurar backup",
        description: "Não foi possível restaurar o backup. Verifique o arquivo e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRestoringBackup(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Backup e Restauração</h1>
        <p className="text-gray-600">Gerencie backups do sistema e restaure dados quando necessário</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Criar Backup */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle>Criar Backup</CardTitle>
                <CardDescription>
                  Gere um backup completo do sistema atual
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                O backup incluirá todos os dados: usuários, edifícios, unidades, medidores e leituras.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Último backup:</strong> Nunca criado
              </p>
            </div>

            <Button 
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {isCreatingBackup ? 'Criando Backup...' : 'Criar Backup'}
            </Button>
          </CardContent>
        </Card>

        {/* Restaurar Backup */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-orange-600" />
              <div>
                <CardTitle>Restaurar Backup</CardTitle>
                <CardDescription>
                  Restaure o sistema a partir de um backup anterior
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-orange-50 border-orange-200">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                <strong>Atenção:</strong> Esta ação substituirá todos os dados atuais pelos dados do backup.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="backup-file">Selecionar arquivo de backup</Label>
              <Input
                id="backup-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            {selectedFile && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Arquivo selecionado: {selectedFile.name}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleRestoreBackup}
              disabled={isRestoringBackup || !selectedFile}
              variant="outline"
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isRestoringBackup ? 'Restaurando...' : 'Restaurar Backup'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Backup:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Recomenda-se criar backups regulares (diariamente ou semanalmente)</li>
              <li>Mantenha os arquivos de backup em local seguro</li>
              <li>O backup inclui dados sensíveis - mantenha a segurança</li>
            </ul>
            
            <p className="mt-4"><strong>Restauração:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Todos os dados atuais serão substituídos</li>
              <li>Usuários podem precisar fazer login novamente após a restauração</li>
              <li>Verifique a compatibilidade da versão do backup</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupRestore;
