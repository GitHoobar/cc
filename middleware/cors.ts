import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

const cors = Cors({
  methods: ['POST'], 
});

export const corsMiddleware = (req: NextApiRequest, res: NextApiResponse, handler: Function) => {
  return new Promise((resolve, reject) => {
    cors(req, res, (err?: Error) => {
      if (err) return reject(err);
      return handler(req, res);
    });
  });
};