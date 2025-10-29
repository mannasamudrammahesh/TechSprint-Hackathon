/**
 * Supabase Service Layer
 * Handles all database operations for user data
 * Works alongside Clerk authentication
 */

import { supabase, isSupabaseConfigured } from './supabase';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface UserProfile {
  id?: string;
  clerk_user_id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id?: string;
  clerk_user_id: string;
  assistant_name: string;
  user_name?: string;
  voice_enabled: boolean;
  voice_language: string;
  selected_voice: string;
  voice_speed: number;
  voice_pitch: number;
  voice_volume: number;
  gesture_enabled: boolean;
  auto_activate: boolean;
  wake_word: string;
  theme: string;
  notifications: boolean;
  sound_effects: boolean;
  privacy_mode: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MoodEntry {
  id?: string;
  clerk_user_id: string;
  mood_score: number;
  mood_label?: string;
  emotions?: Record<string, any>;
  notes?: string;
  activities?: string[];
  triggers?: string[];
  created_at?: string;
}

export interface TherapySession {
  id?: string;
  clerk_user_id: string;
  session_type?: string;
  duration_minutes?: number;
  topics?: string[];
  insights?: Record<string, any>;
  mood_before?: number;
  mood_after?: number;
  notes?: string;
  created_at?: string;
}

export interface JournalEntry {
  id?: string;
  clerk_user_id: string;
  title?: string;
  content: string;
  mood_score?: number;
  tags?: string[];
  is_private: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserGoal {
  id?: string;
  clerk_user_id: string;
  title: string;
  description?: string;
  category?: string;
  target_date?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number;
  milestones?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// USER PROFILE OPERATIONS
// =====================================================

export const createOrUpdateUserProfile = async (profile: UserProfile) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profile, { onConflict: 'clerk_user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error creating/updating user profile:', error);
    return null;
  }

  return data;
};

export const getUserProfile = async (clerkUserId: string) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

// =====================================================
// USER SETTINGS OPERATIONS
// =====================================================

export const saveUserSettings = async (settings: UserSettings) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(settings, { onConflict: 'clerk_user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving user settings:', error);
    return null;
  }

  return data;
};

export const getUserSettings = async (clerkUserId: string) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user settings:', error);
    return null;
  }

  return data;
};

// =====================================================
// MOOD TRACKING OPERATIONS
// =====================================================

export const saveMoodEntry = async (entry: MoodEntry) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('mood_entries')
    .insert(entry)
    .select()
    .single();

  if (error) {
    console.error('Error saving mood entry:', error);
    return null;
  }

  return data;
};

export const getMoodEntries = async (clerkUserId: string, limit = 30) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching mood entries:', error);
    return [];
  }

  return data || [];
};

export const getMoodStats = async (clerkUserId: string, days = 30) => {
  if (!isSupabaseConfigured()) return null;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('mood_entries')
    .select('mood_score, created_at')
    .eq('clerk_user_id', clerkUserId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching mood stats:', error);
    return null;
  }

  return data;
};

// =====================================================
// THERAPY SESSION OPERATIONS
// =====================================================

export const saveTherapySession = async (session: TherapySession) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('therapy_sessions')
    .insert(session)
    .select()
    .single();

  if (error) {
    console.error('Error saving therapy session:', error);
    return null;
  }

  return data;
};

export const getTherapySessions = async (clerkUserId: string, limit = 20) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('therapy_sessions')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching therapy sessions:', error);
    return [];
  }

  return data || [];
};

// =====================================================
// JOURNAL OPERATIONS
// =====================================================

export const saveJournalEntry = async (entry: JournalEntry) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('journal_entries')
    .insert(entry)
    .select()
    .single();

  if (error) {
    console.error('Error saving journal entry:', error);
    return null;
  }

  return data;
};

export const updateJournalEntry = async (id: string, updates: Partial<JournalEntry>) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating journal entry:', error);
    return null;
  }

  return data;
};

export const getJournalEntries = async (clerkUserId: string, limit = 50) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }

  return data || [];
};

export const deleteJournalEntry = async (id: string) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting journal entry:', error);
    return false;
  }

  return true;
};

// =====================================================
// GOALS OPERATIONS
// =====================================================

export const saveUserGoal = async (goal: UserGoal) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('user_goals')
    .insert(goal)
    .select()
    .single();

  if (error) {
    console.error('Error saving user goal:', error);
    return null;
  }

  return data;
};

export const updateUserGoal = async (id: string, updates: Partial<UserGoal>) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('user_goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user goal:', error);
    return null;
  }

  return data;
};

export const getUserGoals = async (clerkUserId: string, status?: string) => {
  if (!isSupabaseConfigured()) return [];

  let query = supabase
    .from('user_goals')
    .select('*')
    .eq('clerk_user_id', clerkUserId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user goals:', error);
    return [];
  }

  return data || [];
};

export const deleteUserGoal = async (id: string) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('user_goals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting user goal:', error);
    return false;
  }

  return true;
};

// =====================================================
// ACTIVITY LOG OPERATIONS
// =====================================================

export const logActivity = async (
  clerkUserId: string,
  activityType: string,
  activityData?: Record<string, any>
) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('activity_log')
    .insert({
      clerk_user_id: clerkUserId,
      activity_type: activityType,
      activity_data: activityData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging activity:', error);
    return null;
  }

  return data;
};

export const getActivityLog = async (clerkUserId: string, limit = 100) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity log:', error);
    return [];
  }

  return data || [];
};

// =====================================================
// INSIGHTS OPERATIONS
// =====================================================

export const saveInsight = async (
  clerkUserId: string,
  insightType: string,
  title: string,
  content: string,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
  metadata?: Record<string, any>
) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('user_insights')
    .insert({
      clerk_user_id: clerkUserId,
      insight_type: insightType,
      title,
      content,
      priority,
      metadata,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving insight:', error);
    return null;
  }

  return data;
};

export const getUserInsights = async (clerkUserId: string, unreadOnly = false) => {
  if (!isSupabaseConfigured()) return [];

  let query = supabase
    .from('user_insights')
    .select('*')
    .eq('clerk_user_id', clerkUserId);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching insights:', error);
    return [];
  }

  return data || [];
};

export const markInsightAsRead = async (id: string) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('user_insights')
    .update({ is_read: true })
    .eq('id', id);

  if (error) {
    console.error('Error marking insight as read:', error);
    return false;
  }

  return true;
};
