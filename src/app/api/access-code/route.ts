import { NextResponse } from "next/server";
import { unlockedStageIds } from "@/lib/access-codes";

export async function POST(request: Request) {
  let code: unknown;
  try {
    ({ code } = (await request.json()) as { code?: unknown });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const stageIds = typeof code === "string" ? unlockedStageIds([code]) : [];
  if (stageIds.length === 0) {
    return NextResponse.json(
      { error: "That access code isn't valid." },
      { status: 400 },
    );
  }
  return NextResponse.json({ stageIds });
}
