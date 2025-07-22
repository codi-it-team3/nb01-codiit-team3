import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';


const app = express();

const swaggerPath = path.join(__dirname, '../build/openapi.yaml');
const fileContents = fs.readFileSync(swaggerPath, 'utf8');
const swaggerSpec = yaml.load(fileContents) as object;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(STATIC_PATH, express.static(path.resolve(process.cwd(), PUBLIC_PATH)));

const upload = multer();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/products', productsRouter);
app.use('/api/review', reviewsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userrouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

export default app;
