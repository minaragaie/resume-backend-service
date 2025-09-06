// /pages/api/auth/callback.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import qs from "qs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Missing code in query parameters" });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      qs.stringify({
        client_id: process.env.OUTLOOK_CLIENT_ID,
        client_secret: process.env.OUTLOOK_CLIENT_SECRET,
        code,
        redirect_uri: "https://resume-backend-service.vercel.app/api/auth/callback",
        grant_type: "authorization_code",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Save the refresh_token somewhere secure (DB or environment variable)
    console.log("Refresh token:", refresh_token);

    res.status(200).json({
      message: "Tokens received successfully",
      access_token,
      refresh_token,
      expires_in,
    });
  } catch (error: any) {
    console.error("Error exchanging code:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to exchange code for tokens" });
  }
}
