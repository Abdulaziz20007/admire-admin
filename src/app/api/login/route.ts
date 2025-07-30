import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (username === "admin" && password === "admin") {
    return NextResponse.json({ message: "Login successful" });
  } else {
    return NextResponse.json(
      { message: "Invalid username or password" },
      { status: 401 }
    );
  }
}
