import User from "../models/User.js";

export const findUserByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

export const findUserById = async (id) => {
  return User.findByPk(id);
};

export const createUser = async (data) => {
  return User.create(data);
};

export const updateUserToken = async (id, token) => {
  return User.update({ token }, { where: { id } });
};

export const updateUserSubscription = async (id, subscription) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  return user.update({ subscription });
};
