import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force dynamic rendering because this route uses cookies
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.API_URL || "http://localhost:8000";

interface RegisterRequest {
  email: string;
  password: string;
}

interface TokenResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface ApiError {
  detail: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: "Registration failed",
      }));
      return NextResponse.json(
        { error: error.detail || "Registration failed" },
        { status: response.status }
      );
    }

    const data: TokenResponse = await response.json();

    // Set httpOnly cookies for tokens
    const cookieStore = await cookies();

    // Refresh token - httpOnly, long-lived
    cookieStore.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Access token - httpOnly, short-lived
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
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
