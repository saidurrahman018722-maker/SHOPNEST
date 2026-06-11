import { config } from 'dotenv';
import nodemailer from 'nodemailer';
import { otpMessage } from '../utils/otp.js';

config();
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
export  const sendRegistrationWelcomeEmail = async (userEmail, userName) => {
  try {
    const info = await transporter.sendMail({
      from: `"SHOPNEST" <${process.env.EMAIL_USER}>`, // Change this to your app's name
      to: userEmail,
      subject: 'Welcome! Registration Successful',
      text: `Hi ${userName},\n\nThank you for registering! We are thrilled to have you on board.\n\nBest,\nThe EmailSending Team`,
      // HTML version looks much better in modern email clients
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #4CAF50;">Welcome aboard, ${userName}!</h2>
          <p style="font-size: 16px; color: #333;">Your account has been successfully created. We are absolutely thrilled to have you with us.</p>
          <p style="font-size: 16px; color: #333;">If you have any questions or need help getting started, just hit reply to this email!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 14px; color: #777;">Best Regards,<br><strong> EmailSending Team</strong></p>
        </div>
      `,
    });

    console.log('Welcome email sent successfully: %s', info.messageId);
    return true; 
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};


export const sendOTPEmail = async (userEmail, userName, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"SHOPNEST" <${process.env.EMAIL_USER}>`, 
      to: userEmail,
      subject: `${otp} is your SHOPNEST verification code`,
      
      // Plain text fallback for old/restrictive email clients
      text: `Hi ${userName},\n\nThank you for registering with SHOPNEST. Your One-Time Password (OTP) is: ${otp}\n\nThis code is valid for 5 minutes.\n\nBest,\nSHOPNEST Team`,
      
      // Passing your modular HTML function here
      html: otpMessage(otp), 
    });

    console.log('OTP email sent successfully: %s', info.messageId);
    return true; 
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};
