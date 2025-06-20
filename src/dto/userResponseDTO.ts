import User from '../types/User';

const userResponseDTO = <T extends { password?: string }>(user: T) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export default userResponseDTO;
