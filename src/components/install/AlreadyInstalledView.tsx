
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertCircle } from 'lucide-react';

const AlreadyInstalledView = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-red-700">
            Sistema já Instalado
          </CardTitle>
          <CardDescription>
            O sistema já foi instalado anteriormente
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Por segurança, a instalação não pode ser executada novamente.
              Se precisar reinstalar, entre em contato com o suporte técnico.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Ir para o Sistema
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlreadyInstalledView;
