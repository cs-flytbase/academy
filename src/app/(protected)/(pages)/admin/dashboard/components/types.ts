// Define interfaces for our database schema
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  thumbnail?: string;
  created_at?: string;
  playlist_id?: string;
  video_count?: number;
}

export interface Video {
  id: string;
  title: string;
  youtube_video_id: string;
  course_id: string;
  about?: string;
  thumbnail?: string;
  created_at?: string;
}

export interface Question {
  id: number;
  question_text: string;
  description?: string | null;
  question_type: string;
  video_id?: number | null;
  assessment_id?: number | null;
  difficulty?: string | null;
  after_videoend?: boolean | null;
  is_assessment?: boolean | null;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
}

export interface QuestionForm {
  id?: number;
  question_text: string;
  description?: string | null;
  question_type: string;
  difficulty?: string | null;
  video_id?: number | null;
  assessment_id?: number | null;
  after_videoend?: boolean | null;
  is_assessment?: boolean | null;
  options: {
    id?: number;
    option_text: string;
    is_correct: boolean;
  }[];
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  time_limit: number;
  difficulty?: string;
  category?: string;
  course_id?: string;
  created_at: string;
  passing_percentage?: number;
  number_of_questions?: number;
  courses?: string[];
  prompt?: string;
}

export interface AssessmentForm {
  id?: string;
  name: string;
  description: string;
  time: number;
  number_of_questions: number;
  courses: string[];
  prompt: string;
  passing_percentage?: number;
}
