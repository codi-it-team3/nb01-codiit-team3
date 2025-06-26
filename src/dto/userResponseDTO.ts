import User from '../types/User';

const userResponseDTO = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    type: user.type,
    points: user.points,
    image: user.image,
  };
};
export default userResponseDTO;
