// /pages/api/auth/callback.ts
import axios from "axios";
import qs from "qs";

// Define API request and response types
interface ApiRequest {
  method?: string;
  body?: any;
  query?: { [key: string]: string | string[] | undefined };
  headers?: { [key: string]: string | string[] | undefined };
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: (data?: any) => void;
  redirect: (url: string) => void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const code = req.query?.code;

  console.log('code', code);

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
