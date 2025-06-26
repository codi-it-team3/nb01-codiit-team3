import { UserType } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  image: string | null;
  refreshToken: string | null;
  type: 'BUYER' | 'SELLER';
  points: number;
  gradeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RegisterUserInput = {
  email: string;
  password: string;
  name: string;
  image?: string | null;
  type: UserType;
};

export default User;
