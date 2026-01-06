// frontend/src/components/Layout/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import './Header.css';

const Header = () => {
  const { user, logout, connectWallet } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    if (isWalletConnecting) return;
    
    try {
      setIsWalletConnecting(true);
      const walletAddress = await connectWallet();
      
      if (walletAddress) {
        toast.success(`Wallet connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`);
      }
    } catch (error) {
      console.error('Connect wallet error:', error);
    } finally {
      setIsWalletConnecting(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  // Navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { path: '/', label: 'Home', icon: '🏠' },
      { path: '/missions', label: 'Missions', icon: '🎯' },
      { path: '/wallet', label: 'Wallet', icon: '💰' },
    ];

    if (user) {
      if (user.role === 'business' || user.role === 'admin') {
        baseItems.push(
          { path: '/campaigns', label: 'Campaigns', icon: '📢' },
          { path: '/business-panel', label: 'Business Panel', icon: '🏢' }
        );
      }

      if (user.role === 'user') {
        baseItems.push(
          { path: '/dashboard', label: 'Dashboard', icon: '📊' },
          { path: '/mining', label: 'Mining', icon: '⛏️' }
        );
      }

      if (user.role === 'admin') {
        baseItems.push(
          { path: '/admin-panel', label: 'Admin Panel', icon: '🔧' }
        );
      }
    }

    return baseItems;
  };

  // Format wallet address for display
  const formatWalletAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <Link to="/" className="logo-link">
            <div className="logo-icon">🎮</div>
            <div className="logo-text">
              <span className="logo-primary">Sodmax</span>
              <span className="logo-secondary">Cityverse</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul className="nav-list">
            {getNavItems().map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Section */}
        <div className="header-right">
          {/* Wallet Button */}
          {window.ethereum && (
            <button
              className={`wallet-btn ${isWalletConnecting ? 'connecting' : ''}`}
              onClick={handleConnectWallet}
              disabled={isWalletConnecting}
            >
              {isWalletConnecting ? (
                <>
                  <span className="spinner"></span>
                  Connecting...
                </>
              ) : (
                <>
                  <span className="wallet-icon">🔗</span>
                  Connect Wallet
                </>
              )}
            </button>
          )}

          {/* User Profile or Auth Buttons */}
          {user ? (
            <div className="user-profile">
              <button
                className="profile-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="profile-avatar">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="profile-info">
                  <span className="profile-name">{user.username}</span>
                  <span className="profile-wallet">
                    {formatWalletAddress(user.wallet_address)}
                  </span>
                </div>
                <span className="profile-arrow">▼</span>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} />
                      ) : (
                        <div className="dropdown-avatar-placeholder">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="dropdown-user-info">
                      <div className="dropdown-username">{user.username}</div>
                      <div className="dropdown-email">{user.email || 'No email'}</div>
                      <div className="dropdown-role">{user.role}</div>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <Link
                    to="/user-panel"
                    className="dropdown-item"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <span className="dropdown-icon">👤</span>
                    My Profile
                  </Link>
                  
                  <Link
                    to="/wallet"
                    className="dropdown-item"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <span className="dropdown-icon">💰</span>
                    My Wallet
                  </Link>
                  
                  {user.business && (
                    <Link
                      to="/business-panel"
                      className="dropdown-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span className="dropdown-icon">🏢</span>
                      My Business
                    </Link>
                  )}
                  
                  <div className="dropdown-divider"></div>
                  
                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login-btn">
                Login
              </Link>
              <Link to="/register" className="auth-btn register-btn">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={`menu-icon ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <div className="mobile-logo">
            <span className="mobile-logo-icon">🎮</span>
            <span className="mobile-logo-text">Sodmax Cityverse</span>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setIsMenuOpen(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="mobile-nav-content">
          <ul className="mobile-nav-list">
            {getNavItems().map((item) => (
              <li key={item.path} className="mobile-nav-item">
                <Link
                  to={item.path}
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">{item.icon}</span>
                  <span className="mobile-nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mobile-nav-footer">
            {user ? (
              <>
                <div className="mobile-user-info">
                  <div className="mobile-user-avatar">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} />
                    ) : (
                      <div className="mobile-avatar-placeholder">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="mobile-user-details">
                    <div className="mobile-username">{user.username}</div>
                    <div className="mobile-wallet">
                      {formatWalletAddress(user.wallet_address)}
                    </div>
                  </div>
                </div>
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <div className="mobile-auth-buttons">
                <Link
                  to="/login"
                  className="mobile-auth-btn mobile-login-btn"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="mobile-auth-btn mobile-register-btn"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)} />
      )}
    </header>
  );
};

export default Header;
