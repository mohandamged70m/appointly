import { NextResponse } from "next/server";

import { requireAuthentication } from "@/lib/auth-session";
import { apiErrorResponse, isRecord, isUuid } from "@/lib/api-utils";
import {
  deleteService,
  getServiceById,
  updateService,
} from "@/lib/data/services";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid service id." }, { status: 400 });
  }

  try {
    const service = await getServiceById(id);
    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    return apiErrorResponse("Failed to fetch service.", error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid service id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    !isRecord(body) ||
    (body.name !== undefined &&
      (typeof body.name !== "string" || !body.name.trim())) ||
    (body.description !== undefined && typeof body.description !== "string") ||
    (body.duration !== undefined &&
      (typeof body.duration !== "number" ||
        !Number.isInteger(body.duration) ||
        body.duration <= 0)) ||
    (body.price !== undefined &&
      (typeof body.price !== "number" ||
        !Number.isFinite(body.price) ||
        body.price < 0)) ||
    (body.active !== undefined && typeof body.active !== "boolean")
  ) {
    return NextResponse.json(
      { error: "Service details are invalid." },
      { status: 400 },
    );
  }

  try {
    await updateService(id, {
      ...(typeof body.name === "string" && { name: body.name.trim() }),
      ...(typeof body.description === "string" && {
        description: body.description.trim(),
      }),
      ...(typeof body.duration === "number" && { duration: body.duration }),
      ...(typeof body.price === "number" && { price: body.price }),
      ...(typeof body.active === "boolean" && { active: body.active }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse("Failed to update service.", error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid service id." }, { status: 400 });
  }

  try {
    await deleteService(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse("Failed to delete service.", error);
  }
}
