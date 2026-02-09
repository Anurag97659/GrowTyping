import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes.js';
import statRoutes from './routes/stat.routes.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.API,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

app.use('/GrowTyping/v1/users',userRoutes);
app.use('/GrowTyping/v1/stats',statRoutes);


export default app;