import { Response, NextFunction } from "express";
import { IExtendRequest } from "./auth.middleware";
import { ROLES } from "../constants/role";
import { MESSAGES } from "../constants/messages";

type RoleType = (typeof ROLES)[keyof typeof ROLES];

class RoleMiddleware {
  static restrictTo(...allowedRoles: RoleType[]) {
    return (req: IExtendRequest, res: Response, next: NextFunction) => {
      const userRole = req.user?.role as RoleType;
      
      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({
          success: false,
          message: MESSAGES.FORBIDDEN,
        });
        return;
      }

      next();
    };
  }
}

export default RoleMiddleware;
