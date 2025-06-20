import bcrypt, { hash } from 'bcrypt'
import *as usersRepository from '../repositories/usersRepository' 
import User from '../types/User';  
import BadRequestError from '../lib/errors/BadRequestError';
import { generateToken, verifyAccessToken, verfiyRefreshToken } from '../lib/token';
import NotFoundError from '../lib/errors/NotFoundError';
import UnauthorizedError from '../lib/errors/UnauthorizedError';
import { RegisterUserInput } from '../types/User';   
import { hashPassword ,verifyPassword } from '../lib/hash';   



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

export async function  getMyInfo(userId:string) {
  const user = await usersRepository.getUser(userId);
  if(!user) throw new NotFoundError('user',userId);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    type: user.type,
    points: user.points,
    image: user.image,
    grade: user.grade,
  };
}

export async function updateMyInfo(userId:string,data : {name? : string; password?: string; image? : string; currentPassword:string}):Promise<User> {
  const user = await usersRepository.getUser(userId);
  if (!user) throw new NotFoundError('user', userId); 

  const isPasswordValid = await verifyPassword(data.currentPassword, user.password);
  if (!isPasswordValid) throw new UnauthorizedError('비밀번호가 일치하지 않습니다');

  const updateData: Partial<User> = {
    name: data.name,
    image: data.image,
  }; 

  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  const updatedUser = await usersRepository.updateUser(userId, updateData);
  return await usersRepository.getUser(userId);
}

export async function deleteMyAccount(userId: string, currentPassword: string) {
  const user = await usersRepository.getUser(userId);
  if (!user) throw new NotFoundError('유저가 없습니다', userId);

  const isPasswordValid = await verifyPassword(currentPassword, user.password);
  if (!isPasswordValid) throw new UnauthorizedError('비밀번호가 일치하지 않습니다');

  await usersRepository.deleteUser(userId);
}