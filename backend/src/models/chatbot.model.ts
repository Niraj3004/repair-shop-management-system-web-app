import mongoose, { Schema, Document } from "mongoose";

export interface IChatbotMessage extends Document {
  userId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const ChatbotMessageSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// Index for fast retrieval of latest messages per user
ChatbotMessageSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IChatbotMessage>("ChatbotMessage", ChatbotMessageSchema);
