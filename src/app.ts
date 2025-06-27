import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { PUBLIC_PATH, STATIC_PATH } from './lib/constants';
import { defaultNotFoundHandler, globalErrorHandler } from './controllers/errorController';
import { PORT } from './lib/constants';

import productsRouter from './routers/productsRouter';
import cartRouter from './routers/cartRouter';
import orderRouter from './routers/orderRouter';
import authRouter from './routers/authRouter';
import userrouter from './routers/userRouter';
import multer from 'multer';

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(STATIC_PATH, express.static(path.resolve(process.cwd(), PUBLIC_PATH)));

const upload = multer();

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userrouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

export default app;
