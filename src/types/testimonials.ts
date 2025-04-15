
export interface Testimonial {
  id: string;
  name: string;
  title: string; 
  quote: string;
  rating: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  profile_image?: string | null;
  course_id?: string | null;
}

export interface TestimonialFormData {
  name: string;
  title: string;
  quote: string;
  rating: number;
  is_published: boolean;
  profile_image?: string | null;
  course_id?: string | null;
}
