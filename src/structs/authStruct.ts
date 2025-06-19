import { nonempty, nullable, enums, object, string } from 'superstruct';

export const RegisterBodyStruct = object({
  email: nonempty(string()),
  name: nonempty(string()),
  password: nonempty(string()),
  image: nullable(string()),
  type: enums(['BUYER', 'SELLER']), 
});

export const LoginBodyStruct = object({
  email: nonempty(string()),
  password: nonempty(string()),
});

