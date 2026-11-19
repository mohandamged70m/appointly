import { NextResponse } from "next/server";

import { requireAuthentication } from "@/lib/auth-session";
import { apiErrorResponse, isRecord, isTime } from "@/lib/api-utils";
import {
  getAvailability,
  upsertAvailability,
  type AvailabilityInput,
} from "@/lib/data/availability";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export async function GET() {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  try {
    return NextResponse.json(await getAvailability());
  } catch (error) {
    return apiErrorResponse("Failed to fetch availability.", error);
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    !Array.isArray(body) ||
    body.length !== days.length ||
    !body.every(
      (slot): slot is AvailabilityInput =>
        isRecord(slot) &&
        days.includes(String(slot.day)) &&
        typeof slot.isAvailable === "boolean" &&
        (slot.isAvailable
          ? isTime(slot.startTime) &&
            isTime(slot.endTime) &&
            slot.startTime < slot.endTime
          : (slot.startTime === "" || isTime(slot.startTime)) &&
            (slot.endTime === "" || isTime(slot.endTime))),
    ) ||
    new Set(body.map((slot) => slot.day)).size !== days.length
  ) {
    return NextResponse.json(
      { error: "Provide valid availability for each day of the week." },
      { status: 400 },
    );
  }

  try {
    await upsertAvailability(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse("Failed to save availability.", error);
  }
}
