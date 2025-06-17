
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building } from '@/types';
import { Building2, ArrowRight } from 'lucide-react';

interface BuildingSelectorProps {
  buildings: Building[];
  onSelectBuilding: (buildingId: string) => void;
}

const BuildingSelector: React.FC<BuildingSelectorProps> = ({ buildings, onSelectBuilding }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Selecione um Prédio</h1>
        <p className="text-gray-600">Escolha o prédio para visualizar seus medidores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {buildings.map((building) => (
          <Card key={building.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span>{building.name}</span>
              </CardTitle>
              <CardDescription>{building.address}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => onSelectBuilding(building.id)}
                className="w-full"
              >
                <span>Selecionar Prédio</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BuildingSelector;
