import { connectToDatabase } from "./src/config/db.config";
import User from "./src/models/user.model";
import dotenv from "dotenv";

dotenv.config();

const fixUser = async () => {
  try {
    await connectToDatabase();
    console.log("Connected to DB, updating nirajkushwaha84@gmail.com...");
    
    // Update the user
    const user = await User.findOneAndUpdate(
      { email: "nirajkushwaha84@gmail.com" },
      { $set: { isVerified: true } },
      { new: true }
    );
    
    if (user) {
      console.log("Successfully verified user: ", user.email);
    } else {
      console.log("User not found in DB!");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error updating user:", error);
    process.exit(1);
  }
};

fixUser();
