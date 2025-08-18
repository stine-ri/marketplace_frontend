import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import {ProviderDashboard} from './components/NewFeature/ProviderDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { WebSocketProvider } from './context/WebSocketContext';
import AdminPanel from './components/NewFeature/AdminPanel';
import NotificationBell from './components/NewFeature/NotificationBell';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProvidersList from './pages/ProviderList';
import ProviderPublicProfile from './pages/ProviderPublicProfile';
import { ClientDashboard } from './components/NewFeature/ClientDashboard';
import ServicesProductsComponent  from './components/Services';
import Product from './pages/Product';
import Help from './pages/Help';
import Seller from './pages/Seller';
import { ChatList } from './components/Chat/ChatList';
import { ChatWindow } from './components/Chat/ChatWindow';
import { ToastContainer } from 'react-toastify';
import { ProductDetail } from './components/NewFeature/ProductDetail';
import 'react-toastify/dist/ReactToastify.css';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
           <WebSocketWrapper />
        </DataProvider>
      </AuthProvider>
      <ToastContainer />
    </Router>
  );
}

function WebSocketWrapper() {
  const { user } = useAuth();
  
  return (
    <WebSocketProvider userId={user?.userId}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar>
          {user && <NotificationBell userId={user.userId} />}
        </Navbar>
        <AppContent />
        <Footer />
      </div>
    </WebSocketProvider>
  );
}


function AppContent() {
  return (
    <main className="flex-grow">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/providers" element={<ProvidersList />} />
        <Route path="/providers/public/:id" element={<ProviderPublicProfile />} />
        <Route path="/services" element={<ServicesProductsComponent />} />
        <Route path="/products" element={<Product/>} />
        <Route path="/help" element={<Help/>} />
        <Route path="/become-seller" element={<Seller/>} />
        <Route path="/chat" element={<ChatList />} />
        <Route path="/chat/:chatRoomId" element={<ChatWindow />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        
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
        
        {/* Client dashboard route */}
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
  );
}