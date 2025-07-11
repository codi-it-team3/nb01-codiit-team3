interface Reply {
  id: string;
  inquiryId: string;
  userId: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export default Reply;
