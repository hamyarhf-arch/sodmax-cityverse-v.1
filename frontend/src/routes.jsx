// frontend/src/routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout
import Layout from './components/Layout/Layout';

// Pages
import Home from './pages/Home';
import UserPanel from './pages/UserPanel';
import BusinessPanel from './pages/BusinessPanel';
import AdminPanel from './pages/AdminPanel';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import BusinessRegister from './components/Auth/BusinessRegister';

// Dashboard Components
import UserDashboard from './components/Dashboard/UserDashboard';
import BusinessDashboard from './components/Dashboard/BusinessDashboard';
import MiningCenter from './components/Dashboard/MiningCenter';

// Mission Components
import MissionList from './components/Missions/MissionList';
import MissionDetails from './components/Missions/MissionDetails';

// Campaign Components
import CampaignList from './components/Campaigns/CampaignList';
import CampaignForm from './components/Campaigns/CampaignForm';

// Wallet Components
import WalletBalance from './components/Wallet/WalletBalance';
import TransactionHistory from './components/Wallet/TransactionHistory';

// Route Guards
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicOnlyRoute from './components/Auth/PublicOnlyRoute';

// Route configuration
const routesConfig = [
  // Public routes
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
        public: true,
      },
      {
        path: 'login',
        element: (
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        ),
        public: true,
      },
      {
        path: 'register',
        element: (
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        ),
        public: true,
      },
      {
        path: 'register-business',
        element: (
          <PublicOnlyRoute>
            <BusinessRegister />
          </PublicOnlyRoute>
        ),
        public: true,
      },
    ],
  },

  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <UserDashboard />,
        roles: ['user'],
      },
      {
        path: 'business-dashboard',
        element: <BusinessDashboard />,
        roles: ['business'],
      },
      {
        path: 'user-panel',
        element: <UserPanel />,
        roles: ['user'],
      },
      {
        path: 'business-panel',
        element: <BusinessPanel />,
        roles: ['business', 'admin'],
      },
      {
        path: 'admin-panel',
        element: <AdminPanel />,
        roles: ['admin'],
      },
      {
        path: 'mining',
        element: <MiningCenter />,
        roles: ['user', 'business'],
      },
      {
        path: 'missions',
        children: [
          {
            index: true,
            element: <MissionList />,
          },
          {
            path: ':id',
            element: <MissionDetails />,
          },
        ],
        roles: ['user', 'business'],
      },
      {
        path: 'campaigns',
        children: [
          {
            index: true,
            element: <CampaignList />,
          },
          {
            path: 'create',
            element: <CampaignForm />,
          },
        ],
        roles: ['business', 'admin'],
      },
      {
        path: 'wallet',
        children: [
          {
            index: true,
            element: <WalletBalance />,
          },
          {
            path: 'transactions',
            element: <TransactionHistory />,
          },
        ],
        roles: ['user', 'business', 'admin'],
      },
    ],
  },

  // 404 route
  {
    path: '*',
    element: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '20px',
      }}>
        <h1 style={{ fontSize: '8rem', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ maxWidth: '500px', marginBottom: '2rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          style={{
            padding: '12px 30px',
            background: 'white',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: '25px',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Go Home
        </a>
      </div>
    ),
  },
];

// Render routes recursively
const renderRoutes = (routes) => {
  return routes.map((route, index) => {
    if (route.children) {
      return (
        <Route key={index} path={route.path} element={route.element}>
          {renderRoutes(route.children)}
        </Route>
      );
    }
    
    return (
      <Route
        key={index}
        path={route.path}
        element={route.element}
        index={route.index}
      />
    );
  });
};

// Main Routes component
const AppRoutes = () => {
  return <Routes>{renderRoutes(routesConfig)}</Routes>;
};

export default AppRoutes;

// Helper function to check if user can access route
export const canAccessRoute = (userRole, routeRoles = []) => {
  if (routeRoles.length === 0) return true;
  if (!userRole) return false;
  return routeRoles.includes(userRole);
};

// Get all available routes for navigation
export const getAvailableRoutes = (userRole) => {
  const allRoutes = [
    { path: '/', label: 'Home', icon: '🏠', public: true },
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['user'] },
    { path: '/business-dashboard', label: 'Business Dashboard', icon: '🏢', roles: ['business'] },
    { path: '/missions', label: 'Missions', icon: '🎯', roles: ['user', 'business'] },
    { path: '/campaigns', label: 'Campaigns', icon: '📢', roles: ['business', 'admin'] },
    { path: '/wallet', label: 'Wallet', icon: '💰', roles: ['user', 'business', 'admin'] },
    { path: '/mining', label: 'Mining', icon: '⛏️', roles: ['user', 'business'] },
    { path: '/admin-panel', label: 'Admin Panel', icon: '🔧', roles: ['admin'] },
  ];

  return allRoutes.filter(route => 
    route.public || (userRole && canAccessRoute(userRole, route.roles))
  );
};
