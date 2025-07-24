import { AnswerStatus } from '@prisma/client';

interface Inquiry {
  id: string;
  userId: string;
  productId: string;
  title: string;
  content: string;
  status: AnswerStatus;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default Inquiry;
