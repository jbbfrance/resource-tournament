import "@babel/polyfill";
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import dotenv from 'dotenv';

import schemas from './schemas';
import resolvers from './resolvers';

import userModel from './models/userModel';
import postModel from './models/postModel';

dotenv.config();

const app = express();
app.use(cors());

mongoose.connect(process.env.MONGO_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const getUser = async (req) => {
  const { token } = req.headers;

  if (token) {
    try {
      return await jwt.verify(token, process.env.JWT_SECRETORPUBLICKEY);
    } catch (e) {
      throw new AuthenticationError('Your session expired. Sign in again.');
    }
  }
};

const server = new ApolloServer({
  typeDefs: schemas,
  resolvers,
  context: async ({ req }) => {
    if (req) {
      const me = await getUser(req);

      return {
        me,
        models: {
          userModel,
          postModel,
        },
      };
    }
  },
});

server.applyMiddleware({ app, path: '/graphql' });

app.listen(process.env.PORT, process.env.HOST, () => console.log('🚀 Server ready at %s:%d', process.env.HOST, process.env.PORT));
