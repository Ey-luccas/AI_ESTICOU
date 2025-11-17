import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './components/Login';
import Layout from './components/Layout';

// Designer components
import DesignerDashboard from './components/designer/DesignerDashboard';
import SendArt from './components/designer/SendArt';
import MyArts from './components/designer/MyArts';
import DesignerArtDetail from './components/designer/DesignerArtDetail';

// Client components
import ClientDashboard from './components/client/ClientDashboard';
import ClientCatalog from './components/client/ClientCatalog';
import ClientArtDetail from './components/client/ClientArtDetail';
import ClientVariations from './components/client/ClientVariations';

// Manager components
import ManagerDashboard from './components/manager/ManagerDashboard';
import ManagerClients from './components/manager/ManagerClients';
import ManagerDesigners from './components/manager/ManagerDesigners';
import ManagerSettings from './components/manager/ManagerSettings';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: string }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to={`/${user?.role}`} replace /> : <Login />} 
      />

      {/* Designer routes */}
      <Route
        path="/designer"
        element={
          <ProtectedRoute allowedRole="designer">
            <Layout><DesignerDashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/my-arts"
        element={
          <ProtectedRoute allowedRole="designer">
            <Layout><MyArts /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/send-art"
        element={
          <ProtectedRoute allowedRole="designer">
            <Layout><SendArt /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/art/:id"
        element={
          <ProtectedRoute allowedRole="designer">
            <Layout><DesignerArtDetail /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/designer/settings"
        element={
          <ProtectedRoute allowedRole="designer">
            <Layout><div className="text-center py-12 text-gray-500">Página em desenvolvimento</div></Layout>
          </ProtectedRoute>
        }
      />

      {/* Client routes */}
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedRole="client">
            <Layout><ClientDashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/catalog"
        element={
          <ProtectedRoute allowedRole="client">
            <Layout><ClientCatalog /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/art/:id"
        element={
          <ProtectedRoute allowedRole="client">
            <Layout><ClientArtDetail /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/variations"
        element={
          <ProtectedRoute allowedRole="client">
            <Layout><ClientVariations /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/ai"
        element={
          <ProtectedRoute allowedRole="client">
            <Layout><div className="text-center py-12 text-gray-500">Página em desenvolvimento</div></Layout>
          </ProtectedRoute>
        }
      />

      {/* Manager routes */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRole="manager">
            <Layout><ManagerDashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/clients"
        element={
          <ProtectedRoute allowedRole="manager">
            <Layout><ManagerClients /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/designers"
        element={
          <ProtectedRoute allowedRole="manager">
            <Layout><ManagerDesigners /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/settings"
        element={
          <ProtectedRoute allowedRole="manager">
            <Layout><ManagerSettings /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to={`/${user?.role}`} replace /> : 
            <Navigate to="/login" replace />
        } 
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
