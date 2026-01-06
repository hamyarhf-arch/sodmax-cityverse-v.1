import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicOnlyRoute from './components/Auth/PublicOnlyRoute';
import './App.css';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home/Home'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const BusinessRegister = lazy(() => import('./pages/Auth/BusinessRegister'));
const UserDashboard = lazy(() => import('./pages/User/Dashboard/Dashboard'));
const BusinessDashboard = lazy(() => import('./pages/Business/Dashboard/Dashboard'));
const Missions = lazy(() => import('./pages/User/Missions/Missions'));
const MissionDetails = lazy(() => import('./pages/User/Missions/Details'));
const Campaigns = lazy(() => import('./pages/Business/Campaigns/Campaigns'));
const CreateCampaign = lazy(() => import('./pages/Business/Campaigns/CreateCampaign'));
const CampaignDetails = lazy(() => import('./pages/Business/Campaigns/Details'));
const Wallet = lazy(() => import('./pages/User/Wallet/Wallet'));
const Profile = lazy(() => import('./pages/User/Profile/Profile'));
const Mining = lazy(() => import('./pages/User/Mining/Mining'));
const Referrals = lazy(() => import('./pages/User/Referrals/Referrals'));
const AdminPanel = lazy(() => import('./pages/Admin/Panel/Panel'));
const Support = lazy(() => import('./pages/Support/Support'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);
  
  return null;
};

function App() {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }
  
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Layout><Login /></Layout>
              </PublicOnlyRoute>
            }
          />
          
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Layout><Register /></Layout>
              </PublicOnlyRoute>
            }
          />
          
          <Route
            path="/business/register"
            element={
              <PublicOnlyRoute>
                <Layout><BusinessRegister /></Layout>
              </PublicOnlyRoute>
            }
          />
          
          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedTypes={['user']}>
                <Layout><UserDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/missions"
            element={
              <ProtectedRoute allowedTypes={['user']}>
                <Layout><Missions /></Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/missions/:id"
            element={
              <ProtectedRoute allowedTypes={['user']}>
                <Layout><MissionDetails /></Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/wallet"
            element={
              <ProtectedRoute allowedTypes={['user']}>
                <Layout><Wallet /></Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/mining"
            element={
              <ProtectedRoute allowedTypes={['user']}>
                <Layout><Mining /></Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/referrals"
            element={
              <ProtectedRoute allowedTypes={['user']}>
                <Layout><Referrals /></Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedTypes={['user', 'business', 'admin']}>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Business Routes */}
          <Route
            path="/business/dashboard"
            element={
              <ProtectedRoute allowedTypes={['business']}>
                <Layout><BusinessDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/business/campaigns"
            element={
              <ProtectedRoute allowedTypes={['business']}>
                <Layout><Campaigns /></Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/business/campaigns/create"
            element={
              <ProtectedRoute allowedTypes={['business']}>
                <Layout><CreateCampaign /></Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/business/campaigns/:id"
            element={
              <ProtectedRoute allowedTypes={['business']}>
                <Layout><CampaignDetails /></Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedTypes={['admin']}>
                <Layout><AdminPanel /></Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Support Route */}
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <Layout><Support /></Layout>
              </ProtectedRoute>
            }
          />
          
          {/* 404 Route */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
