import {Request, Response } from 'express';
import { create } from 'superstruct';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME, NODE_ENV } from '../lib/constants';
import { LoginBodyStruct, RegisterBodyStruct } from '../structs/authStruct';
import * as authService from '../services/userService';
import userResponseDTO from '../dto/userResponseDTO';
import { UserType } from '@prisma/client';

export async function register(req: Request, res: Response) {
  const data = create(req.body, RegisterBodyStruct);
const user = await authService.register({
    ...data,
    type: UserType[data.type as keyof typeof UserType], 
  });
  res.status(201).json(userResponseDTO(user));
}