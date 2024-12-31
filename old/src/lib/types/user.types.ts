export interface User {
  id: string;
  user_name: string;
  first_name?: string;
  last_name?: string;
  templates: string[];
  last_login: string;
  created_at: string;
  updated_at: string;
  logged_in: boolean;
}
