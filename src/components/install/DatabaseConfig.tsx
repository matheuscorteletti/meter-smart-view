
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DatabaseConfigProps {
  config: {
    dbHost: string;
    dbPort: string;
    dbName: string;
    dbUser: string;
    dbPassword: string;
  };
  onConfigChange: (field: string, value: string) => void;
  isDisabled: boolean;
}

const DatabaseConfig = ({ config, onConfigChange, isDisabled }: DatabaseConfigProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Configuração do Banco de Dados</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dbHost">Host do MySQL</Label>
          <Input
            id="dbHost"
            value={config.dbHost}
            onChange={(e) => onConfigChange('dbHost', e.target.value)}
            placeholder="localhost ou IP"
            disabled={isDisabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dbPort">Porta</Label>
          <Input
            id="dbPort"
            value={config.dbPort}
            onChange={(e) => onConfigChange('dbPort', e.target.value)}
            placeholder="3306"
            disabled={isDisabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dbName">Nome do Banco</Label>
          <Input
            id="dbName"
            value={config.dbName}
            onChange={(e) => onConfigChange('dbName', e.target.value)}
            placeholder="meter"
            disabled={isDisabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dbUser">Usuário MySQL</Label>
          <Input
            id="dbUser"
            value={config.dbUser}
            onChange={(e) => onConfigChange('dbUser', e.target.value)}
            placeholder="root ou meter"
            disabled={isDisabled}
            required
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="dbPassword">Senha MySQL</Label>
          <Input
            id="dbPassword"
            type="password"
            value={config.dbPassword}
            onChange={(e) => onConfigChange('dbPassword', e.target.value)}
            placeholder="Senha do banco MySQL"
            disabled={isDisabled}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default DatabaseConfig;
