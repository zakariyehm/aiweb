/**
 * Convex Actions
 * Actions can make external API calls (unlike mutations/queries)
 * Used for sending emails via Resend API, WaafiPay payment processing, and OpenAI food analysis
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

/**
 * WaafiPay PreAuthorization - Hold funds without charging
 * Based on: https://docs.waafipay.com/preauthorization
 */
export const waafiPreAuthorize = action({
  args: {
    phoneNumber: v.string(),
    amount: v.string(), // Amount as string (e.g., "29.99")
    currency: v.string(), // Currency code (e.g., "USD")
    planType: v.union(v.literal('monthly'), v.literal('yearly')),
    referenceId: v.string(), // Unique reference for this transaction
  },
  handler: async (ctx, args) => {
    // Helper function to clean environment variable values
    const cleanEnvVar = (value: string | undefined): string | undefined => {
      if (!value) return undefined;
      // Remove variable name prefix if present (e.g., "WAAFI_API_URL=https://..." -> "https://...")
      const match = value.match(/^[A-Z_]+=(.+)$/);
      return match ? match[1] : value;
    };

    const merchantUid = cleanEnvVar(process.env.WAAFI_MERCHANT_UID);
    const apiUserId = cleanEnvVar(process.env.WAAFI_API_USER_ID);
    const apiKey = cleanEnvVar(process.env.WAAFI_API_KEY);
    let apiUrl = cleanEnvVar(process.env.WAAFI_API_URL) || "https://api.waafipay.com";
    
    // Remove trailing slash if present
    apiUrl = apiUrl.replace(/\/$/, "");

    if (!merchantUid || !apiUserId || !apiKey) {
      console.error("[WaafiPay] Missing credentials in environment variables");
      throw new Error("WaafiPay service not configured. Please add WAAFI_MERCHANT_UID, WAAFI_API_USER_ID, and WAAFI_API_KEY to Convex environment variables.");
    }

    try {
      const requestId = `preauth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      const requestBody = {
        schemaVersion: "1.0",
        requestId: requestId,
        timestamp: timestamp,
        channelName: "WEB",
        serviceName: "API_PREAUTHORIZE",
        serviceParams: {
          merchantUid: merchantUid,
          apiUserId: apiUserId,
          apiKey: apiKey,
          paymentMethod: "MWALLET_ACCOUNT",
          payerInfo: {
            accountNo: args.phoneNumber, // Phone number as account
          },
          transactionInfo: {
            referenceId: args.referenceId,
            amount: args.amount,
            currency: args.currency,
            description: `CalAI ${args.planType === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
          },
        },
      };

      // WaafiPay API endpoint - check documentation for correct path
      // Common patterns: /asm, /api/v1/payment/preauthorize, or direct endpoint
      const endpointUrl = `${apiUrl}/asm`;
      
      console.log("[WaafiPay] Sending preauthorization request:", {
        phoneNumber: args.phoneNumber,
        amount: args.amount,
        planType: args.planType,
        referenceId: args.referenceId,
        apiUrl: apiUrl,
        endpointUrl: endpointUrl,
      });

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Get response text first to check if it's JSON or HTML
      const responseText = await response.text();
      
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // If response is not JSON (likely HTML error page), log it
        console.error("[WaafiPay] Non-JSON response received:", {
          status: response.status,
          statusText: response.statusText,
          responsePreview: responseText.substring(0, 500),
          endpointUrl: endpointUrl,
        });
        throw new Error(`WaafiPay API returned invalid response (status ${response.status}). Please check the API endpoint URL and credentials.`);
      }

      if (!response.ok) {
        console.error("[WaafiPay] Preauthorization failed:", {
          status: response.status,
          responseData: responseData,
        });
        throw new Error(responseData.message || responseData.responseMsg || `WaafiPay error: ${response.status}`);
      }

      // Helper function to get user-friendly error message
      const getFriendlyErrorMessage = (responseCode: string, responseMsg: string, errorCode?: string): string => {
        // Map common WaafiPay error codes to user-friendly messages
        const errorMessages: Record<string, string> = {
          "5206": "Your account balance is not sufficient. Please add funds to your mobile wallet and try again.",
          "E10205": "Your account balance is not sufficient. Please add funds to your mobile wallet and try again.",
          "5301": "Invalid payment information. Please check your phone number and try again.",
          "5302": "Payment method not supported. Please use a different payment method.",
          "5303": "Transaction declined. Please contact your bank or mobile money provider.",
          "5304": "Payment timeout. Please try again.",
          "5305": "Invalid merchant configuration. Please contact support.",
          "5201": "Payment was cancelled. Please try again if you want to complete the payment.",
          "5202": "Payment failed. Please check your account and try again.",
          "5203": "Insufficient funds. Please add money to your account and try again.",
        };

        // Check if we have a specific message for this error code
        if (errorCode && errorMessages[errorCode]) {
          return errorMessages[errorCode];
        }
        if (responseCode && errorMessages[responseCode]) {
          return errorMessages[responseCode];
        }

        // Use the response message if available, otherwise generic message
        if (responseMsg && !responseMsg.includes("Payment Failed")) {
          return responseMsg;
        }

        return "Payment could not be processed. Please check your account balance and try again, or contact support if the problem persists.";
      };

      // Check response code - 2001 means success
      // Note: state and transactionId are in params object
      const state = responseData.params?.state || responseData.state;
      const transactionId = responseData.params?.transactionId || responseData.transactionId;
      
      // Check for success: responseCode 2001 and state APPROVED (case-insensitive)
      // Handle both string and number responseCode formats
      const responseCodeStr = String(responseData.responseCode || "");
      const stateUpper = state?.toUpperCase();
      const isSuccess = responseCodeStr === "2001" && stateUpper === "APPROVED";
      
      if (isSuccess) {
        console.log("[WaafiPay] Preauthorization successful:", responseData);
        return {
          success: true,
          transactionId: transactionId,
          state: state,
          responseCode: responseData.responseCode,
        };
      } else {
        console.error("[WaafiPay] Preauthorization rejected:", responseData);
        const friendlyError = getFriendlyErrorMessage(
          responseData.responseCode || "",
          responseData.responseMsg || responseData.message || "",
          responseData.errorCode
        );
        return {
          success: false,
          error: friendlyError,
          responseCode: responseData.responseCode,
          state: state,
          errorCode: responseData.errorCode,
        };
      }
    } catch (error: any) {
      console.error("[WaafiPay] Preauthorization error:", error);
      throw new Error(error.message || "Failed to process preauthorization");
    }
  },
});

/**
 * WaafiPay PreAuthorization Commit - Complete the transaction and charge the customer
 */
export const waafiPreAuthorizeCommit = action({
  args: {
    transactionId: v.string(), // Transaction ID from preauthorization
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Helper function to clean environment variable values
    const cleanEnvVar = (value: string | undefined): string | undefined => {
      if (!value) return undefined;
      const match = value.match(/^[A-Z_]+=(.+)$/);
      return match ? match[1] : value;
    };

    const merchantUid = cleanEnvVar(process.env.WAAFI_MERCHANT_UID);
    const apiUserId = cleanEnvVar(process.env.WAAFI_API_USER_ID);
    const apiKey = cleanEnvVar(process.env.WAAFI_API_KEY);
    let apiUrl = cleanEnvVar(process.env.WAAFI_API_URL) || "https://api.waafipay.com";
    
    // Remove trailing slash if present
    apiUrl = apiUrl.replace(/\/$/, "");

    if (!merchantUid || !apiUserId || !apiKey) {
      throw new Error("WaafiPay service not configured");
    }

    try {
      const requestId = `commit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      const requestBody = {
        schemaVersion: "1.0",
        requestId: requestId,
        timestamp: timestamp,
        channelName: "WEB",
        serviceName: "API_PREAUTHORIZE_COMMIT",
        serviceParams: {
          merchantUid: merchantUid,
          apiUserId: apiUserId,
          apiKey: apiKey,
          transactionId: args.transactionId,
          description: args.description || "Subscription payment committed",
        },
      };

      const endpointUrl = `${apiUrl}/asm`;
      
      console.log("[WaafiPay] Committing transaction:", {
        transactionId: args.transactionId,
        endpointUrl: endpointUrl,
      });

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Get response text first to check if it's JSON or HTML
      const responseText = await response.text();
      
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("[WaafiPay] Non-JSON response received:", {
          status: response.status,
          statusText: response.statusText,
          responsePreview: responseText.substring(0, 500),
          endpointUrl: endpointUrl,
        });
        throw new Error(`WaafiPay API returned invalid response (status ${response.status}). Please check the API endpoint URL and credentials.`);
      }

      if (!response.ok) {
        console.error("[WaafiPay] Commit failed:", responseData);
        throw new Error(responseData.message || `Commit error: ${response.status}`);
      }

      // Helper function to get user-friendly error message (same as preauthorize)
      const getFriendlyErrorMessage = (responseCode: string, responseMsg: string, errorCode?: string): string => {
        const errorMessages: Record<string, string> = {
          "5206": "Your account balance is not sufficient. Please add funds to your mobile wallet and try again.",
          "E10205": "Your account balance is not sufficient. Please add funds to your mobile wallet and try again.",
          "5301": "Invalid payment information. Please check your phone number and try again.",
          "5302": "Payment method not supported. Please use a different payment method.",
          "5303": "Transaction declined. Please contact your bank or mobile money provider.",
          "5304": "Payment timeout. Please try again.",
          "5305": "Invalid merchant configuration. Please contact support.",
          "5201": "Payment was cancelled. Please try again if you want to complete the payment.",
          "5202": "Payment failed. Please check your account and try again.",
          "5203": "Insufficient funds. Please add money to your account and try again.",
        };

        if (errorCode && errorMessages[errorCode]) {
          return errorMessages[errorCode];
        }
        if (responseCode && errorMessages[responseCode]) {
          return errorMessages[responseCode];
        }

        if (responseMsg && !responseMsg.includes("Payment Failed")) {
          return responseMsg;
        }

        return "Payment could not be processed. Please check your account balance and try again, or contact support if the problem persists.";
      };

      // Note: state and transactionId are in params object
      const state = responseData.params?.state || responseData.state;
      const transactionId = responseData.params?.transactionId || responseData.transactionId;
      
      // Check for success: responseCode 2001 and state APPROVED (case-insensitive)
      // Handle both string and number responseCode formats
      const responseCodeStr = String(responseData.responseCode || "");
      const stateUpper = state?.toUpperCase();
      const isSuccess = responseCodeStr === "2001" && stateUpper === "APPROVED";
      
      console.log("[WaafiPay] Commit check:", {
        responseCode: responseData.responseCode,
        responseCodeStr,
        state,
        stateUpper,
        isSuccess,
      });
      
      if (isSuccess) {
        console.log("[WaafiPay] Commit successful:", responseData);
        return {
          success: true,
          transactionId: transactionId,
          state: state,
        };
      } else {
        console.error("[WaafiPay] Commit rejected:", responseData);
        const friendlyError = getFriendlyErrorMessage(
          responseData.responseCode || "",
          responseData.responseMsg || responseData.message || "",
          responseData.errorCode
        );
        return {
          success: false,
          error: friendlyError,
          responseCode: responseData.responseCode,
          errorCode: responseData.errorCode,
        };
      }
    } catch (error: any) {
      console.error("[WaafiPay] Commit error:", error);
      throw new Error(error.message || "Failed to commit transaction");
    }
  },
});

/**
 * WaafiPay PreAuthorization Cancel - Release the held funds
 */
export const waafiPreAuthorizeCancel = action({
  args: {
    transactionId: v.string(), // Transaction ID from preauthorization
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Helper function to clean environment variable values
    const cleanEnvVar = (value: string | undefined): string | undefined => {
      if (!value) return undefined;
      const match = value.match(/^[A-Z_]+=(.+)$/);
      return match ? match[1] : value;
    };

    const merchantUid = cleanEnvVar(process.env.WAAFI_MERCHANT_UID);
    const apiUserId = cleanEnvVar(process.env.WAAFI_API_USER_ID);
    const apiKey = cleanEnvVar(process.env.WAAFI_API_KEY);
    let apiUrl = cleanEnvVar(process.env.WAAFI_API_URL) || "https://api.waafipay.com";
    
    // Remove trailing slash if present
    apiUrl = apiUrl.replace(/\/$/, "");

    if (!merchantUid || !apiUserId || !apiKey) {
      throw new Error("WaafiPay service not configured");
    }

    try {
      const requestId = `cancel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      const requestBody = {
        schemaVersion: "1.0",
        requestId: requestId,
        timestamp: timestamp,
        channelName: "WEB",
        serviceName: "API_PREAUTHORIZE_CANCEL",
        serviceParams: {
          merchantUid: merchantUid,
          apiUserId: apiUserId,
          apiKey: apiKey,
          transactionId: args.transactionId,
          description: args.description || "Subscription cancelled",
        },
      };

      const endpointUrl = `${apiUrl}/asm`;
      
      console.log("[WaafiPay] Cancelling transaction:", {
        transactionId: args.transactionId,
        endpointUrl: endpointUrl,
      });

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Get response text first to check if it's JSON or HTML
      const responseText = await response.text();
      
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("[WaafiPay] Non-JSON response received:", {
          status: response.status,
          statusText: response.statusText,
          responsePreview: responseText.substring(0, 500),
          endpointUrl: endpointUrl,
        });
        throw new Error(`WaafiPay API returned invalid response (status ${response.status}). Please check the API endpoint URL and credentials.`);
      }

      if (!response.ok) {
        console.error("[WaafiPay] Cancel failed:", {
          status: response.status,
          responseData: responseData,
        });
        throw new Error(responseData.message || responseData.responseMsg || `Cancel error: ${response.status}`);
      }

      // Helper function to get user-friendly error message
      const getFriendlyErrorMessage = (responseCode: string, responseMsg: string, errorCode?: string): string => {
        const errorMessages: Record<string, string> = {
          "5206": "Unable to cancel payment. Please contact support.",
          "E10205": "Unable to cancel payment. Please contact support.",
          "5301": "Invalid transaction. Please contact support.",
          "5302": "Payment method not supported.",
          "5303": "Transaction could not be cancelled. Please contact support.",
          "5304": "Request timeout. Please try again.",
          "5305": "Invalid merchant configuration. Please contact support.",
        };

        if (errorCode && errorMessages[errorCode]) {
          return errorMessages[errorCode];
        }
        if (responseCode && errorMessages[responseCode]) {
          return errorMessages[responseCode];
        }

        return responseMsg || "Unable to cancel payment. Please contact support if you need assistance.";
      };

      // Note: state and transactionId are in params object
      const state = responseData.params?.state || responseData.state;
      const transactionId = responseData.params?.transactionId || responseData.transactionId;
      
      // Check for success: responseCode 2001 and state APPROVED (case-insensitive)
      // Handle both string and number responseCode formats
      const responseCodeStr = String(responseData.responseCode || "");
      const stateUpper = state?.toUpperCase();
      const isSuccess = responseCodeStr === "2001" && stateUpper === "APPROVED";
      
      if (isSuccess) {
        console.log("[WaafiPay] Cancel successful:", responseData);
        return {
          success: true,
          transactionId: transactionId,
          state: state,
        };
      } else {
        console.error("[WaafiPay] Cancel rejected:", responseData);
        const friendlyError = getFriendlyErrorMessage(
          responseData.responseCode || "",
          responseData.responseMsg || responseData.message || "",
          responseData.errorCode
        );
        return {
          success: false,
          error: friendlyError,
          responseCode: responseData.responseCode,
          errorCode: responseData.errorCode,
        };
      }
    } catch (error: any) {
      console.error("[WaafiPay] Cancel error:", error);
      throw new Error(error.message || "Failed to cancel transaction");
    }
  },
});

/**
 * OpenAI Food Analysis - Analyze food image using GPT-4 Vision
 * Reads OpenAI API key from Convex environment variables
 */
export const analyzeFoodWithOpenAI = action({
  args: {
    imageBase64: v.string(), // Base64 encoded image
  },
  handler: async (ctx, args) => {
    // Helper function to clean environment variable values
    const cleanEnvVar = (value: string | undefined): string | undefined => {
      if (!value) return undefined;
      // Remove variable name prefix if present (e.g., "OPENAI_API_KEY=sk-..." -> "sk-...")
      const match = value.match(/^[A-Z_]+=(.+)$/);
      return match ? match[1] : value;
    };

    const openaiApiKey = cleanEnvVar(process.env.OPENAI_API_KEY);

    if (!openaiApiKey) {
      console.error("[OpenAI] Missing API key in environment variables");
      throw new Error("OpenAI service not configured. Please add OPENAI_API_KEY to Convex environment variables.");
    }

    try {
      console.log("[OpenAI] Starting food analysis...");

      const prompt = `Analyze this food image and provide detailed nutritional information. 

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format, no additional text:

{
  "isFood": true/false,
  "title": "Name of the food dish",
  "calories": number (total calories),
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams, optional),
  "sugar": number (grams, optional),
  "sodium": number (mg, optional),
  "servingSize": "estimated serving size (e.g., '250g', '1 plate')"
}

If the image does not contain food, set "isFood" to false and set all nutrition values to 0.

For the nutritional values, estimate based on:
- Visual appearance and portion size
- Common serving sizes for that type of food
- Standard nutritional databases

Be as accurate as possible with your estimates. Provide realistic numbers for a typical serving of the food shown.`;

      const requestBody = {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${args.imageBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.2,
      };

      console.log("[OpenAI] Sending request to OpenAI Vision API...");

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[OpenAI] HTTP error', { 
          status: response.status, 
          statusText: response.statusText,
          body: errorText.slice(0, 500) 
        });
        throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
      }

      const responseData = await response.json();
      console.log('[OpenAI] Received response from OpenAI');

      // Extract the text content from OpenAI response
      const content = responseData.choices?.[0]?.message?.content;
      if (!content) {
        console.error('[OpenAI] No content in response', responseData);
        throw new Error('No content in OpenAI response');
      }

      console.log('[OpenAI] Response content:', content);

      // Parse the JSON response
      let nutritionData: any;
      try {
        // Try to extract JSON from the response (in case there's extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          nutritionData = JSON.parse(jsonMatch[0]);
        } else {
          nutritionData = JSON.parse(content);
        }
      } catch (parseError) {
        console.error('[OpenAI] Failed to parse JSON response', { content, error: parseError });
        throw new Error('Failed to parse OpenAI response as JSON');
      }

      console.log('[OpenAI] Parsed nutrition data:', nutritionData);

      // Check if it's food
      if (!nutritionData.isFood) {
        console.warn('[OpenAI] Not food detected');
        return { notFood: true } as const;
      }

      // Calculate health score
      const healthScore = calculateHealthScore({
        calories: nutritionData.calories || 0,
        carbsG: nutritionData.carbs || 0,
        proteinG: nutritionData.protein || 0,
        fatG: nutritionData.fat || 0,
        fiberG: nutritionData.fiber || 0,
        sugarG: nutritionData.sugar || 0,
        sodiumMg: nutritionData.sodium || 0,
      });

      const result = {
        title: nutritionData.title || 'Food',
        calories: Math.round(nutritionData.calories || 0),
        carbsG: Math.round((nutritionData.carbs || 0) * 10) / 10,
        proteinG: Math.round((nutritionData.protein || 0) * 10) / 10,
        fatG: Math.round((nutritionData.fat || 0) * 10) / 10,
        healthScore,
        fiberG: Math.round((nutritionData.fiber || 0) * 10) / 10,
        sugarG: Math.round((nutritionData.sugar || 0) * 10) / 10,
        sodiumMg: Math.round(nutritionData.sodium || 0),
        servingSize: nutritionData.servingSize || '1 serving',
      };

      console.log('[OpenAI] Final result:', result);
      return result;
    } catch (error: any) {
      console.error('[OpenAI] Analysis error:', error);
      throw new Error(error.message || 'Failed to analyze food image');
    }
  },
});

// Helper function to calculate health score
function calculateHealthScore(nutrition: any): number {
  let score = 5; // Start with neutral score
  
  // Protein is good
  if (nutrition.proteinG > 10) score += 2;
  else if (nutrition.proteinG > 5) score += 1;
  
  // Fiber is good
  if (nutrition.fiberG > 3) score += 1;
  
  // Sugar is bad (in moderation)
  if (nutrition.sugarG > 20) score -= 2;
  else if (nutrition.sugarG > 10) score -= 1;
  
  // Sodium is bad (in moderation)
  if (nutrition.sodiumMg > 500) score -= 1;
  
  // Fat balance
  if (nutrition.fatG > 20) score -= 1;
  else if (nutrition.fatG > 10) score += 0;
  else score += 1;
  
  // Ensure score is between 0-10
  return Math.max(0, Math.min(10, score));
}

