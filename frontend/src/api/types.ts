export interface Shadow {
  id: string;
  creator_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  duration_seconds: number;
  raw_video_url: string | null;
  thumbnail_url: string | null;
  status: ShadowStatus;
  user_notes: string | null;
  tags: string[];
  transcript: string | null;
  executive_summary: string | null;
  key_takeaways: string[] | null;
  quality_score: number;
  view_count: number;
  average_completion_rate: number;
}

export type ShadowStatus =
  | 'capturing'
  | 'processing'
  | 'ready_for_review'
  | 'published'
  | 'failed'
  | 'archived';

export interface Chapter {
  id: string;
  shadow_id: string;
  title: string;
  start_timestamp_seconds: number;
  end_timestamp_seconds: number;
  order_index: number;
  summary: string | null;
  user_notes: string | null;
}

export interface DecisionPoint {
  id: string;
  shadow_id: string;
  timestamp_seconds: number;
  decision_description: string;
  reasoning: string;
  alternatives_considered: string[];
  context_before: string | null;
  context_after: string | null;
  confidence_score: number;
  user_verified: boolean;
}

export interface CreateShadowRequest {
  title: string;
  user_notes?: string;
  tags?: string[];
}

export interface UpdateShadowRequest {
  title?: string;
  user_notes?: string;
  tags?: string[];
  status?: ShadowStatus;
}

// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  shadows_created_count: number;
  total_impact_score: number;
  current_streak_days: number;
  badges: string[];
  auto_shadow_enabled: boolean;
  default_privacy_level: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string;  // OAuth2 uses 'username' for email
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}
