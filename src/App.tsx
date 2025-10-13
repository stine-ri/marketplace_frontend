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
import { ProductSellerDashboard } from './components/NewFeature/ProductSellerDashboard';
import { NavigationArrows } from './components/NewFeature/NavigationArrows'; 
import ForgotPassword from './components/auth/ForgotPassword';
import ServiceIndividual from './components/NewFeature/ServicesIndividual';
import ProductIndividual from './components/NewFeature/ProductIndividual';
import ServicesListComponent from './components/NewFeature/ServiceBroadcastRequest';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from './context/ToastContext';

export function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
             <WebSocketWrapper />
          </DataProvider>
        </AuthProvider>
        <ToastContainer /> {/* optional if using react-toastify */}
      </ToastProvider>
    </Router>
  );
}


function WebSocketWrapper() {
  const { user } = useAuth();
  
  return (
    <>
      {/* Your app content */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <WebSocketProvider userId={user?.userId}>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar>
            {user && <NotificationBell userId={user.userId} />}
          </Navbar>
          <AppContent />
          <Footer />
          <NavigationArrows />
        </div>
      </WebSocketProvider>
    </>
  );
}


import { useParams } from 'react-router-dom';

function ServiceIndividualWrapper() {
  const { id } = useParams<{ id: string }>();
  return <ServiceIndividual serviceId={id!} />;
}

function ProductIndividualWrapper() {
  const { id } = useParams<{ id: string }>();
  return <ProductIndividual productId={id!} />;
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
        <Route
          path="/services/:id"
          element={
            <ServiceIndividualWrapper />
          }
        />
        <Route path="/help" element={<Help/>} />
        <Route path="/become-seller" element={<Seller/>} />
          <Route path="/products/:id" element={<ProductIndividualWrapper />} />
        <Route path="/chat/:chatRoomId" element={<ChatWindow />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/services/:id" element={<ServiceIndividualWrapper />} />
          <Route path="/products/:id" element={<ProductIndividualWrapper />} />
   <Route path="/servicesList" element={<ServicesListComponent />} />
    <Route path="/products" element={<Product />} />
{/* <Route path="/marketplace/services/:id" element={<ServiceDetails />} />
<Route path="/marketplace/products/:id" element={<ProductDetails />} /> */}

        {/* Provider Dashboard Route */}
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute requiredRole="service_provider">
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        {/* Product Seller Dashboard Route */}
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute requiredRole="product_seller">
              <ProductSellerDashboard />
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
        {/* Marketplace route for clients */}
<Route
  path="/marketplace"
  element={
    <ProtectedRoute requiredRole="client">
      <ClientDashboard />
    </ProtectedRoute>
  }
/>
      </Routes>
    </main>
  );
}