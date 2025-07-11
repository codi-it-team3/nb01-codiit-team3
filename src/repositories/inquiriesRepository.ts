import { Inquiry } from '@prisma/client';
import { prismaClient } from '../lib/prismaClient';
import { MyInquiryPaginationParams, PageSizePaginationParams } from '../types/pagination';

export async function createInquiry(
  data: Omit<Inquiry, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
) {
  const createdInquiry = await prismaClient.inquiry.create({
    data,
  });
  return createdInquiry;
}

export async function getInquiryListByProductId(productId: string) {
  const inquiries = await prismaClient.inquiry.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      reply: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  return inquiries;
}

export async function getMyInquiryList(
  userId: string,
  { page, pageSize, status }: MyInquiryPaginationParams,
) {
  const myInquiries = await prismaClient.inquiry.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where: { userId, ...(status && { status }) },
    select: {
      id: true,
      title: true,
      isSecret: true,
      status: true,
      createdAt: true,
      content: true,
      user: {
        select: {
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          image: true,
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const totalCount = await prismaClient.inquiry.count({
    where: {
      userId,
      ...(status && { status }),
    },
  });
  return { list: myInquiries, totalCount };
}

export async function getInquiryById(id: string) {
  const inquiry = await prismaClient.inquiry.findUnique({
    where: { id },
  });
  return inquiry;
}

export async function getInquiryWithReply(id: string) {
  const inquiry = await prismaClient.inquiry.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      reply: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  return inquiry;
}

export async function updateInquiry(id: string, data: Partial<Inquiry>) {
  const updatedInquiry = await prismaClient.inquiry.update({
    where: { id },
    data,
  });
  return updatedInquiry;
}

export async function deleteInquiry(id: string) {
  await prismaClient.inquiry.delete({
    where: { id },
  });
}
