import { NextResponse } from "next/server";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isTime(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)
  );
}

export function apiErrorResponse(message: string, error: unknown) {
  console.error(message, error);
  return NextResponse.json({ error: message }, { status: 500 });
}
