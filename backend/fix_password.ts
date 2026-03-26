import { connectToDatabase } from "./src/config/db.config";
import User from "./src/models/user.model";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const fixPassword = async () => {
  try {
    await connectToDatabase();
    console.log("Connected to DB, updating nirajkushwaha84@gmail.com...");
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("12345678", salt);

    // Update the user
    const user = await User.findOneAndUpdate(
      { email: "nirajkushwaha84@gmail.com" },
      { $set: { password: hashedPassword, isVerified: true } },
      { new: true }
    );
    
    if (user) {
      console.log("Successfully manually reset password to 12345678 for: ", user.email);
    } else {
      console.log("User not found in DB!");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error updating user:", error);
    process.exit(1);
  }
};

fixPassword();
