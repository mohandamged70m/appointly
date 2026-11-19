import { NextResponse } from "next/server";

import { requireAuthentication } from "@/lib/auth-session";
import { apiErrorResponse, isIsoDate, isRecord, isTime, isUuid } from "@/lib/api-utils";
import {
  deleteAppointment,
  updateAppointment,
  type AppointmentStatus,
} from "@/lib/data/appointments";

type RouteContext = { params: Promise<{ id: string }> };
const statuses: AppointmentStatus[] = [
  "upcoming",
  "completed",
  "cancelled",
  "pending",
];

function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return typeof value === "string" && statuses.some((status) => status === value);
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json(
      { error: "Invalid appointment id." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    !isRecord(body) ||
    (body.status !== undefined && !isAppointmentStatus(body.status)) ||
    (body.date !== undefined && !isIsoDate(body.date)) ||
    (body.time !== undefined && !isTime(body.time)) ||
    (body.notes !== undefined && typeof body.notes !== "string")
  ) {
    return NextResponse.json(
      { error: "Appointment details are invalid." },
      { status: 400 },
    );
  }

  try {
    await updateAppointment(id, {
      ...(isAppointmentStatus(body.status) && {
        status: body.status,
      }),
      ...(typeof body.date === "string" && { date: body.date }),
      ...(typeof body.time === "string" && { time: body.time }),
      ...(typeof body.notes === "string" && { notes: body.notes.trim() || null }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse("Failed to update appointment.", error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json(
      { error: "Invalid appointment id." },
      { status: 400 },
    );
  }

  try {
    await deleteAppointment(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse("Failed to delete appointment.", error);
  }
}
