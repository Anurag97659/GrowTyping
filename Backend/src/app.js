import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes.js';
import statRoutes from './routes/stat.routes.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

// app.use(cors({
//   // origin: process.env.API,
//   origin:  ['http://localhost:5173', 'https://growtyping.onrender.com'],
//   credentials: true
// }));
// app.options("*", cors());
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://growtyping-1.onrender.com',
    'https://growtyping.vercel.app',
    ...(process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
      .split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter(Boolean),
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

app.use('/GrowTyping/v1/users',userRoutes);
app.use('/GrowTyping/v1/stats',statRoutes);

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    statusCode,
    data: null,
    message: err.message || "Internal server error",
    success: false,
    errors: err.errors || []
  });
});

export default app;
