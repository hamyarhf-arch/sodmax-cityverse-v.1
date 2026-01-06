// frontend/src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const BusinessRegister = lazy(() => import('./components/Auth/BusinessRegister'));
const UserPanel = lazy(() => import('./pages/UserPanel'));
const BusinessPanel = lazy(() => import('./pages/BusinessPanel'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// Dashboard components
const UserDashboard = lazy(() => import('./components/Dashboard/UserDashboard'));
const BusinessDashboard = lazy(() => import('./components/Dashboard/BusinessDashboard'));
const MiningCenter = lazy(() => import('./components/Dashboard/MiningCenter'));

// Mission components
const MissionList = lazy(() => import('./components/Missions/MissionList'));
const MissionDetails = lazy(() => import('./components/Missions/MissionDetails'));

// Campaign components
const CampaignList = lazy(() => import('./components/Campaigns/CampaignList'));
const CampaignForm = lazy(() => import('./components/Campaigns/CampaignForm'));

// Wallet components
const WalletBalance = lazy(() => import('./components/Wallet/WalletBalance'));
const TransactionHistory = lazy(() => import('./components/Wallet/TransactionHistory'));

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '5px solid rgba(255,255,255,0.3)',
      borderTop: '5px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Public Only Route component
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          
          {/* Auth routes - only for non-authenticated users */}
          <Route path="/login" element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } />
          
          <Route path="/register" element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          } />
          
          <Route path="/register-business" element={
            <PublicOnlyRoute>
              <BusinessRegister />
            </PublicOnlyRoute>
          } />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {user?.role === 'business' ? <BusinessDashboard /> : <UserDashboard />}
            </ProtectedRoute>
          } />
          
          <Route path="/user-panel" element={
            <ProtectedRoute>
              <UserPanel />
            </ProtectedRoute>
          } />
          
          <Route path="/business-panel" element={
            <ProtectedRoute roles={['business', 'admin']}>
              <BusinessPanel />
            </ProtectedRoute>
          } />
          
          <Route path="/admin-panel" element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          
          {/* Dashboard routes */}
          <Route path="/mining" element={
            <ProtectedRoute>
              <MiningCenter />
            </ProtectedRoute>
          } />
          
          {/* Mission routes */}
          <Route path="/missions" element={
            <ProtectedRoute>
              <MissionList />
            </ProtectedRoute>
          } />
          
          <Route path="/missions/:id" element={
            <ProtectedRoute>
              <MissionDetails />
            </ProtectedRoute>
          } />
          
          {/* Campaign routes */}
          <Route path="/campaigns" element={
            <ProtectedRoute roles={['business', 'admin']}>
              <CampaignList />
            </ProtectedRoute>
          } />
          
          <Route path="/campaigns/create" element={
            <ProtectedRoute roles={['business', 'admin']}>
              <CampaignForm />
            </ProtectedRoute>
          } />
          
          {/* Wallet routes */}
          <Route path="/wallet" element={
            <ProtectedRoute>
              <WalletBalance />
            </ProtectedRoute>
          } />
          
          <Route path="/transactions" element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          } />
          
          {/* 404 route */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '60vh',
              textAlign: 'center',
              padding: '20px',
            }}>
              <h1 style={{ fontSize: '8rem', marginBottom: '1rem', color: '#667eea' }}>404</h1>
              <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
              <p>The page you're looking for doesn't exist or has been moved.</p>
              <button
                onClick={() => window.history.back()}
                style={{
                  marginTop: '2rem',
                  padding: '10px 30px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                Go Back
              </button>
            </div>
          } />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
