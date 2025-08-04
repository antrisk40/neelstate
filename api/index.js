import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from './routes/user.route.js'
import cors from "cors"
import authRouter from './routes/auth.route.js'
import cookieParser from "cookie-parser";
import listingRouter from "./routes/listing.route.js";
import paymentRouter from "./routes/payment.route.js";
dotenv.config();

const app = express();

// Configure CORS with multiple origins for development and production
const allowedOrigins = [
  process.env.CLIENT_URL || "https://neelstate.onrender.com",
  "http://localhost:5173", // For local development
  "http://localhost:3000"  // For local development
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json()); // this is used to get printed data on console from post request
app.use(cookieParser());

const MONGODB_URL = process.env.MONGODB_URL;
const PORT = process.env.PORT || 3000;

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error(err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);
app.use("/api/payment", paymentRouter);    

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "NeelState API is running",
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'internal server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode: statusCode,
    message,
  });
  
});