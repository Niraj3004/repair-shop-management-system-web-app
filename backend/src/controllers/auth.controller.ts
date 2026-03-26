import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { STATUS_CODES } from "../constants/statuscode";
import { MESSAGES } from "../constants/messages";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.registerClientService(req.body);

    res
      .status(STATUS_CODES.CREATED)
      .json({ message: MESSAGES.REGISTER_SUCCESS, user });
  } catch (error: any) {
    if (error.message === "User already exists") error.statusCode = STATUS_CODES.BAD_REQUEST;
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.verifyOtpService(req.body.email, req.body.otp, req.body.password);

    res.status(STATUS_CODES.OK).json({ message: MESSAGES.ACCOUNT_VERIFIED });
  } catch (error: any) {
    if (["User not found", "Invalid OTP", "OTP expired"].includes(error.message)) {
      error.statusCode = STATUS_CODES.BAD_REQUEST;
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.loginService(
      req.body.email,
      req.body.password,
    );

    res.status(STATUS_CODES.OK).json(data);
  } catch (error: any) {
    if (["User not found", "Account not verified", "Password not set. Please verify your account first.", "Invalid credentials"].includes(error.message)) {
      error.statusCode = STATUS_CODES.UNAUTHORIZED;
    }
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.forgotPasswordService(req.body.email);

    res.status(STATUS_CODES.OK).json({ message: MESSAGES.OTP_SENT });
  } catch (error: any) {
    if (error.message === "User not found") error.statusCode = STATUS_CODES.NOT_FOUND;
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.resetPasswordService(
      req.body.email,
      req.body.otp,
      req.body.newPassword,
    );

    res.status(STATUS_CODES.OK).json({ message: MESSAGES.PASSWORD_RESET });
  } catch (error: any) {
    if (["User not found", "Invalid OTP", "OTP expired"].includes(error.message)) {
      error.statusCode = STATUS_CODES.BAD_REQUEST;
    }
    next(error);
  }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.resendOtpService(req.body.email);

    res.status(STATUS_CODES.OK).json({ message: MESSAGES.OTP_SENT });
  } catch (error: any) {
    if (error.message === "User not found") error.statusCode = STATUS_CODES.NOT_FOUND;
    next(error);
  }
};
