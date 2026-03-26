import User from "../models/user.model";
import bcrypt from "bcrypt";

export const getUserProfileService = async (userId: string) => {
  const user = await User.findById(userId).select("-password -otp -otpExpiry");
  if (!user) throw new Error("User not found");
  return user;
};

export const updateUserProfileService = async (
  userId: string,
  data: { firstName?: string; lastName?: string; phone?: string; currentAddress?: string }
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true, runValidators: true }
  ).select("-password -otp -otpExpiry");

  if (!user) throw new Error("User not found");
  return user;
};

export const changePasswordService = async (userId: string, oldPassword?: string, newPassword?: string) => {
  if (!oldPassword || !newPassword) {
    throw new Error("Please provide both old password and new password");
  }

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (!user.password) throw new Error("User does not have a password set. They might be using a different auth method.");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Incorrect old password");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  
  await user.save();
  return { message: "Password changed successfully" };
};

export const getAdminService = async () => {
  const admin = await User.findOne({ role: "admin" });
  return admin;
};
