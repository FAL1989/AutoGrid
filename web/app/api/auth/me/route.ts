import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.API_URL || "http://localhost:8000";

interface UserResponse {
  id: string;
  email: string;
  plan: string;
  telegram_chat_id: string | null;
  created_at: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh the token
        const refreshResponse = await fetch(
          `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/auth/refresh`,
          { method: "POST" }
        );

        if (refreshResponse.ok) {
          // Retry with new token
          const newCookieStore = await cookies();
          const newAccessToken = newCookieStore.get("access_token")?.value;

          if (newAccessToken) {
            const retryResponse = await fetch(`${API_BASE_URL}/auth/me`, {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            });

            if (retryResponse.ok) {
              const user: UserResponse = await retryResponse.json();
              return NextResponse.json({ user });
            }
          }
        }

        return NextResponse.json(
          { error: "Session expired" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: response.status }
      );
    }

    const user: UserResponse = await response.json();
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
