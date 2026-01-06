// frontend/src/contexts/MissionContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from './AuthContext';

const MissionContext = createContext({});

export const useMission = () => useContext(MissionContext);

export const MissionProvider = ({ children }) => {
  const [missions, setMissions] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [activeMissions, setActiveMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [availableMissions, setAvailableMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    available: 0,
    totalRewards: 0,
  });
  
  const { user } = useAuth();

  // Load all missions
  const loadMissions = async () => {
    try {
      setLoading(true);
      
      // Load available missions
      const missionsResponse = await api.get('/missions/available');
      if (missionsResponse.data.success) {
        setAvailableMissions(missionsResponse.data.missions || []);
      }

      // Load user's active missions if logged in
      if (user) {
        const activeResponse = await api.get('/missions/active');
        if (activeResponse.data.success) {
          setActiveMissions(activeResponse.data.missions || []);
        }

        // Load completed missions
        const completedResponse = await api.get('/missions/completed');
        if (completedResponse.data.success) {
          setCompletedMissions(completedResponse.data.missions || []);
        }

        // Load mission stats
        const statsResponse = await api.get('/missions/stats');
        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        }
      }

      // Combine all missions
      const allMissions = [
        ...(missionsResponse.data.missions || []),
        ...(activeResponse?.data?.missions || []),
      ];
      setMissions(allMissions);
    } catch (error) {
      console.error('Load missions error:', error);
      toast.error('Failed to load missions');
    } finally {
      setLoading(false);
    }
  };

  // Load campaigns
  const loadCampaigns = async () => {
    try {
      const response = await api.get('/missions/campaigns');
      if (response.data.success) {
        setCampaigns(response.data.campaigns || []);
      }
    } catch (error) {
      console.error('Load campaigns error:', error);
    }
  };

  // Start a mission
  const startMission = async (missionId) => {
    try {
      const response = await api.post(`/missions/${missionId}/start`);
      
      if (response.data.success) {
        toast.success('Mission started!');
        
        // Reload missions
        await loadMissions();
        
        return { success: true, mission: response.data.mission };
      } else {
        toast.error(response.data.error || 'Failed to start mission');
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Start mission error:', error);
      toast.error(error.response?.data?.error || 'Failed to start mission');
      return { success: false, error: error.message };
    }
  };

  // Complete a mission
  const completeMission = async (missionId, proof = null) => {
    try {
      const data = proof ? { proof } : {};
      const response = await api.post(`/missions/${missionId}/complete`, data);
      
      if (response.data.success) {
        toast.success('Mission completed! Reward earned!');
        
        // Reload missions
        await loadMissions();
        
        return { success: true, reward: response.data.reward };
      } else {
        toast.error(response.data.error || 'Failed to complete mission');
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Complete mission error:', error);
      toast.error(error.response?.data?.error || 'Failed to complete mission');
      return { success: false, error: error.message };
    }
  };

  // Submit mission proof
  const submitProof = async (missionId, proofData) => {
    try {
      const response = await api.post(`/missions/${missionId}/proof`, proofData);
      
      if (response.data.success) {
        toast.success('Proof submitted successfully!');
        return { success: true };
      } else {
        toast.error(response.data.error || 'Failed to submit proof');
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Submit proof error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit proof');
      return { success: false, error: error.message };
    }
  };

  // Get mission details
  const getMissionDetails = async (missionId) => {
    try {
      const response = await api.get(`/missions/${missionId}`);
      
      if (response.data.success) {
        setSelectedMission(response.data.mission);
        return { success: true, mission: response.data.mission };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Get mission details error:', error);
      return { success: false, error: error.message };
    }
  };

  // Get campaign details
  const getCampaignDetails = async (campaignId) => {
    try {
      const response = await api.get(`/missions/campaigns/${campaignId}`);
      
      if (response.data.success) {
        setSelectedCampaign(response.data.campaign);
        return { success: true, campaign: response.data.campaign };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Get campaign details error:', error);
      return { success: false, error: error.message };
    }
  };

  // Create a new campaign (for businesses)
  const createCampaign = async (campaignData) => {
    try {
      const response = await api.post('/missions/campaigns', campaignData);
      
      if (response.data.success) {
        toast.success('Campaign created successfully!');
        
        // Reload campaigns
        await loadCampaigns();
        
        return { success: true, campaign: response.data.campaign };
      } else {
        toast.error(response.data.error || 'Failed to create campaign');
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Create campaign error:', error);
      toast.error(error.response?.data?.error || 'Failed to create campaign');
      return { success: false, error: error.message };
    }
  };

  // Add mission to campaign
  const addMissionToCampaign = async (campaignId, missionData) => {
    try {
      const response = await api.post(`/missions/campaigns/${campaignId}/missions`, missionData);
      
      if (response.data.success) {
        toast.success('Mission added to campaign!');
        return { success: true, mission: response.data.mission };
      } else {
        toast.error(response.data.error || 'Failed to add mission');
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Add mission error:', error);
      toast.error(error.response?.data?.error || 'Failed to add mission');
      return { success: false, error: error.message };
    }
  };

  // Get user progress for a mission
  const getMissionProgress = async (missionId) => {
    try {
      const response = await api.get(`/missions/${missionId}/progress`);
      
      if (response.data.success) {
        return { success: true, progress: response.data.progress };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Get mission progress error:', error);
      return { success: false, error: error.message };
    }
  };

  // Filter missions
  const filterMissions = (filters) => {
    let filtered = [...missions];
    
    if (filters.category) {
      filtered = filtered.filter(mission => 
        mission.category === filters.category
      );
    }
    
    if (filters.difficulty) {
      filtered = filtered.filter(mission => 
        mission.difficulty === filters.difficulty
      );
    }
    
    if (filters.rewardMin) {
      filtered = filtered.filter(mission => 
        mission.reward >= parseFloat(filters.rewardMin)
      );
    }
    
    if (filters.rewardMax) {
      filtered = filtered.filter(mission => 
        mission.reward <= parseFloat(filters.rewardMax)
      );
    }
    
    if (filters.status) {
      if (filters.status === 'available') {
        filtered = filtered.filter(mission => 
          !activeMissions.some(active => active.mission_id === mission.id) &&
          !completedMissions.some(completed => completed.mission_id === mission.id)
        );
      } else if (filters.status === 'active') {
        filtered = filtered.filter(mission =>
          activeMissions.some(active => active.mission_id === mission.id)
        );
      } else if (filters.status === 'completed') {
        filtered = filtered.filter(mission =>
          completedMissions.some(completed => completed.mission_id === mission.id)
        );
      }
    }
    
    return filtered;
  };

  // Search missions
  const searchMissions = (query) => {
    if (!query.trim()) return missions;
    
    const searchLower = query.toLowerCase();
    return missions.filter(mission =>
      mission.title.toLowerCase().includes(searchLower) ||
      mission.description.toLowerCase().includes(searchLower) ||
      mission.category.toLowerCase().includes(searchLower)
    );
  };

  // Get leaderboard for a mission
  const getMissionLeaderboard = async (missionId) => {
    try {
      const response = await api.get(`/missions/${missionId}/leaderboard`);
      
      if (response.data.success) {
        return { success: true, leaderboard: response.data.leaderboard };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Get mission leaderboard error:', error);
      return { success: false, error: error.message };
    }
  };

  // Clear selected mission
  const clearSelectedMission = () => {
    setSelectedMission(null);
  };

  // Clear selected campaign
  const clearSelectedCampaign = () => {
    setSelectedCampaign(null);
  };

  // Load data on mount and when user changes
  useEffect(() => {
    loadMissions();
    loadCampaigns();
  }, [user]);

  // Context value
  const value = {
    missions,
    campaigns,
    activeMissions,
    completedMissions,
    availableMissions,
    selectedMission,
    selectedCampaign,
    loading,
    stats,
    loadMissions,
    loadCampaigns,
    startMission,
    completeMission,
    submitProof,
    getMissionDetails,
    getCampaignDetails,
    createCampaign,
    addMissionToCampaign,
    getMissionProgress,
    filterMissions,
    searchMissions,
    getMissionLeaderboard,
    clearSelectedMission,
    clearSelectedCampaign,
  };

  return (
    <MissionContext.Provider value={value}>
      {children}
    </MissionContext.Provider>
  );
};

export default MissionContext;
