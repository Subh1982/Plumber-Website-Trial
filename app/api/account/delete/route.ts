import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !publishableKey || !serviceRoleKey || !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authClient = createClient(url, publishableKey, { auth: { persistSession: false } });
  const { data: { user }, error } = await authClient.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteError) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
