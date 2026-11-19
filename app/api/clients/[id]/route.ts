import { NextResponse } from "next/server";

import { requireAuthentication } from "@/lib/auth-session";
import { apiErrorResponse, isRecord, isUuid } from "@/lib/api-utils";
import {
  deleteClient,
  getClientAppointments,
  getClientById,
  updateClient,
} from "@/lib/data/clients";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid client id." }, { status: 400 });
  }

  try {
    const [client, appointments] = await Promise.all([
      getClientById(id),
      getClientAppointments(id),
    ]);

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    return NextResponse.json({ ...client, appointments });
  } catch (error) {
    return apiErrorResponse("Failed to fetch client.", error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid client id." }, { status: 400 });
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
    (body.email !== undefined &&
      (typeof body.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))) ||
    (body.phone !== undefined &&
      (typeof body.phone !== "string" || !body.phone.trim())) ||
    (body.status !== undefined &&
      body.status !== "active" &&
      body.status !== "inactive") ||
    (body.notes !== undefined && typeof body.notes !== "string")
  ) {
    return NextResponse.json(
      { error: "Client details are invalid." },
      { status: 400 },
    );
  }

  try {
    await updateClient(id, {
      ...(typeof body.name === "string" && { name: body.name.trim() }),
      ...(typeof body.email === "string" && {
        email: body.email.trim().toLowerCase(),
      }),
      ...(typeof body.phone === "string" && { phone: body.phone.trim() }),
      ...(body.status === "active" || body.status === "inactive"
        ? { status: body.status }
        : {}),
      ...(typeof body.notes === "string" && { notes: body.notes.trim() }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse("Failed to update client.", error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid client id." }, { status: 400 });
  }

  try {
    await deleteClient(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse("Failed to delete client.", error);
  }
}
