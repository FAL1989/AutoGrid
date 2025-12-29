import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Force dynamic rendering because this route uses cookies
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/token
 * Returns the access token for WebSocket authentication.
 * This is needed because httpOnly cookies are not accessible from JavaScript.
 */
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "No access token" },
      { status: 401 }
    );
  }

  return NextResponse.json({ token: accessToken });
}
