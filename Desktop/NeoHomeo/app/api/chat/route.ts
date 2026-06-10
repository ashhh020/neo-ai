import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, serviceClient as supabase } from "@/lib/supabase/api-auth";

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
  const threadId = searchParams.get("threadId");

  if (threadId) {
    // Return full thread with messages
    const { data: thread } = await supabase
      .from("chat_threads")
      .select("*")
      .eq("id", threadId)
      .eq("user_id", user.id)
      .single();

    if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: messages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    return NextResponse.json({ thread, messages: messages ?? [] });
  }

  // List all threads for user
  const { data: threads } = await (supabase as any)
    .from("chat_threads")
    .select("id, title, mode, message_count, updated_at, created_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return NextResponse.json({ threads: threads ?? [] });
}

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
  const { type } = body;

  if (type === "thread") {
    const { title, mode = "general" } = body;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: user.id, title: title || "New conversation", mode, message_count: 0 })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ thread: data });
  }

  if (type === "message") {
    const { threadId, role, content } = body;
    if (!threadId || !role || !content) {
      return NextResponse.json({ error: "threadId, role, content required" }, { status: 400 });
    }

    // Insert message
    const { data: msg, error } = await supabase
      .from("chat_messages")
      .insert({ thread_id: threadId, role, content })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update thread updated_at
    await supabase.from("chat_threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", threadId)
      .eq("user_id", user.id);

    // Simpler: just update updated_at directly
    await supabase
      .from("chat_threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", threadId)
      .eq("user_id", user.id);

    return NextResponse.json({ message: msg });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
    const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
  const threadId = searchParams.get("threadId");
  if (!threadId) return NextResponse.json({ error: "threadId required" }, { status: 400 });

  // Delete messages first (cascade may not be set)
  await supabase.from("chat_messages").delete().eq("thread_id", threadId);

  const { error } = await (supabase as any)
    .from("chat_threads")
    .delete()
    .eq("id", threadId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
