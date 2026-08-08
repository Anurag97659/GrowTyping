import dotenv from "dotenv";
dotenv.config({
    path: ".env"
});
import { createServer } from "http";
import { Server } from "socket.io";
import connectDatabase from "./db/db.js";
import app from "./app.js";
import { setupRaceSocket } from "./socket/race.socket.js";

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

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

setupRaceSocket(io);

connectDatabase()
.then(()=>{
    httpServer.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch((error)=>{
    console.log("Mongo db not connect !!!! /(ㄒoㄒ)/~~  error in main index.js")
})
