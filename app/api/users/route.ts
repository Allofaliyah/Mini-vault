
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify the signed-in user using the server-side session.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Get only this user's profile.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, role, is_active, created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup failed:", profileError.message);

      return NextResponse.json(
        { error: "Unable to retrieve your profile." },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      );
    }

    if (profile.is_active === false) {
      return NextResponse.json(
        { error: "Your account is inactive." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          isActive: profile.is_active,
          createdAt: profile.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/users error:", error);

    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
