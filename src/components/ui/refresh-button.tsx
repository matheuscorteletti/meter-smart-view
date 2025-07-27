import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface RefreshButtonProps {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ 
  size = 'sm', 
  variant = 'outline',
  className = ''
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      // Invalidar e refetch de todas as queries principais
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['buildings'] }),
        queryClient.invalidateQueries({ queryKey: ['units'] }),
        queryClient.invalidateQueries({ queryKey: ['meters'] }),
        queryClient.invalidateQueries({ queryKey: ['readings'] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
      ]);

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['buildings'] }),
        queryClient.refetchQueries({ queryKey: ['units'] }),
        queryClient.refetchQueries({ queryKey: ['meters'] }),
        queryClient.refetchQueries({ queryKey: ['readings'] }),
        queryClient.refetchQueries({ queryKey: ['users'] }),
      ]);

      toast({
        title: "Dados atualizados",
        description: "Todos os dados foram sincronizados com o banco.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível sincronizar os dados.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleRefresh}
      className={`flex items-center space-x-2 ${className}`}
    >
      <RefreshCw className="w-4 h-4" />
      <span>Atualizar</span>
    </Button>
  );
};

export default RefreshButton;