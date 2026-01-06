// backend/src/models/Transaction.js
const supabase = require('../config/supabase').supabase;

class Transaction {
  // Create a new transaction
  static async create({
    from_wallet,
    to_wallet,
    amount,
    currency = 'SOD',
    type,
    description = '',
    status = 'completed',
    metadata = {}
  }) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            from_wallet,
            to_wallet,
            amount,
            currency,
            type,
            description,
            status,
            metadata,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Transaction creation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get transactions by wallet address
  static async getByWallet(wallet_address, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`from_wallet.eq.${wallet_address},to_wallet.eq.${wallet_address}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get transactions error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get transactions by type
  static async getByType(wallet_address, type, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', type)
        .or(`from_wallet.eq.${wallet_address},to_wallet.eq.${wallet_address}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get transactions by type error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get wallet balance
  static async getBalance(wallet_address) {
    try {
      // Get total received
      const { data: receivedData, error: receivedError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('to_wallet', wallet_address)
        .eq('status', 'completed');

      if (receivedError) throw receivedError;

      // Get total sent
      const { data: sentData, error: sentError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('from_wallet', wallet_address)
        .eq('status', 'completed');

      if (sentError) throw sentError;

      const totalReceived = receivedData.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      const totalSent = sentData.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      const balance = totalReceived - totalSent;

      return { 
        success: true, 
        data: {
          balance: balance.toFixed(2),
          total_received: totalReceived.toFixed(2),
          total_sent: totalSent.toFixed(2),
          transaction_count: receivedData.length + sentData.length
        }
      };
    } catch (error) {
      console.error('Get balance error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get recent transactions
  static async getRecent(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          from_user:users!from_wallet(username, avatar_url),
          to_user:users!to_wallet(username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get recent transactions error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update transaction status
  static async updateStatus(transaction_id, status, metadata = {}) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ 
          status, 
          metadata: { ...metadata, updated_at: new Date().toISOString() },
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction_id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update transaction status error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get transaction statistics
  static async getStatistics(wallet_address, period = 'day') {
    try {
      let dateFilter = new Date();
      
      switch (period) {
        case 'day':
          dateFilter.setDate(dateFilter.getDate() - 1);
          break;
        case 'week':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case 'month':
          dateFilter.setMonth(dateFilter.getMonth() - 1);
          break;
        case 'year':
          dateFilter.setFullYear(dateFilter.getFullYear() - 1);
          break;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`from_wallet.eq.${wallet_address},to_wallet.eq.${wallet_address}`)
        .gte('created_at', dateFilter.toISOString());

      if (error) throw error;

      const stats = {
        total_count: data.length,
        total_amount: data.reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
        incoming_count: data.filter(tx => tx.to_wallet === wallet_address).length,
        outgoing_count: data.filter(tx => tx.from_wallet === wallet_address).length,
        incoming_amount: data
          .filter(tx => tx.to_wallet === wallet_address)
          .reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
        outgoing_amount: data
          .filter(tx => tx.from_wallet === wallet_address)
          .reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
        period: period
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Get transaction statistics error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = Transaction;
