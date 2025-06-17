
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DatabaseConfig from '@/components/install/DatabaseConfig';
import AdminConfig from '@/components/install/AdminConfig';
import InstallProgress from '@/components/install/InstallProgress';
import AlreadyInstalledView from '@/components/install/AlreadyInstalledView';

interface InstallConfig {
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

interface InstallStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

const Install = () => {
  const { toast } = useToast();
  const [isInstalled, setIsInstalled] = useState(false);
  const [checkingInstallation, setCheckingInstallation] = useState(true);
  
  const [config, setConfig] = useState<InstallConfig>({
    dbHost: 'localhost',
    dbPort: '3306',
    dbName: 'meter',
    dbUser: '',
    dbPassword: '',
    adminName: 'Administrador',
    adminEmail: 'admin@medidores.local',
    adminPassword: ''
  });

  const [isInstalling, setIsInstalling] = useState(false);
  const [installSteps, setInstallSteps] = useState<InstallStep[]>([
    { id: 'test', name: 'Testar conexão com banco', status: 'pending' },
    { id: 'env', name: 'Criar arquivo .env', status: 'pending' },
    { id: 'database', name: 'Criar banco de dados', status: 'pending' },
    { id: 'structure', name: 'Criar estrutura e dados', status: 'pending' },
    { id: 'admin', name: 'Criar usuário administrador', status: 'pending' }
  ]);

  // Verificar se o sistema já foi instalado
  useEffect(() => {
    const checkInstallation = async () => {
      try {
        const response = await fetch('/api/install/check-installation');
        const result = await response.json();
        setIsInstalled(result.isInstalled);
      } catch (error) {
        console.log('Sistema não instalado ainda');
        setIsInstalled(false);
      } finally {
        setCheckingInstallation(false);
      }
    };

    checkInstallation();
  }, []);

  const handleConfigChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const updateStep = (stepId: string, status: InstallStep['status'], message?: string) => {
    setInstallSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message } : step
    ));
  };

  const validateForm = () => {
    if (!config.dbUser || !config.dbPassword || !config.adminEmail || !config.adminPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return false;
    }

    if (config.adminPassword.length < 6) {
      toast({
        title: "Senha muito fraca",
        description: "A senha do administrador deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleInstall = async () => {
    if (!validateForm()) return;

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

      // Step 5: Create admin user
      updateStep('admin', 'running');
      const adminResponse = await fetch('/api/install/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!adminResponse.ok) {
        updateStep('admin', 'error', 'Erro ao criar administrador');
        throw new Error('Falha ao criar usuário administrador');
      }
      updateStep('admin', 'success', 'Administrador criado');

      toast({
        title: "Instalação concluída!",
        description: "Sistema instalado com sucesso. Redirecionando...",
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

  if (checkingInstallation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verificando instalação...</span>
        </div>
      </div>
    );
  }

  if (isInstalled) {
    return <AlreadyInstalledView />;
  }

  const isFormValid = config.dbUser && config.dbPassword && config.adminEmail && config.adminPassword;

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
          <DatabaseConfig 
            config={config}
            onConfigChange={handleConfigChange}
            isDisabled={isInstalling}
          />

          <AdminConfig 
            config={config}
            onConfigChange={handleConfigChange}
            isDisabled={isInstalling}
          />

          {isInstalling && <InstallProgress steps={installSteps} />}

          <Button 
            onClick={handleInstall}
            disabled={isInstalling || !isFormValid}
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

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Certifique-se de que o MySQL está rodando e que o usuário 
              informado tem privilégios para criar bancos de dados. Após a instalação, esta página 
              será automaticamente desabilitada por segurança.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
