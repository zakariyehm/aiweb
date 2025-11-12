/**
 * Convex Actions
 * Actions can make external API calls (unlike mutations/queries)
 * Used for sending emails via Resend API
 */

import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Send email verification code using Resend API
 * This is an action because it needs to make external API calls
 */
export const sendVerificationEmail = action({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("[Email Send Error] RESEND_API_KEY not found in environment variables");
      throw new Error("Email service not configured. Please add RESEND_API_KEY to Convex environment variables.");
    }

    try {
      // Log which email we're sending to
      console.log(`[Email Send] Attempting to send verification code to: ${args.email}`);
      
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "AI Nutrition Tracker <onboarding@resend.dev>", // Change this to your verified domain
          to: args.email, // This is the email the user entered - it will be sent here
          subject: "Verify Your Email Address",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #9246FF 0%, #7B2CBF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">Verify Your Email</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
                  <p style="font-size: 16px; margin-bottom: 20px;">You requested to change your email address. Please use the verification code below to confirm your new email:</p>
                  <div style="background: #f5f5f5; border: 2px dashed #9246FF; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                    <div style="font-size: 36px; font-weight: bold; color: #9246FF; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${args.code}
                    </div>
                  </div>
                  <p style="font-size: 14px; color: #666; margin-top: 20px;">This code will expire in 15 minutes.</p>
                  <p style="font-size: 14px; color: #666; margin-top: 10px;">If you didn't request this, please ignore this email.</p>
                  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                  <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">© ${new Date().getFullYear()} AI Nutrition Tracker. All rights reserved.</p>
                </div>
              </body>
            </html>
          `,
          text: `Verify Your Email Address\n\nHello,\n\nYou requested to change your email address. Please use the verification code below to confirm your new email:\n\n${args.code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.\n\n© ${new Date().getFullYear()} AI Nutrition Tracker. All rights reserved.`,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        let errorJson;
        try {
          errorJson = JSON.parse(errorData);
        } catch {
          errorJson = { message: errorData };
        }
        
        // Check if it's a domain verification error (403)
        if (emailResponse.status === 403 && errorJson.message?.includes("verify a domain")) {
          console.warn(`[Email Send Warning] Attempted to send to: ${args.email}`);
          console.warn("[Email Send Warning] Domain not verified. Resend free tier only allows sending to your own email address (abtisachs@gmail.com).");
          console.warn("[Email Send Warning] To send to ANY email address, verify a domain at https://resend.com/domains");
          console.warn("[Email Send Warning] Until domain is verified, emails can only be sent to: abtisachs@gmail.com");
          return { 
            success: false, 
            error: "domain_not_verified",
            message: `Domain not verified. Resend currently only allows sending to your account email. To send to ${args.email}, please verify a domain in Resend.`,
          };
        }
        
        console.error("[Email Send Error]", errorData);
        return { 
          success: false, 
          error: "send_failed",
          message: errorJson.message || "Failed to send email",
        };
      }

      const result = await emailResponse.json();
      console.log(`[Email Sent Successfully] Verification code sent to: ${args.email}`, result);
      return { success: true, messageId: result.id };
    } catch (error: any) {
      console.error("[Email Send Error]", error);
      return { 
        success: false, 
        error: "exception",
        message: error.message || "Unknown error",
      };
    }
  },
});

