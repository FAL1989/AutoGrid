import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force dynamic rendering because this route uses cookies
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.API_URL || "http://localhost:8000";

interface TokenResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token found" },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      // Clear invalid cookies
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");

      return NextResponse.json(
        { error: "Token refresh failed" },
        { status: 401 }
      );
    }

    const data: TokenResponse = await response.json();

    // Update cookies with new tokens
    cookieStore.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({
      success: true,
      user_id: data.user_id,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
