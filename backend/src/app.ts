import express from "express";
import helmet from "helmet";
import cors from "cors";

import { globalLimiter } from "./middlewares/rateLimit.middleware";
import apiRoutes from "./routes/index";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

// Security Middleware
app.use(helmet());
app.use(  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }));
app.use(globalLimiter);

// Parse JSON Bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount central router
app.use("/api", apiRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
