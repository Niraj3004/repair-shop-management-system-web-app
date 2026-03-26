import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodSchema, ZodError } from "zod";
import { STATUS_CODES } from "../constants/statuscode";

export const validateZod =
  (schema: ZodObject<any> | ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: "Validation failed",
          errors: error.issues,
        });
      }
      return next(error);
    }
  };
