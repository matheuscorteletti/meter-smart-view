
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/components/admin/AdminDashboard";
import UserDashboard from "@/components/user/UserDashboard";
import ConsumptionDashboard from "@/components/user/ConsumptionDashboard";
import LoginForm from "@/components/LoginForm";
import Layout from "@/components/Layout";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
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
