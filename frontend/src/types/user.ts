export interface User {
  id: string;
  email: string;
  username: string;
  phone_number: string;
  address: string;
  categories: string[];
  profile_photo: string | null;
}
