// MVP 用の手書き型。将来は `supabase gen types typescript` で自動生成に置き換える。

export type Video = {
  id: string;
  user_id: string;
  video_id: string;
  title: string;
  thumbnail_url: string | null;
  channel_name: string | null;
  duration_sec: number | null;
  tags: string[] | null;
  added_at: string;
};

export type WorkoutLog = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  video_id: string;
  completed_at: string;
  xp_earned: number;
};

export type Streak = {
  user_id: string;
  current: number;
  longest: number;
  last_completed_date: string | null;
  freeze_count: number;
};

export type Database = {
  public: {
    Tables: {
      videos: {
        Row: Video;
        Insert: Omit<Video, 'id' | 'added_at'> & { id?: string; added_at?: string };
        Update: Partial<Video>;
      };
      workout_logs: {
        Row: WorkoutLog;
        Insert: Omit<WorkoutLog, 'id' | 'completed_at'> & {
          id?: string;
          completed_at?: string;
        };
        Update: Partial<WorkoutLog>;
      };
      streaks: {
        Row: Streak;
        Insert: Streak;
        Update: Partial<Streak>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
