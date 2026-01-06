// frontend/src/services/supabase.js
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
  
  toast.error('Configuration error. Please contact support.');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'sodmax-supabase-auth',
  },
  global: {
    headers: {
      'x-application-name': 'sodmax-cityverse',
      'x-client-info': 'web-app/1.0',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Test connection on startup
(async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.warn('⚠️ Supabase connection warning:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
  }
})();

// Auth service
export const authService = {
  // Sign up with email/password
  signUp: async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Sign in with email/password
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Sign in with OTP (Magic Link)
  signInWithOtp: async (email) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Sign in with OTP error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get current session
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { success: true, session: data.session };
    } catch (error) {
      console.error('Get session error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get current user
  getUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Get user error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Update user profile
  updateProfile: async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Reset password
  resetPassword: async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Update password
  updatePassword: async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, error: error.message };
    }
  },
};

// Database service
export const dbService = {
  // Fetch data with filters
  fetch: async (table, options = {}) => {
    try {
      let query = supabase.from(table).select(options.select || '*');
      
      // Apply filters
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (value === null || value === undefined) {
            query = query.is(key, value);
          } else {
            query = query.eq(key, value);
          }
        });
      }
      
      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending !== false,
        });
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error(`Fetch ${table} error:`, error);
      return { success: false, error: error.message };
    }
  },
  
  // Insert data
  insert: async (table, data) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error(`Insert ${table} error:`, error);
      return { success: false, error: error.message };
    }
  },
  
  // Update data
  update: async (table, id, updates) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error(`Update ${table} error:`, error);
      return { success: false, error: error.message };
    }
  },
  
  // Delete data
  delete: async (table, id) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error(`Delete ${table} error:`, error);
      return { success: false, error: error.message };
    }
  },
  
  // Subscribe to realtime changes
  subscribe: (table, event, callback) => {
    const subscription = supabase
      .channel('table-changes')
      .on(
        'postgres_changes',
        {
          event: event, // INSERT, UPDATE, DELETE
          schema: 'public',
          table: table,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();
    
    return subscription;
  },
  
  // Unsubscribe from realtime changes
  unsubscribe: (subscription) => {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  },
};

// Storage service
export const storageService = {
  // Upload file
  upload: async (bucket, path, file, options = {}) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: options.upsert || false,
          ...options,
        });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get file URL
  getUrl: (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
  
  // Download file
  download: async (bucket, path) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Download error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // List files
  list: async (bucket, path = '', options = {}) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, options);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('List files error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Delete file
  delete: async (bucket, paths) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(paths);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Delete files error:', error);
      return { success: false, error: error.message };
    }
  },
};

// Realtime service
export const realtimeService = {
  // Subscribe to channel
  subscribe: (channel, event, callback) => {
    const subscription = supabase
      .channel(channel)
      .on('broadcast', { event }, (payload) => {
        callback(payload);
      })
      .subscribe();
    
    return subscription;
  },
  
  // Broadcast message
  broadcast: async (channel, event, payload) => {
    try {
      const { error } = await supabase.channel(channel).send({
        type: 'broadcast',
        event,
        payload,
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Broadcast error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Subscribe to presence
  subscribeToPresence: (channel, callback) => {
    const subscription = supabase
      .channel(channel)
      .on('presence', { event: 'sync' }, () => {
        const state = subscription.presenceState();
        callback(state);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await subscription.track({
            user_id: supabase.auth.getUser()?.id,
            online_at: new Date().toISOString(),
          });
        }
      });
    
    return subscription;
  },
};

// Export default client and all services
export default supabase;
export {
  authService,
  dbService,
  storageService,
  realtimeService,
};
