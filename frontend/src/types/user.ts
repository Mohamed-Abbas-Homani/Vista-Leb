export interface Category {
  id: string;
  name: string;
  key: string;
}

export interface Business {
  branch_name?: string | null;
  hot_line?: string | null;
  targeted_gender?: string | null;
  cover_photo?: string | null;
  start_hour?: string | null;
  close_hour?: string | null;
  opening_days?: string | null;
  photos?: string | null;
}

export interface Customer {
  age?: number | null;
  marital_status?: string | null;
  price_range?: string | null;
  gender?: string | null;
}

export interface User {
  id: string;
  email: string;
  username: string;
  phone_number: string;
  address: string;
  profile_photo: string | null;
  categories: Category[];
  business?: Business | null;
  customer?: Customer | null;
}
