import axios from "axios";
import qs from "qs";

// Define API request and response types
interface ApiRequest {
  method?: string;
  body?: any;
  headers?: { [key: string]: string | string[] | undefined };
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: (data?: any) => void;
}

export const config = {
  api: {
    bodyParser: true,
    sizeLimit: "1mb",
  },
};

async function getAccessToken() {
  const tokenResponse = await axios.post(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    qs.stringify({
      client_id: process.env.OUTLOOK_CLIENT_ID,
      client_secret: process.env.OUTLOOK_CLIENT_SECRET,
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN,
      grant_type: "refresh_token",
      scope: "https://graph.microsoft.com/.default", // Only .default here
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return tokenResponse.data.access_token;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { name, email, message } = req.body || {};
  if (!name || !email || !message)
    return res.status(400).json({ message: "Missing required fields" });

  try {
    const accessToken = await getAccessToken();

    await axios.post(
      "https://graph.microsoft.com/v1.0/me/sendMail",
      {
        message: {
          subject: `📩 New message from ${name} via website`,
          body: {
            contentType: "HTML",
            content: `
              <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h2 style="color: #4ec9b0;">New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Message:</strong></p>
                <div style="padding: 10px; border-left: 4px solid #007acc; background: #f5f5f5;">
                  ${message.replace(/\n/g, "<br>")}
                </div>
                <hr>
                <p style="font-size: 12px; color: #666;">This message was sent via the website contact form.</p>
              </div>
            `,
          },
          toRecipients: [{ emailAddress: { address: process.env.EMAIL_USER } }],
        },
        saveToSentItems: "true",
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log("Email sent successfully via Graph API!");
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error: any) {
    console.error("Email sending failed via Graph API:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to send email", error: String(error) });
  }
}
