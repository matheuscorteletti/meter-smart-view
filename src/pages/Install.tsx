
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InstallConfig {
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
}

interface InstallStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

const Install = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<InstallConfig>({
    dbHost: 'localhost',
    dbPort: '3306',
    dbName: 'meter',
    dbUser: '',
    dbPassword: ''
  });

  const [isInstalling, setIsInstalling] = useState(false);
  const [installSteps, setInstallSteps] = useState<InstallStep[]>([
    { id: 'test', name: 'Testar conexão com banco', status: 'pending' },
    { id: 'env', name: 'Criar arquivo .env', status: 'pending' },
    { id: 'database', name: 'Criar banco de dados', status: 'pending' },
    { id: 'structure', name: 'Criar estrutura e dados', status: 'pending' }
  ]);

  const updateStep = (stepId: string, status: InstallStep['status'], message?: string) => {
    setInstallSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message } : step
    ));
  };

  const handleInstall = async () => {
    if (!config.dbUser || !config.dbPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Usuário e senha do banco são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsInstalling(true);
    
    try {
      // Reset steps
      setInstallSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined })));

      // Step 1: Test connection
      updateStep('test', 'running');
      const testResponse = await fetch('/api/install/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!testResponse.ok) {
        const error = await testResponse.text();
        updateStep('test', 'error', error);
        throw new Error('Falha na conexão com o banco');
      }
      updateStep('test', 'success', 'Conexão estabelecida');

      // Step 2: Create .env
      updateStep('env', 'running');
      const envResponse = await fetch('/api/install/create-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!envResponse.ok) {
        updateStep('env', 'error', 'Erro ao criar .env');
        throw new Error('Falha ao criar arquivo .env');
      }
      updateStep('env', 'success', 'Arquivo .env criado');

      // Step 3: Create database
      updateStep('database', 'running');
      const dbResponse = await fetch('/api/install/create-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!dbResponse.ok) {
        updateStep('database', 'error', 'Erro ao criar banco');
        throw new Error('Falha ao criar banco de dados');
      }
      updateStep('database', 'success', 'Banco criado');

      // Step 4: Create structure
      updateStep('structure', 'running');
      const structureResponse = await fetch('/api/install/create-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!structureResponse.ok) {
        updateStep('structure', 'error', 'Erro ao criar estrutura');
        throw new Error('Falha ao criar estrutura do banco');
      }
      
      const result = await structureResponse.json();
      updateStep('structure', 'success', `Estrutura criada - ${result.summary}`);

      toast({
        title: "Instalação concluída!",
        description: "Sistema instalado com sucesso. Recarregue a página.",
      });

      // Redirect after success
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);

    } catch (error) {
      console.error('Install error:', error);
      toast({
        title: "Erro na instalação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const getStepIcon = (status: InstallStep['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            🏢 Sistema de Medidores
          </CardTitle>
          <CardDescription className="text-lg">
            Instalação Completa do Sistema
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Configuration Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dbHost">Host do MySQL</Label>
              <Input
                id="dbHost"
                value={config.dbHost}
                onChange={(e) => setConfig(prev => ({ ...prev, dbHost: e.target.value }))}
                placeholder="localhost ou IP"
                disabled={isInstalling}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dbPort">Porta</Label>
              <Input
                id="dbPort"
                value={config.dbPort}
                onChange={(e) => setConfig(prev => ({ ...prev, dbPort: e.target.value }))}
                placeholder="3306"
                disabled={isInstalling}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dbName">Nome do Banco</Label>
              <Input
                id="dbName"
                value={config.dbName}
                onChange={(e) => setConfig(prev => ({ ...prev, dbName: e.target.value }))}
                placeholder="meter"
                disabled={isInstalling}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dbUser">Usuário MySQL</Label>
              <Input
                id="dbUser"
                value={config.dbUser}
                onChange={(e) => setConfig(prev => ({ ...prev, dbUser: e.target.value }))}
                placeholder="root ou meter"
                disabled={isInstalling}
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="dbPassword">Senha MySQL</Label>
              <Input
                id="dbPassword"
                type="password"
                value={config.dbPassword}
                onChange={(e) => setConfig(prev => ({ ...prev, dbPassword: e.target.value }))}
                placeholder="Senha do banco MySQL"
                disabled={isInstalling}
                required
              />
            </div>
          </div>

          {/* Install Progress */}
          {isInstalling && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Progresso da Instalação</h3>
              {installSteps.map((step) => (
                <div key={step.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <div className="font-medium">{step.name}</div>
                    {step.message && (
                      <div className={`text-sm ${
                        step.status === 'error' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {step.message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={handleInstall}
            disabled={isInstalling || !config.dbUser || !config.dbPassword}
            className="w-full h-12 text-lg"
          >
            {isInstalling ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Instalando Sistema...
              </>
            ) : (
              '🚀 Iniciar Instalação'
            )}
          </Button>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Certifique-se de que o MySQL está rodando e que o usuário 
              informado tem privilégios para criar bancos de dados.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
