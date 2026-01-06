// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import supabase from '../services/supabase';

// Web3 imports
import Web3 from 'web3';
import { ethers } from 'ethers';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [web3, setWeb3] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  // Initialize Web3
  const initWeb3 = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Initialize Web3
        const web3Instance = new Web3(window.ethereum);
        const providerInstance = new ethers.BrowserProvider(window.ethereum);
        
        setWeb3(web3Instance);
        setProvider(providerInstance);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            // User disconnected wallet
            logout();
          } else {
            // Account changed, reload user
            checkAuth();
          }
        });
        
        // Listen for chain changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
        
        return { web3: web3Instance, provider: providerInstance };
      } catch (error) {
        console.error('Error initializing Web3:', error);
        toast.error('Failed to connect wallet');
        return null;
      }
    } else {
      toast.error('Please install MetaMask!');
      return null;
    }
  };

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }
      
      // Verify token with backend
      const response = await api.get('/auth/verify');
      
      if (response.data.success) {
        setUser(response.data.user);
        
        // Initialize Web3 if wallet is connected
        if (window.ethereum && window.ethereum.selectedAddress) {
          await initWeb3();
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      
      if (!window.ethereum) {
        toast.error('Please install MetaMask to connect your wallet');
        setIsConnecting(false);
        return null;
      }
      
      const web3Data = await initWeb3();
      if (!web3Data) {
        setIsConnecting(false);
        return null;
      }
      
      const accounts = await web3Data.web3.eth.getAccounts();
      const walletAddress = accounts[0];
      
      if (!walletAddress) {
        toast.error('No wallet address found');
        setIsConnecting(false);
        return null;
      }
      
      return walletAddress;
    } catch (error) {
      console.error('Connect wallet error:', error);
      toast.error('Failed to connect wallet');
      setIsConnecting(false);
      return null;
    }
  };

  // Login with wallet
  const login = async (walletAddress, signature) => {
    try {
      setLoading(true);
      
      const response = await api.post('/auth/login', {
        wallet_address: walletAddress,
        signature: signature,
      });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store token
        localStorage.setItem('token', token);
        
        // Set user
        setUser(user);
        
        // Initialize Web3
        await initWeb3();
        
        toast.success('Login successful!');
        navigate(user.role === 'business' ? '/business-dashboard' : '/dashboard');
        
        return { success: true, user };
      } else {
        toast.error(response.data.error || 'Login failed');
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Login failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      setIsConnecting(false);
    }
  };

  // Register new user
  const register = async (userData, signature) => {
    try {
      setLoading(true);
      
      const response = await api.post('/auth/register', {
        ...userData,
        signature: signature,
      });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store token
        localStorage.setItem('token', token);
        
        // Set user
        setUser(user);
        
        // Initialize Web3
        await initWeb3();
        
        toast.success('Registration successful!');
        navigate(user.role === 'business' ? '/business-dashboard' : '/dashboard');
        
        return { success: true, user };
      } else {
        toast.error(response.data.error || 'Registration failed');
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'Registration failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      setIsConnecting(false);
    }
  };

  // Register business
  const registerBusiness = async (businessData, signature) => {
    try {
      setLoading(true);
      
      const response = await api.post('/auth/register-business', {
        ...businessData,
        signature: signature,
      });
      
      if (response.data.success) {
        const { token, user, business } = response.data;
        
        // Store token
        localStorage.setItem('token', token);
        
        // Set user with business info
        setUser({ ...user, business });
        
        // Initialize Web3
        await initWeb3();
        
        toast.success('Business registration successful!');
        navigate('/business-dashboard');
        
        return { success: true, user: { ...user, business } };
      } else {
        toast.error(response.data.error || 'Business registration failed');
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Business registration error:', error);
      toast.error(error.response?.data?.error || 'Business registration failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      setIsConnecting(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setWeb3(null);
    setProvider(null);
    
    // Disconnect from Supabase if needed
    supabase.auth.signOut();
    
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const response = await api.put('/users/profile', updates);
      
      if (response.data.success) {
        setUser(response.data.data);
        toast.success('Profile updated successfully');
        return { success: true, user: response.data.data };
      } else {
        toast.error(response.data.error || 'Failed to update profile');
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  // Get message for signing
  const getMessageForSigning = async (walletAddress) => {
    try {
      const response = await api.get(`/auth/message/${walletAddress}`);
      
      if (response.data.success) {
        return response.data.message;
      } else {
        throw new Error(response.data.error || 'Failed to get message');
      }
    } catch (error) {
      console.error('Get message error:', error);
      throw error;
    }
  };

  // Sign message with wallet
  const signMessage = async (message, walletAddress) => {
    try {
      if (!web3) {
        await initWeb3();
      }
      
      const signature = await web3.eth.personal.sign(message, walletAddress, '');
      return signature;
    } catch (error) {
      console.error('Sign message error:', error);
      throw error;
    }
  };

  // Complete login/register flow
  const handleWalletAuth = async (userData = null, isBusiness = false) => {
    try {
      setIsConnecting(true);
      
      // Connect wallet
      const walletAddress = await connectWallet();
      if (!walletAddress) {
        setIsConnecting(false);
        return { success: false, error: 'Wallet connection failed' };
      }
      
      // Get message for signing
      const message = await getMessageForSigning(walletAddress);
      
      // Sign message
      const signature = await signMessage(message, walletAddress);
      
      // Login or register
      if (userData) {
        if (isBusiness) {
          return await registerBusiness({ ...userData, wallet_address: walletAddress }, signature);
        } else {
          return await register({ ...userData, wallet_address: walletAddress }, signature);
        }
      } else {
        return await login(walletAddress, signature);
      }
    } catch (error) {
      console.error('Wallet auth error:', error);
      toast.error(error.message || 'Authentication failed');
      setIsConnecting(false);
      return { success: false, error: error.message };
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
    
    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  // Context value
  const value = {
    user,
    loading,
    web3,
    provider,
    isConnecting,
    connectWallet,
    login,
    register,
    registerBusiness,
    logout,
    updateProfile,
    handleWalletAuth,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
