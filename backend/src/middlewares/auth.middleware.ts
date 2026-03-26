import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.model";
import { verifyToken } from "../utils/jwt";
import { ROLES } from "../constants/role";
import { MESSAGES } from "../constants/messages";

export interface IExtendRequest extends Request {
  user?: IUser;
}

class AuthMiddleware {
  static async isAuthenticated(
    req: IExtendRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      // Check if the Authorization header exists and has the Bearer prefix
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: MESSAGES.TOKEN_NOT_PROVIDED,
        });
        return;
      }

      // Strip "Bearer " prefix to get the raw token
      const token = authHeader.split(" ")[1]!;

      // Verify Token
      const decoded = verifyToken(token);

      if (!decoded || typeof decoded === "string") {
        res.status(403).json({
          success: false,
          message: MESSAGES.INVALID_OR_EXPIRED_TOKEN,
        });
        return;
      }



      // Handle Regular Users
      let userId = decoded.id;

      // Seamless migration of old ghost Admin tokens!
      if (!userId && decoded.role === ROLES.ADMIN) {
        const adminDoc = await User.findOne({ email: decoded.email, role: ROLES.ADMIN });
        if (adminDoc) {
          userId = adminDoc._id.toString();
        }
      }

      if (!userId) {
         res.status(403).json({
          success: false,
          message: MESSAGES.INVALID_OR_EXPIRED_TOKEN,
        });
        return;
      }

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: MESSAGES.USER_NOT_FOUND,
        });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      // If token is expired or completely invalid, jsonwebtoken throws an error
      res.status(403).json({
        success: false,
        message: MESSAGES.INVALID_OR_EXPIRED_TOKEN,
      });
    }
  }
}

export default AuthMiddleware;
