import { NextResponse } from "next/server";

import { requireAuthentication } from "@/lib/auth-session";
import { apiErrorResponse, isIsoDate, isRecord, isUuid } from "@/lib/api-utils";
import {
  deletePayment,
  updatePayment,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/data/payments";

type RouteContext = { params: Promise<{ id: string }> };
const statuses: PaymentStatus[] = ["paid", "pending", "refunded"];
const methods: PaymentMethod[] = ["card", "cash", "transfer"];

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return typeof value === "string" && statuses.some((status) => status === value);
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && methods.some((method) => method === value);
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid payment id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    !isRecord(body) ||
    (body.status !== undefined && !isPaymentStatus(body.status)) ||
    (body.method !== undefined && !isPaymentMethod(body.method)) ||
    (body.amount !== undefined &&
      (typeof body.amount !== "number" ||
        !Number.isFinite(body.amount) ||
        body.amount < 0)) ||
    (body.date !== undefined && !isIsoDate(body.date))
  ) {
    return NextResponse.json(
      { error: "Payment details are invalid." },
      { status: 400 },
    );
  }

  try {
    await updatePayment(id, {
      ...(isPaymentStatus(body.status) && {
        status: body.status,
      }),
      ...(isPaymentMethod(body.method) && {
        method: body.method,
      }),
      ...(typeof body.amount === "number" && { amount: body.amount }),
      ...(typeof body.date === "string" && { date: body.date }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse("Failed to update payment.", error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid payment id." }, { status: 400 });
  }

  try {
    await deletePayment(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse("Failed to delete payment.", error);
  }
}
