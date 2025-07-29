import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import {ProviderDashboard} from './components/NewFeature/ProviderDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { WebSocketProvider } from './context/WebSocketContext';
// import RequestForm from './components/NewFeature/RequestForm';
import AdminPanel from './components/NewFeature/AdminPanel';
import NotificationBell from './components/NewFeature/NotificationBell';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { ClientDashboard } from './components/NewFeature/ClientDashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <WebSocketProvider>
            <AppContent />
          </WebSocketProvider>
        </DataProvider>
      </AuthProvider>
      <ToastContainer />
    </Router>
  );
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar>
        {user && <NotificationBell />}
      </Navbar>
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/request" element={<RequestForm />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Provider Dashboard Route */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute requiredRole="service_provider">
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Dashboard Route */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          
          {/* Alternative admin route (in case your login uses /admin) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          
          {/* Add client dashboard route if needed */}
          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard/>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}