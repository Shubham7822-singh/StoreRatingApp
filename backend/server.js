// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// ✅ Correct imports (match filenames exactly)
import ratingRouter from './routes/ratingRoutes.js';
import authRouter from './routes/authRoutes.js';
import storeRouter from './routes/storeRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import ownerRouter from './routes/ownerRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// DB Connection
connectDB();

// Routes
app.use("/v1/auth", authRouter);
app.use("/v1/stores", storeRouter);
app.use("/v1/admin", adminRouter);
app.use("/v1/owner", ownerRouter);
app.use("/v1/rating", ratingRouter);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ Store Rating API is running...");
});

// ✅ Catch 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
