import { NextResponse } from "next/server";

import { requireAuthentication } from "@/lib/auth-session";
import { apiErrorResponse, isIsoDate, isRecord, isTime, isUuid } from "@/lib/api-utils";
import {
  createAppointment,
  getAppointments,
  getAppointmentsByDate,
} from "@/lib/data/appointments";
import { getAvailabilityByDay } from "@/lib/data/availability";
import { getClientById } from "@/lib/data/clients";
import { getServices, getServiceById } from "@/lib/data/services";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export async function GET() {
  const unauthorized = await requireAuthentication();
  if (unauthorized) return unauthorized;

  try {
    return NextResponse.json(await getAppointments());
  } catch (error) {
    return apiErrorResponse("Failed to fetch appointments.", error);
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
    !isUuid(body.serviceId) ||
    !isIsoDate(body.date) ||
    !isTime(body.time) ||
    (body.notes !== undefined && typeof body.notes !== "string")
  ) {
    return NextResponse.json(
      { error: "Appointment details are incomplete or invalid." },
      { status: 400 },
    );
  }

  try {
    const weekday = days[new Date(`${body.date}T12:00:00`).getDay()];
    const [client, service, schedule, existingAppointments, services] =
      await Promise.all([
        getClientById(body.clientId),
        getServiceById(body.serviceId),
        getAvailabilityByDay(weekday),
        getAppointmentsByDate(body.date),
        getServices(),
      ]);

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }
    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }
    if (!service.active) {
      return NextResponse.json(
        { error: "This service is inactive." },
        { status: 409 },
      );
    }
    if (!schedule?.isAvailable || !schedule.startTime || !schedule.endTime) {
      return NextResponse.json(
        { error: "The business is closed on that date." },
        { status: 409 },
      );
    }

    const startMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };
    const requestedStart = startMinutes(body.time);
    const requestedEnd = requestedStart + service.duration;
    if (
      requestedStart < startMinutes(schedule.startTime) ||
      requestedEnd > startMinutes(schedule.endTime)
    ) {
      return NextResponse.json(
        { error: "The selected time is outside working hours." },
        { status: 409 },
      );
    }

    const serviceDurations = new Map(
      services.map((item) => [item.id, item.duration]),
    );
    const hasConflict = existingAppointments.some((appointment) => {
      if (appointment.status === "cancelled") return false;
      const appointmentStart = startMinutes(appointment.time);
      const appointmentDuration =
        serviceDurations.get(appointment.serviceId ?? "") ?? 30;
      return (
        requestedStart < appointmentStart + appointmentDuration &&
        appointmentStart < requestedEnd
      );
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: "That time overlaps another appointment." },
        { status: 409 },
      );
    }

    const appointment = await createAppointment({
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      service: service.name,
      serviceId: service.id,
      date: body.date,
      time: body.time,
      status: "upcoming",
      price: Number(service.price),
      notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
    });

    return NextResponse.json({ id: appointment.id }, { status: 201 });
  } catch (error) {
    return apiErrorResponse("Failed to create appointment.", error);
  }
}
