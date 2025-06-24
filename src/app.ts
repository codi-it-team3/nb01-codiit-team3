import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { PUBLIC_PATH, STATIC_PATH } from './lib/constants';
import { defaultNotFoundHandler, globalErrorHandler } from './controllers/errorController';
import { PORT } from './lib/constants';
import authRouter from './routers/authrouter';
import userrouter from './routers/userrouter';
import multer from 'multer';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(STATIC_PATH, express.static(path.resolve(process.cwd(), PUBLIC_PATH)));
const upload = multer();

app.use('/api/auth', authRouter);
app.use('/api/users', userrouter);

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

export default app;
