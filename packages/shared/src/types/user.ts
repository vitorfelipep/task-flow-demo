export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  user: Omit<User, 'createdAt' | 'updatedAt'>;
  accessToken: string;
  expiresAt: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupData extends AuthCredentials {
  name: string;
}
