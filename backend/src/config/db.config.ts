import mongoose from "mongoose";
import { ENV } from "./env.config";

export async function connectToDatabase() {
  const mongoUri = ENV.MONGO_URI;
  const dbName = ENV.DATABASE_NAME;
  if (!mongoUri) {
    throw new Error("MONGO URI is not define .env file");
  }
  if (!dbName) {
    throw new Error("DATABASE_NAME is not defined in the .env file");
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName,
    });
    console.log("🔌 Connection to Mongoose!");
  } catch (err) {
    console.log("😭Mongoose connection error:", err);
  }
}
