import { NextResponse } from "next/server";

import { requireAuthentication } from "@/lib/auth-session";
import { apiErrorResponse, isRecord } from "@/lib/api-utils";
import {
  createService,
  getActiveServices,
  getServices,
} from "@/lib/data/services";

export async function GET(request: Request) {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  try {
    const activeOnly = new URL(request.url).searchParams.get("active") === "true";
    return NextResponse.json(
      activeOnly ? await getActiveServices() : await getServices(),
    );
  } catch (error) {
    return apiErrorResponse("Failed to fetch services.", error);
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
    typeof body.description !== "string" ||
    typeof body.duration !== "number" ||
    !Number.isInteger(body.duration) ||
    body.duration <= 0 ||
    typeof body.price !== "number" ||
    !Number.isFinite(body.price) ||
    body.price < 0 ||
    (body.active !== undefined && typeof body.active !== "boolean")
  ) {
    return NextResponse.json(
      { error: "Service details are incomplete or invalid." },
      { status: 400 },
    );
  }

  try {
    const service = await createService({
      name: body.name,
      description: body.description,
      duration: body.duration,
      price: body.price,
      active: body.active !== false,
    });

    return NextResponse.json({ id: service.id }, { status: 201 });
  } catch (error) {
    return apiErrorResponse("Failed to create service.", error);
  }
}
