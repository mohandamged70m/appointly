import { NextResponse } from "next/server";

import { requireAuthentication } from "@/lib/auth-session";
import {
  apiErrorResponse,
  isIsoDate,
  isRecord,
  isUuid,
} from "@/lib/api-utils";
import {
  createPayment,
  getPayments,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/data/payments";
import { getAppointmentById } from "@/lib/data/appointments";
import { getClientById } from "@/lib/data/clients";

const paymentStatuses: PaymentStatus[] = ["paid", "pending", "refunded"];
const paymentMethods: PaymentMethod[] = ["card", "cash", "transfer"];

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return (
    typeof value === "string" &&
    paymentStatuses.some((status) => status === value)
  );
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    paymentMethods.some((method) => method === value)
  );
}

export async function GET() {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  try {
    return NextResponse.json(await getPayments());
  } catch (error) {
    return apiErrorResponse("Failed to fetch payments.", error);
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
    !isUuid(body.clientId) ||
    typeof body.service !== "string" ||
    !body.service.trim() ||
    typeof body.amount !== "number" ||
    !Number.isFinite(body.amount) ||
    body.amount < 0 ||
    !isIsoDate(body.date) ||
    !isPaymentStatus(body.status) ||
    !isPaymentMethod(body.method) ||
    (body.appointmentId !== undefined &&
      body.appointmentId !== null &&
      !isUuid(body.appointmentId))
  ) {
    return NextResponse.json(
      { error: "Payment details are incomplete or invalid." },
      { status: 400 },
    );
  }

  try {
    const [client, appointment] = await Promise.all([
      getClientById(body.clientId),
      isUuid(body.appointmentId)
        ? getAppointmentById(body.appointmentId)
        : Promise.resolve(null),
    ]);

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }
    if (
      isUuid(body.appointmentId) &&
      (!appointment || appointment.clientId !== client.id)
    ) {
      return NextResponse.json(
        { error: "Appointment does not belong to this client." },
        { status: 400 },
      );
    }

    const payment = await createPayment({
      clientName: client.name,
      clientId: client.id,
      service: appointment?.service ?? body.service.trim(),
      amount: body.amount,
      date: body.date,
      status: body.status,
      method: body.method,
      appointmentId: isUuid(body.appointmentId) ? body.appointmentId : null,
    });

    return NextResponse.json({ id: payment.id }, { status: 201 });
  } catch (error) {
    return apiErrorResponse("Failed to create payment.", error);
  }
}
