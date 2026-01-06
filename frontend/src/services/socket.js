// frontend/src/services/socket.js
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
    this.queue = [];
  }

  // Initialize socket connection
  initialize(token = null) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    // Socket.io connection options
    const options = {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: true,
      forceNew: true,
      query: token ? { token } : {},
    };

    // Create socket connection
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    this.socket = io(socketUrl, options);

    // Setup event listeners
    this.setupEventListeners();
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection established
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Emit connection event
      this.emitToListeners('connect', { socketId: this.socket.id });
      
      // Process queued messages
      this.processQueue();
      
      toast.success('Connected to realtime service');
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.isConnected = false;
      
      // Emit error event
      this.emitToListeners('connect_error', error);
      
      // Attempt reconnection
      this.handleReconnection();
    });

    // Disconnected
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnected = false;
      
      // Emit disconnect event
      this.emitToListeners('disconnect', { reason });
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket.connect();
      }
    });

    // Reconnecting
    this.socket.on('reconnecting', (attempt) => {
      console.log(`🔄 Reconnecting (attempt ${attempt})`);
      this.reconnectAttempts = attempt;
      
      // Emit reconnecting event
      this.emitToListeners('reconnecting', { attempt });
    });

    // Reconnected
    this.socket.on('reconnect', (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempts`);
      this.isConnected = true;
      
      // Emit reconnect event
      this.emitToListeners('reconnect', { attempt });
      
      toast.success('Reconnected to realtime service');
    });

    // Reconnect failed
    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
      
      // Emit reconnect failed event
      this.emitToListeners('reconnect_failed', {});
      
      toast.error('Lost connection to realtime service');
    });

    // Default error handler
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emitToListeners('error', error);
    });
  }

  // Handle reconnection
  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        if (this.socket && !this.isConnected) {
          console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
          this.socket.connect();
        }
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
      
      this.reconnectAttempts++;
    }
  }

  // Process queued messages
  processQueue() {
    while (this.queue.length > 0) {
      const { event, data, callback } = this.queue.shift();
      this.emit(event, data, callback);
    }
  }

  // Emit to registered listeners
  emitToListeners(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  // Public methods

  // Connect socket
  connect(token = null) {
    this.initialize(token);
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected manually');
    }
  }

  // Emit event
  emit(event, data = {}, callback = null) {
    if (!this.isConnected || !this.socket) {
      console.warn(`Socket not connected. Queueing event: ${event}`);
      this.queue.push({ event, data, callback });
      return false;
    }

    try {
      if (callback) {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, data);
      }
      return true;
    } catch (error) {
      console.error(`Error emitting ${event}:`, error);
      return false;
    }
  }

  // Listen to event
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
      
      // Setup socket.io listener for this event
      if (this.socket) {
        this.socket.on(event, (data) => {
          this.emitToListeners(event, data);
        });
      }
    }
    
    this.eventListeners.get(event).push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  // Remove event listener
  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      
      if (listeners.length === 0) {
        this.eventListeners.delete(event);
        
        // Remove socket.io listener
        if (this.socket) {
          this.socket.off(event);
        }
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    this.eventListeners.delete(event);
    
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Join room
  joinRoom(room, data = {}) {
    return this.emit('join-room', { room, data });
  }

  // Leave room
  leaveRoom(room) {
    return this.emit('leave-room', { room });
  }

  // Send private message
  sendPrivateMessage(toUserId, message) {
    return this.emit('private-message', { to: toUserId, message });
  }

  // Request current online users
  requestOnlineUsers(room = null) {
    return new Promise((resolve) => {
      this.emit('get-online-users', { room }, (users) => {
        resolve(users);
      });
    });
  }

  // Typing indicator
  sendTypingIndicator(room, isTyping) {
    return this.emit('typing', { room, isTyping });
  }

  // Mission events
  missionStarted(missionId) {
    return this.emit('mission-started', { missionId });
  }

  missionCompleted(missionId, reward) {
    return this.emit('mission-completed', { missionId, reward });
  }

  missionProgress(missionId, progress) {
    return this.emit('mission-progress', { missionId, progress });
  }

  // Transaction events
  transactionCreated(transaction) {
    return this.emit('transaction-created', transaction);
  }

  // Campaign events
  campaignCreated(campaign) {
    return this.emit('campaign-created', campaign);
  }

  campaignUpdated(campaign) {
    return this.emit('campaign-updated', campaign);
  }

  // User events
  userOnline(user) {
    return this.emit('user-online', user);
  }

  userOffline(user) {
    return this.emit('user-offline', user);
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id || null;
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.getSocketId(),
      reconnectAttempts: this.reconnectAttempts,
      queueLength: this.queue.length,
    };
  }

  // Clear all listeners and disconnect
  destroy() {
    this.eventListeners.clear();
    this.queue = [];
    this.disconnect();
    console.log('Socket service destroyed');
  }
}

// Create singleton instance
const socketService = new SocketService();

// Export singleton and class
export default socketService;
export { SocketService };
