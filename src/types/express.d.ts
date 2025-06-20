import { UserType } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        type?: UserType;  
      };
    }
  }
}

export {};