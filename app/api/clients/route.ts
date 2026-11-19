import { NextResponse } from "next/server";

import { requireAuthentication } from "@/lib/auth-session";
import { apiErrorResponse, isRecord } from "@/lib/api-utils";
import { createClient, getClients } from "@/lib/data/clients";

export async function GET() {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  try {
    return NextResponse.json(await getClients());
  } catch (error) {
    return apiErrorResponse("Failed to fetch clients.", error);
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    !isRecord(body) ||
    typeof body.name !== "string" ||
    !body.name.trim() ||
    typeof body.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ||
    typeof body.phone !== "string" ||
    !body.phone.trim() ||
    (body.status !== undefined &&
      body.status !== "active" &&
      body.status !== "inactive") ||
    (body.notes !== undefined && typeof body.notes !== "string")
  ) {
    return NextResponse.json(
      { error: "Client details are incomplete or invalid." },
      { status: 400 },
    );
  }

  try {
    const client = await createClient({
      name: body.name,
      email: body.email,
      phone: body.phone,
      status: body.status === "inactive" ? "inactive" : "active",
      notes: typeof body.notes === "string" ? body.notes : undefined,
    });

    return NextResponse.json({ id: client.id }, { status: 201 });
  } catch (error) {
    return apiErrorResponse("Failed to create client.", error);
  }
}
