import User from "../models/user.model";
import { hashPassword } from "../utils/hash";
import { ENV } from "./env.config";
import { ROLES } from "../constants/role";

export const seedAdmin = async () => {
  try {
    const adminEmail = ENV.ADMIN.EMAIL || "admin@repair.com";
    const adminPassword = ENV.ADMIN.PASSWORD || "admin123";

    const existingUser = await User.findOne({ email: adminEmail });

    if (!existingUser) {
      console.log(`[Seed] System Admin not found. Creating now...`);
      const hashedPassword = await hashPassword(adminPassword);
      
      await User.create({
        firstName: "System",
        lastName: "Admin",
        email: adminEmail,
        password: hashedPassword,
        phone: "0000000000",
        currentAddress: "Headquarters",
        role: ROLES.ADMIN,
        isVerified: true
      });
      console.log(`[Seed] System Admin successfully created.`);
    } else {
      // If user exists but is not an admin, update their role
      if (existingUser.role !== ROLES.ADMIN) {
        console.log(`[Seed] User with admin email exists but wrong role. Updating to ADMIN...`);
        existingUser.role = ROLES.ADMIN;
        existingUser.isVerified = true;
        await existingUser.save();
      }
      console.log(`[Seed] System Admin verified in DB.`);
    }
  } catch (error) {
    console.error(`[Seed Error] Could not seed admin to DB:`, error);
  }
};
