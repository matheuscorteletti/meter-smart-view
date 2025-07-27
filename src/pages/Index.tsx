
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/components/admin/AdminDashboard";
import UserDashboard from "@/components/user/UserDashboard";
import ConsumptionDashboard from "@/components/user/ConsumptionDashboard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import Layout from "@/components/Layout";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="text-center space-y-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sistema de Medidores</h1>
            <p className="text-xl text-gray-600 mb-8">Gestão inteligente de consumo</p>
          </div>
          <div className="space-y-4">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-3">
                Acessar Sistema
              </Button>
            </Link>
            <p className="text-sm text-gray-500">
              Faça login ou cadastre-se para começar
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'user':
        return <UserDashboard />;
      case 'viewer':
        return <ConsumptionDashboard />;
      default:
        return <ConsumptionDashboard />;
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

export default Index;
