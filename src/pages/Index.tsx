
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/components/admin/AdminDashboard";
import UserDashboard from "@/components/user/UserDashboard";
import ConsumptionDashboard from "@/components/user/ConsumptionDashboard";
import AuthForm from "@/components/AuthForm";
import Layout from "@/components/Layout";
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
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
