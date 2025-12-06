import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Deprecated route. Submit via server action." },
    { status: 410 }
  );
}
