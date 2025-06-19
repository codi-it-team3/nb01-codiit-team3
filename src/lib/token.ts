import jwt from "jsonwebtoken";
import { JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET } from "./constants";

export function generateToken(userId : string){
  const accessToken = jwt.sign({id:userId},JWT_ACCESS_TOKEN_SECRET,{expiresIn : '1h'});
  const refreshToken = jwt.sign({id : userId},JWT_REFRESH_TOKEN_SECRET,{expiresIn :  '3d'});
  return {accessToken,refreshToken};
}

export function verifyAccessToken(token : string){
  const decodeing = jwt.verify(token,JWT_ACCESS_TOKEN_SECRET);
  if(typeof decodeing === 'string'){
    throw new Error('Invalid token');
  }
  return {userId : decodeing.id};
}

export function verfiyRefreshToken(token : string){
  const decodeing = jwt.verify(token,JWT_REFRESH_TOKEN_SECRET);
  if(typeof decodeing === 'string'){
    throw new Error('Invalid token');
  }
  return {userId : decodeing.id}
}