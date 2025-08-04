export interface UserInfo {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  membershipTier: string;
  totalSpending: number;
  role: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpdateAddress {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}