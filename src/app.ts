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
import reviewsRouter from './routers/reviewsRouter';
import inquiriesRouter from './routers/inquiriesRouter';
import storeRouter from './routers/storeRouter';
import multer from 'multer';
import notificationsRouter from './routers/notificationsRouter';
import s3Router from './routers/s3Router';
import metadatasRouter from './routers/metadatasRouter';

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(STATIC_PATH, express.static(path.resolve(process.cwd(), PUBLIC_PATH)));

const upload = multer();

app.use('/api/products', productsRouter);
app.use('/api/review', reviewsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userrouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use('/api/store', storeRouter);
app.use('/api/s3', s3Router);
app.use('/api/metadata', metadatasRouter);

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

export default app;
