import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Check if email credentials are available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in your .env file."
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendVerificationEmail = async (email, token, username) => {
  try {
    const transporter = createTransporter();

    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your HomeSell Pro Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to HomeSell Pro!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
            <h2 style="color: #374151; margin-bottom: 20px;">Hi ${username},</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
              Thank you for creating your HomeSell Pro account! To complete your registration, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #10b981; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; 
                        display: inline-block; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #10b981; font-size: 14px; word-break: break-all; 
                       background: #f0fdf4; padding: 15px; border-radius: 5px; border-left: 4px solid #10b981;">
              ${verificationUrl}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                <strong>Important:</strong> This verification link will expire in 24 hours. 
                If you didn't create this account, you can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully to:", email);
    return result;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, token, username) => {
  try {
    const transporter = createTransporter();

    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your HomeSell Pro Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
            <h2 style="color: #374151; margin-bottom: 20px;">Hi ${username},</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #f59e0b; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; 
                        display: inline-block; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #f59e0b; font-size: 14px; word-break: break-all; 
                       background: #fffbeb; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
              ${resetUrl}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                <strong>Security Note:</strong> This link will expire in 1 hour. 
                If you didn't request a password reset, please ignore this email and your password will remain unchanged.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully to:", email);
    return result;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};
