import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    console.log("Connecting to database...");
    const result = await query("SELECT NOW()");
    console.log("Database response:", result);
    return NextResponse.json({ success: true, timestamp: result[0] });
  } catch (error) {
    console.error("Database connection failed:", error);
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
  }
}
