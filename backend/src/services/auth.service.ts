import User from "../models/user.model";
import Booking from "../models/booking.model";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import { generateOTP } from "../utils/tokens";
import { emailTemplates, sendEmail } from "../utils/emailTemplates";
import { ENV } from "../config/env.config";
import { ROLES } from "../constants/role";

/* =================================
   REGISTER CLIENT
================================= */
export const registerClientService = async (data: any) => {
  const { firstName, lastName, phone, email, currentAddress } = data;

  let user = await User.findOne({ email });

  if (user) {
    if (user.isVerified) {
      throw new Error("User already exists");
    }
    // User exists but not verified -> Resend OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    user.currentAddress = currentAddress;
    await user.save();

    await sendEmail(
      email,
      "Verify your account",
      emailTemplates.otpEmail(email, otp)
    );

    return user;
  }

  const otp = generateOTP();

  user = await User.create({
    firstName,
    lastName,
    phone,
    email,
    currentAddress,
    role: ROLES.CLIENT,
    otp,
    otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
    isVerified: false,
  });

  await sendEmail(
    email,
    "Verify your account",
    emailTemplates.otpEmail(email, otp)
  );

  return user;
};

/* =================================
   VERIFY OTP
================================= */
export const verifyOtpService = async (
  email: string,
  otp: string,
  password?: string
) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (user.otpExpiry && user.otpExpiry < new Date()) {
    throw new Error("OTP expired");
  }

  if (password) {
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
  }

  user.isVerified = true;
  user.otp = undefined;

  await user.save();

  // Link guest bookings
  if (user.email) {
    await Booking.updateMany(
      { customerEmail: user.email, isGuest: true, user: { $exists: false } },
      { $set: { user: user._id, isGuest: false } }
    );
  }

  await sendEmail(
    user.email,
    "Welcome 🎉",
    emailTemplates.welcomeEmail(user.firstName)
  );

  return true;
};

/* =================================
   LOGIN SERVICE
================================= */
export const loginService = async (email: string, password: string) => {


  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  // Admins are verified bypass explicitly
  if (!user.isVerified && user.role !== ROLES.ADMIN) {
    throw new Error("Account not verified");
  }

  if (!user.password) {
    throw new Error("Password not set. Please verify your account first.");
  }

  const match = await comparePassword(password, user.password);

  if (!match) {
    throw new Error("Invalid credentials");
  }

  const secret = process.env.JWT_SECRET || ENV.JWT_SECRET || "";
  if (!secret) throw new Error("JWT_SECRET is not defined");
  
  const token = generateToken({
    id: user._id.toString(),
    role: user.role,
  }) as string;

  return {
    user,
    token,
  };
};

/* =================================
   FORGOT PASSWORD
================================= */
export const forgotPasswordService = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const otp = generateOTP();

  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  await sendEmail(
    email,
    "Reset Password OTP",
    emailTemplates.resetPasswordEmail(email, otp)
  );

  return true;
};

/* =================================
   RESET PASSWORD
================================= */
export const resetPasswordService = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (user.otpExpiry && user.otpExpiry < new Date()) {
    throw new Error("OTP expired");
  }

  const hashedPassword = await hashPassword(newPassword);

  user.password = hashedPassword;
  user.isVerified = true;  // Mark email as verified if they successfully reset password
  user.otp = undefined;

  await user.save();

  return true;
};

/* =================================
   RESEND OTP
================================= */
export const resendOtpService = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendEmail(
    email,
    "New Verification OTP",
    emailTemplates.otpEmail(email, otp)
  );

  return true;
};
