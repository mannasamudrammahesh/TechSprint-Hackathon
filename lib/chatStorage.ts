/**
 * Chat Storage Service
 * Supports both LocalStorage and Supabase for persistent chat history
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  userId?: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

class ChatStorageService {
  private supabase: SupabaseClient | null = null;
  private useSupabase: boolean = false;
  private currentSessionId: string = '';

  constructor() {
    // Initialize Supabase if credentials are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.useSupabase = true;
      console.log('✅ Supabase initialized for chat storage');
    } else {
      console.log('📦 Using LocalStorage for chat storage');
    }

    // Generate or retrieve session ID (only in browser)
    if (typeof window !== 'undefined') {
      this.currentSessionId = this.getOrCreateSessionId();
    }
  }

  private getOrCreateSessionId(): string {
    // Only access localStorage in browser
    if (typeof window === 'undefined') {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    let sessionId = localStorage.getItem('healix_chat_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('healix_chat_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Save chat message (works with both LocalStorage and Supabase)
   */
  async saveMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const fullMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...message,
    };

    if (this.useSupabase && this.supabase) {
      try {
        await this.saveToSupabase(fullMessage);
      } catch (error) {
        console.error('Supabase save failed, falling back to LocalStorage:', error);
        this.saveToLocalStorage(fullMessage);
      }
    } else {
      this.saveToLocalStorage(fullMessage);
    }

    return fullMessage;
  }

  /**
   * Get all messages for current session
   */
  async getMessages(userId?: string): Promise<ChatMessage[]> {
    if (this.useSupabase && this.supabase) {
      try {
        return await this.getFromSupabase(userId);
      } catch (error) {
        console.error('Supabase fetch failed, falling back to LocalStorage:', error);
        return this.getFromLocalStorage();
      }
    } else {
      return this.getFromLocalStorage();
    }
  }

  /**
   * Clear all messages
   */
  async clearMessages(userId?: string): Promise<void> {
    if (this.useSupabase && this.supabase) {
      try {
        await this.clearFromSupabase(userId);
      } catch (error) {
        console.error('Supabase clear failed:', error);
      }
    }
    this.clearFromLocalStorage();
  }

  /**
   * Delete specific message
   */
  async deleteMessage(messageId: string, userId?: string): Promise<void> {
    if (this.useSupabase && this.supabase) {
      try {
        await this.deleteFromSupabase(messageId, userId);
      } catch (error) {
        console.error('Supabase delete failed:', error);
      }
    }
    this.deleteFromLocalStorage(messageId);
  }

  /**
   * Export chat history
   */
  async exportChat(format: 'json' | 'txt' = 'json'): Promise<string> {
    const messages = await this.getMessages();
    
    if (format === 'json') {
      return JSON.stringify(messages, null, 2);
    } else {
      return messages
        .map(msg => `[${new Date(msg.timestamp).toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');
    }
  }

  // ==================== LocalStorage Methods ====================

  private saveToLocalStorage(message: ChatMessage): void {
    if (typeof window === 'undefined') return;
    
    const messages = this.getFromLocalStorage();
    messages.push(message);
    localStorage.setItem('healix_chat_history', JSON.stringify(messages));
  }

  private getFromLocalStorage(): ChatMessage[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('healix_chat_history');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse LocalStorage chat history:', error);
      return [];
    }
  }

  private clearFromLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('healix_chat_history');
    // Generate new session ID
    this.currentSessionId = this.getOrCreateSessionId();
  }

  private deleteFromLocalStorage(messageId: string): void {
    if (typeof window === 'undefined') return;
    
    const messages = this.getFromLocalStorage();
    const filtered = messages.filter(msg => msg.id !== messageId);
    localStorage.setItem('healix_chat_history', JSON.stringify(filtered));
  }

  // ==================== Supabase Methods ====================

  private async saveToSupabase(message: ChatMessage): Promise<void> {
    if (!this.supabase) return;

    // Ensure session exists
    await this.ensureSessionExists(message.userId);

    const { error } = await this.supabase
      .from('chat_messages')
      .insert({
        id: message.id,
        session_id: this.currentSessionId,
        clerk_user_id: message.userId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        created_at: new Date(message.timestamp).toISOString(),
      });

    if (error) throw error;
  }

  private async ensureSessionExists(userId?: string): Promise<void> {
    if (!this.supabase) return;

    // Check if session exists
    const { data: existingSession } = await this.supabase
      .from('chat_sessions')
      .select('id')
      .eq('session_id', this.currentSessionId)
      .single();

    if (!existingSession) {
      // Create new session
      await this.supabase
        .from('chat_sessions')
        .insert({
          session_id: this.currentSessionId,
          clerk_user_id: userId,
          title: `Chat ${new Date().toLocaleDateString()}`,
        });
    }
  }

  private async getFromSupabase(userId?: string): Promise<ChatMessage[]> {
    if (!this.supabase) return [];

    let query = this.supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', this.currentSessionId)
      .order('timestamp', { ascending: true });

    if (userId) {
      query = query.eq('clerk_user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      timestamp: row.timestamp,
      userId: row.clerk_user_id,
    }));
  }

  private async clearFromSupabase(userId?: string): Promise<void> {
    if (!this.supabase) return;

    let query = this.supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', this.currentSessionId);

    if (userId) {
      query = query.eq('clerk_user_id', userId);
    }

    const { error } = await query;
    if (error) throw error;

    // Generate new session ID (only in browser)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('healix_chat_session_id');
      this.currentSessionId = this.getOrCreateSessionId();
    }
  }

  private async deleteFromSupabase(messageId: string, userId?: string): Promise<void> {
    if (!this.supabase) return;

    let query = this.supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);

    if (userId) {
      query = query.eq('clerk_user_id', userId);
    }

    const { error } = await query;
    if (error) throw error;
  }

  /**
   * Get chat statistics
   */
  async getStats(userId?: string): Promise<{
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    oldestMessage: number | null;
    newestMessage: number | null;
  }> {
    const messages = await this.getMessages(userId);
    
    return {
      totalMessages: messages.length,
      userMessages: messages.filter(m => m.role === 'user').length,
      assistantMessages: messages.filter(m => m.role === 'assistant').length,
      oldestMessage: messages.length > 0 ? messages[0].timestamp : null,
      newestMessage: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
    };
  }
}

// Singleton instance
export const chatStorage = new ChatStorageService();
