import { cookies } from "next/headers";
import {
  adminCookie,
  expectedAdminSession,
  verifyAdminPassword,
} from "@/lib/server/admin-auth";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
  if (!password || !verifyAdminPassword(password)) {
    return Response.json({ error: "That admin password was not accepted." }, { status: 401 });
  }

  const token = expectedAdminSession();
  if (!token) {
    return Response.json(
      { error: "Admin access is not configured for this environment." },
      { status: 503 },
    );
  }
  (await cookies()).set(adminCookie.name, token, adminCookie.options);
  return Response.json({ authenticated: true });
}

export async function DELETE() {
  (await cookies()).set(adminCookie.name, "", {
    ...adminCookie.options,
    maxAge: 0,
  });
  return new Response(null, { status: 204 });
}
