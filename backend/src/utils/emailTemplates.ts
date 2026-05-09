import nodemailer from "nodemailer";
import { ENV } from "../config/env.config";

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  attachmentPath?: string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"WeFixIt Nepal" <${ENV.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments: attachmentPath ? [{ path: attachmentPath }] : [],
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email. Please try again later.");
  }
};

const baseEmailTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f7fa; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
    .header { background-color: #0d6efd; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1a1a1a; font-size: 22px; margin-top: 0; margin-bottom: 20px; }
    .content p { margin: 0 0 16px; font-size: 16px; }
    .btn { display: inline-block; padding: 12px 28px; background-color: #0d6efd; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; text-align: center; }
    .highlight-box { background-color: #f8f9fa; border-left: 4px solid #0d6efd; padding: 20px; border-radius: 0 6px 6px 0; margin: 24px 0; }
    .highlight-box p { margin: 0 0 8px; font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .highlight-box .tracking-id { font-size: 24px; font-weight: 700; color: #0d6efd; margin: 0 0 16px; letter-spacing: 1px; }
    .highlight-box .status { font-size: 18px; font-weight: 700; color: #198754; margin: 0; }
    .highlight-box .otp { font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #212529; text-align: center; margin: 10px 0; }
    .footer { background-color: #f8f9fa; padding: 24px 30px; text-align: center; border-top: 1px solid #eeeeee; }
    .footer p { margin: 0; font-size: 14px; color: #6c757d; }
    .signature { margin-top: 30px; font-size: 16px; font-weight: 600; color: #1a1a1a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>WeFixIt Nepal</h1>
    </div>
    <div class="content">
      ${content}
      <div class="signature">
        Best regards,<br>
        <span style="color: #0d6efd;">The WeFixIt Team</span>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} WeFixIt Nepal. All rights reserved.</p>
      <p style="margin-top: 8px; font-size: 12px;">This is an automated email, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

export const emailTemplates = {
  otpEmail: (email: string, otp: string) => baseEmailTemplate(
    "Verify your WeFixIt Account",
    `<h2>Welcome to WeFixIt! 👋</h2>
    <p>Please click the button below to verify your account and set up your password.</p>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-account?email=${encodeURIComponent(email)}&otp=${otp}" class="btn" style="color:#ffffff;">Verify Account</a>
    </div>
    <div class="highlight-box">
      <p>Or use this verification code:</p>
      <div class="otp">${otp}</div>
    </div>
    <p style="color: #6c757d; font-size: 14px;">This link and code will expire in 10 minutes.</p>`
  ),

  welcomeEmail: (name: string) => baseEmailTemplate(
    "Welcome to WeFixIt Nepal",
    `<h2>Welcome, ${name}! 🎉</h2>
    <p>Your account has been verified successfully. We're thrilled to have you on board.</p>
    <p>You can now log in to your dashboard to book repairs, track existing requests, and manage your devices.</p>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="btn" style="color:#ffffff;">Log In to Dashboard</a>
    </div>`
  ),

  resetPasswordEmail: (email: string, otp: string) => baseEmailTemplate(
    "Reset Your Password",
    `<h2>Reset Your Password</h2>
    <p>We received a request to reset the password for your WeFixIt account. Click the button below to proceed.</p>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?email=${encodeURIComponent(email)}&otp=${otp}" class="btn" style="background-color: #dc3545; color:#ffffff;">Reset Password</a>
    </div>
    <div class="highlight-box" style="border-left-color: #dc3545;">
      <p>Or use this reset code:</p>
      <div class="otp">${otp}</div>
    </div>
    <p style="color: #6c757d; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. This link and code will expire in 10 minutes.</p>`
  ),

  statusUpdateEmail: (name: string, trackingId: string, status: string, notes?: string) => baseEmailTemplate(
    "Repair Status Update",
    `<h2>Repair Status Update</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>There has been an update regarding your device repair request.</p>
    
    <div class="highlight-box">
      <p>Tracking ID</p>
      <div class="tracking-id">${trackingId}</div>
      <p>New Status</p>
      <div class="status">${status}</div>
      
      ${notes ? `
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e9ecef;">
        <p>Technician Notes</p>
        <div style="font-size: 16px; font-style: italic; color: #495057; background: #ffffff; padding: 12px; border-radius: 4px; border: 1px solid #e9ecef;">
          "${notes}"
        </div>
      </div>
      ` : ''}
    </div>
    
    <p>You can track the full timeline of your repair by logging into your client dashboard.</p>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/track?id=${trackingId}" class="btn" style="color:#ffffff;">View Full Details</a>
    </div>`
  ),

  bookingCreatedEmail: (name: string, trackingId: string, deviceName: string) => baseEmailTemplate(
    "Repair Booking Confirmed",
    `<h2>Repair Booking Confirmed! 🛠️</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We have successfully received your repair request for your <strong>${deviceName}</strong>.</p>
    
    <div class="highlight-box">
      <p>Your Tracking ID</p>
      <div class="tracking-id">${trackingId}</div>
      <p style="margin-top: 16px; font-size: 14px; text-transform: none; color: #495057; font-weight: normal;">
        Please keep this Tracking ID safe. You can use it to check the live status of your repair on our website.
      </p>
    </div>

    <p>If you selected drop-off, please bring your device to our service center. If you selected pickup, our team will coordinate with you shortly.</p>`
  ),

  customAnnouncementEmail: (name: string, title: string, message: string) => baseEmailTemplate(
    title,
    `<h2>${title}</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p style="white-space: pre-wrap;">${message}</p>
    <br/>
    <p>If you have any questions, feel free to reply directly to this email or contact our support team.</p>`
  ),

  adminNewPublicBooking: (adminName: string, customerName: string, trackingId: string, email: string, phone: string) => baseEmailTemplate(
    "New Public Booking Request Pending Approval",
    `<h2>New Public Booking Request! 📬</h2>
    <p>Hello <strong>${adminName}</strong>,</p>
    <p>A new public repair booking request has been submitted by <strong>${customerName}</strong> and is currently pending your approval.</p>
    
    <div class="highlight-box">
      <p>Tracking ID</p>
      <div class="tracking-id">${trackingId}</div>
      <p>Customer Details</p>
      <p style="margin:0; font-size:16px;"><strong>Email:</strong> ${email}</p>
      <p style="margin:0; font-size:16px;"><strong>Phone:</strong> ${phone}</p>
    </div>

    <p>Please log in to your admin dashboard to review, approve, or reject this request.</p>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/bookings" class="btn" style="color:#ffffff;">Go to Admin Dashboard</a>
    </div>`
  ),

  customerBookingApproved: (name: string, trackingId: string, loginEmail: string, loginPass: string) => baseEmailTemplate(
    "Your Repair Booking is Approved!",
    `<h2>Repair Booking Approved! ✅</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Great news! Your repair booking request has been approved. We have created a secure account for you to track your repair progress.</p>
    
    <div class="highlight-box">
      <p>Your Tracking ID</p>
      <div class="tracking-id">${trackingId}</div>
      <p>Your Account Credentials</p>
      <p style="margin:0; font-size:16px;"><strong>Login ID:</strong> ${loginEmail}</p>
      <p style="margin:0; font-size:16px;"><strong>Password:</strong> <span style="font-family: monospace; background:#e9ecef; padding:2px 6px; border-radius:4px;">${loginPass}</span></p>
    </div>

    <p>Please log in to your new client dashboard to view details and track your device.</p>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="btn" style="color:#ffffff;">Log In to Dashboard</a>
    </div>
    <p style="color: #6c757d; font-size: 14px;">For your security, we highly recommend changing your password after your first login.</p>`
  ),

  customerBookingRejected: (name: string, trackingId: string) => baseEmailTemplate(
    "Update on Your Repair Booking Request",
    `<h2>Booking Request Update</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for submitting a repair booking request (Tracking ID: <strong>${trackingId}</strong>).</p>
    <p>Unfortunately, we are unable to process or approve your request at this time. This may be due to unavailable parts or a service we currently do not offer.</p>
    <p>If you believe this is a mistake or would like more details, please contact our support team.</p>`
  ),
};
