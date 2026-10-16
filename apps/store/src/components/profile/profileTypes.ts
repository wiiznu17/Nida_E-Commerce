export type ProfileTab = 'profile' | 'orders' | 'addresses';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}
