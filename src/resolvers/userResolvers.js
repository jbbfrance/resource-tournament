import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server';
import dotenv from 'dotenv';

dotenv.config();

export default {
  Query: {
    user: async (parent, { id }, { models: { userModel }, me }) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const user = await userModel.findById({ _id: id }).exec();
      return user;
    },
    login: async (parent, { name, password }, { models: { userModel } }) => {
      const user = await userModel.findOne({ name }).exec();

      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const matchPasswords = bcrypt.compareSync(password, user.password);

      if (!matchPasswords) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRETORPUBLICKEY, { expiresIn: 24 * 10 * 50 });

      return {
        token,
      };
    },
  },
  Mutation: {
    createUser: async (parent, { name, password }, { models: { userModel } }) => {
      const user = await userModel.create({ name, password });
      return user;
    },
  },
  User: {
    posts: async ({ id }, args, { models: { postModel } }) => {
      const posts = await postModel.find({ author: id }).exec();
      return posts;
    },
  },
};
