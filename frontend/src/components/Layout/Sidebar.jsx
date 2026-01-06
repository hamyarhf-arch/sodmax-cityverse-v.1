// frontend/src/components/Layout/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMission } from '../../contexts/MissionContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, isMobile = false }) => {
  const { user } = useAuth();
  const { stats } = useMission();
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState(null);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '📊',
        path: user?.role === 'business' ? '/business-dashboard' : '/dashboard',
        roles: ['user', 'business', 'admin'],
      },
      {
        id: 'missions',
        label: 'Missions',
        icon: '🎯',
        path: '/missions',
        roles: ['user', 'business', 'admin'],
        badge: stats?.available || 0,
      },
      {
        id: 'campaigns',
        label: 'Campaigns',
        icon: '📢',
        path: '/campaigns',
        roles: ['business', 'admin'],
      },
      {
        id: 'wallet',
        label: 'Wallet',
        icon: '💰',
        path: '/wallet',
        roles: ['user', 'business', 'admin'],
      },
      {
        id: 'mining',
        label: 'Mining',
        icon: '⛏️',
        path: '/mining',
        roles: ['user', 'business', 'admin'],
      },
      {
        id: 'leaderboard',
        label: 'Leaderboard',
        icon: '🏆',
        path: '/leaderboard',
        roles: ['user', 'business', 'admin'],
      },
    ];

    if (user?.role === 'business' || user?.role === 'admin') {
      baseItems.push(
        {
          id: 'analytics',
          label: 'Analytics',
          icon: '📈',
          path: '/analytics',
          roles: ['business', 'admin'],
        },
        {
          id: 'business',
          label: 'Business',
          icon: '🏢',
          path: '/business-panel',
          roles: ['business', 'admin'],
        }
      );
    }

    if (user?.role === 'admin') {
      baseItems.push(
        {
          id: 'admin',
          label: 'Admin',
          icon: '🔧',
          path: '/admin-panel',
          roles: ['admin'],
        },
        {
          id: 'users',
          label: 'Users',
          icon: '👥',
          path: '/admin/users',
          roles: ['admin'],
        }
      );
    }

    return baseItems.filter(item => 
      item.roles.includes(user?.role || 'guest')
    );
  };

  // Quick actions
  const quickActions = [
    {
      id: 'create-mission',
      label: 'Create Mission',
      icon: '➕',
      action: () => window.location.href = '/missions/create',
      roles: ['business', 'admin'],
    },
    {
      id: 'start-campaign',
      label: 'Start Campaign',
      icon: '🚀',
      action: () => window.location.href = '/campaigns/create',
      roles: ['business', 'admin'],
    },
    {
      id: 'invite-friend',
      label: 'Invite Friend',
      icon: '👥',
      action: () => {
        // Invite friend logic
        navigator.clipboard.writeText(`${window.location.origin}/invite/${user?.referral_code}`);
        alert('Invite link copied to clipboard!');
      },
      roles: ['user', 'business', 'admin'],
    },
    {
      id: 'support',
      label: 'Support',
      icon: '💬',
      action: () => window.location.href = '/support',
      roles: ['user', 'business', 'admin'],
    },
  ];

  // User stats
  const userStats = [
    {
      label: 'Total Missions',
      value: stats?.total || 0,
      icon: '🎯',
      color: '#667eea',
    },
    {
      label: 'Completed',
      value: stats?.completed || 0,
      icon: '✅',
      color: '#10B981',
    },
    {
      label: 'In Progress',
      value: stats?.inProgress || 0,
      icon: '🔄',
      color: '#F59E0B',
    },
    {
      label: 'Total Rewards',
      value: `${stats?.totalRewards || 0} SOD`,
      icon: '💰',
      color: '#8B5CF6',
    },
  ];

  // Check if path is active
  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Close sidebar on mobile after click
  const handleNavClick = () => {
    if (isMobile) {
      // If you have a close function from parent, call it here
      // For now, we'll just scroll to top
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* User Profile Summary */}
      {user && isOpen && (
        <div className="sidebar-user-profile">
          <div className="user-avatar">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{user.username}</div>
            <div className="user-wallet">
              {user.wallet_address?.substring(0, 6)}...{user.wallet_address?.substring(user.wallet_address.length - 4)}
            </div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {getNavItems().map((item) => (
            <li key={item.id} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''} ${!isOpen ? 'collapsed' : ''}`
                }
                onClick={handleNavClick}
              >
                <span className="nav-icon">{item.icon}</span>
                {isOpen && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Actions - Only show when sidebar is open */}
      {isOpen && (
        <div className="sidebar-quick-actions">
          <h3 className="section-title">Quick Actions</h3>
          <div className="actions-grid">
            {quickActions
              .filter(action => action.roles.includes(user?.role || 'guest'))
              .map((action) => (
                <button
                  key={action.id}
                  className="action-btn"
                  onClick={action.action}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-label">{action.label}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* User Stats - Only show when sidebar is open */}
      {isOpen && user && (
        <div className="sidebar-stats">
          <h3 className="section-title">Your Stats</h3>
          <div className="stats-grid">
            {userStats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div 
                  className="stat-icon"
                  style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        {isOpen ? (
          <>
            <div className="sidebar-version">
              <span className="version-label">Version</span>
              <span className="version-number">1.0.0</span>
            </div>
            <div className="sidebar-theme-toggle">
              <button className="theme-btn" title="Toggle theme">
                🌙
              </button>
            </div>
          </>
        ) : (
          <div className="sidebar-mini-footer">
            <span className="mini-icon">🎮</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
