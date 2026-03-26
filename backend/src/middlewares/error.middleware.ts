import { Request, Response, NextFunction } from "express";
import { STATUS_CODES } from "../constants/statuscode";
import { MESSAGES } from "../constants/messages";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error("Error Status =>", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with ID of ${err.value}`;
    error = new Error(message);
    (error as any).statusCode = STATUS_CODES.NOT_FOUND;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new Error(message);
    (error as any).statusCode = STATUS_CODES.BAD_REQUEST;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val: any) => val.message);
    error = new Error(message.join(", "));
    (error as any).statusCode = STATUS_CODES.BAD_REQUEST;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    const message = MESSAGES.INVALID_OR_EXPIRED_TOKEN;
    error = new Error(message);
    (error as any).statusCode = STATUS_CODES.FORBIDDEN;
  }

  res.status((error as any).statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
