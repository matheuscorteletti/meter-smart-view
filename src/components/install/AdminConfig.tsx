
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdminConfigProps {
  config: {
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  };
  onConfigChange: (field: string, value: string) => void;
  isDisabled: boolean;
}

const AdminConfig = ({ config, onConfigChange, isDisabled }: AdminConfigProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Dados do Administrador</h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="adminName">Nome Completo</Label>
          <Input
            id="adminName"
            value={config.adminName}
            onChange={(e) => onConfigChange('adminName', e.target.value)}
            placeholder="Nome do administrador"
            disabled={isDisabled}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="adminEmail">Email</Label>
          <Input
            id="adminEmail"
            type="email"
            value={config.adminEmail}
            onChange={(e) => onConfigChange('adminEmail', e.target.value)}
            placeholder="admin@medidores.local"
            disabled={isDisabled}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="adminPassword">Senha</Label>
          <Input
            id="adminPassword"
            type="password"
            value={config.adminPassword}
            onChange={(e) => onConfigChange('adminPassword', e.target.value)}
            placeholder="Senha do administrador (mín. 6 caracteres)"
            disabled={isDisabled}
            required
            minLength={6}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;
