import bcrypt from 'bcrypt'
import *as usersRepository from '../repositories/usersRepository' 
import User from '../types/User';  
import BadRequestError from '../lib/errors/BadRequestError';
import { generateToken, verifyAccessToken, verfiyRefreshToken } from '../lib/token';
import NotFoundError from '../lib/errors/NotFoundError';
import UnauthorizedError from '../lib/errors/UnauthorizedError';
import { RegisterUserInput } from '../types/User';  
import { UserType } from '@prisma/client';
import { hashPassword } from '../lib/hash';

async function hashPassword(password:string){
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password,salt);
}


export async function register(data: RegisterUserInput){
  const exisitingUser = await usersRepository.findbyEmail(data.email);
  if(exisitingUser){
    throw new BadRequestError('이미 존재하는 이메일입니다.');
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await usersRepository.createUser({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    type: data.type,
    image: data.image ?? 'https://default.image.png',
    gradeId: 'grade_green',
    points: 0,
    refreshToken: null,
  })

  return user;
}
