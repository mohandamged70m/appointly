"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Appointment } from "@/lib/data/appointments";
import type { AvailabilityInput } from "@/lib/data/availability";
import type { Client } from "@/lib/data/clients";
import type { Service } from "@/lib/data/services";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function localDateValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function minutesFromTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

async function fetchList<T>(path: string): Promise<T[]> {
  const response = await fetch(path);
  const result: unknown = await response.json();

  if (!response.ok || !Array.isArray(result)) {
    const message =
      typeof result === "object" && result !== null && "error" in result
        ? String(result.error)
        : "Could not load appointment data.";
    throw new Error(message);
  }

  return result as T[];
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<AvailabilityInput[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [quickAddError, setQuickAddError] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [clientList, serviceList, slots, appointmentList] =
          await Promise.all([
            fetchList<Client>("/api/clients"),
            fetchList<Service>("/api/services?active=true"),
            fetchList<AvailabilityInput>("/api/availability"),
            fetchList<Appointment>("/api/appointments"),
          ]);

        if (!active) return;
        setClients(clientList);
        setServices(serviceList);
        setAvailability(slots);
        setAppointments(appointmentList);
      } catch (requestError) {
        if (active) {
          setLoadError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load appointment data.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, []);

  const selectedClient = clients.find((client) => client.id === clientId);
  const selectedService = services.find((service) => service.id === serviceId);

  const timeSlots = useMemo(() => {
    if (!date || !selectedService) return [];

    const selectedDate = new Date(`${date}T12:00:00`);
    const day = dayNames[selectedDate.getDay()];
    const schedule = availability.find((slot) => slot.day === day);
    if (!schedule?.isAvailable || !schedule.startTime || !schedule.endTime) {
      return [];
    }

    const start = minutesFromTime(schedule.startTime);
    const end = minutesFromTime(schedule.endTime);
    const serviceDuration = selectedService.duration;
    const isToday = date === localDateValue();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const existing = appointments
      .filter(
        (appointment) =>
          appointment.date === date &&
          appointment.status !== "cancelled",
      )
      .map((appointment) => {
        const bookedService = services.find(
          (service) => service.id === appointment.serviceId,
        );
        const appointmentStart = minutesFromTime(appointment.time);
        return {
          start: appointmentStart,
          end: appointmentStart + (bookedService?.duration ?? 30),
        };
      });

    const slots: string[] = [];
    for (let slotStart = start; slotStart + serviceDuration <= end; slotStart += 15) {
      const slotEnd = slotStart + serviceDuration;
      if (isToday && slotStart <= currentMinutes) continue;
      if (existing.some((booked) => slotStart < booked.end && booked.start < slotEnd)) {
        continue;
      }

      slots.push(
        `${String(Math.floor(slotStart / 60)).padStart(2, "0")}:${String(slotStart % 60).padStart(2, "0")}`,
      );
    }
    return slots;
  }, [appointments, availability, date, selectedService, services]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedClient || !selectedService || !time) {
      setError("Select a client, service, date, and available time.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          serviceId: selectedService.id,
          date,
          time,
          notes,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Could not create appointment.");
      }

      router.push("/dashboard/appointments");
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not create appointment.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleQuickAddClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuickAddError("");
    setIsAddingClient(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Could not add client.");
      }

      const newClient: Client = {
        id: result.id,
        name: String(formData.get("name")).trim(),
        email: String(formData.get("email")).trim().toLowerCase(),
        phone: String(formData.get("phone")).trim(),
        totalAppointments: 0,
        lastVisit: null,
        status: "active",
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setClients((current) =>
        [...current, newClient].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setClientId(newClient.id);
      form.reset();
    } catch (requestError) {
      setQuickAddError(
        requestError instanceof Error
          ? requestError.message
          : "Could not add client.",
      );
    } finally {
      setIsAddingClient(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground">
        Loading appointment form...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-destructive/30 p-6 text-sm text-destructive" role="alert">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">New Appointment</h1>
          <p className="text-muted-foreground">
            Book a client during your configured availability.
          </p>
        </div>
        <Link
          href="/dashboard/appointments"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Appointments
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-border p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Client
            <select
              required
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 font-normal"
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Service
            <select
              required
              value={serviceId}
              onChange={(event) => {
                setServiceId(event.target.value);
                setTime("");
              }}
              className="rounded-md border border-input bg-background px-3 py-2 font-normal"
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} — ${Number(service.price).toFixed(2)} ({service.duration} min)
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Date
            <input
              type="date"
              required
              min={localDateValue()}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setTime("");
              }}
              className="rounded-md border border-input bg-background px-3 py-2 font-normal"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Available time
            <select
              required
              value={time}
              disabled={!timeSlots.length}
              onChange={(event) => setTime(event.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 font-normal disabled:opacity-50"
            >
              <option value="">Select a time</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            {date && selectedService && !timeSlots.length && (
              <span className="text-xs text-muted-foreground">
                No open times for this service on the selected date.
              </span>
            )}
          </label>
        </div>

        <label className="flex flex-col gap-2 border-t border-border/70 pt-5 text-sm font-medium">
          Notes
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional instructions for this appointment"
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          />
        </label>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/appointments")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSaving ||
              !clientId ||
              !serviceId ||
              !date ||
              !time ||
              !timeSlots.includes(time)
            }
          >
            {isSaving ? "Booking..." : "Create Appointment"}
          </Button>
        </div>
      </form>

      <section className="rounded-xl border border-border p-6">
        <h2 className="mb-2 text-sm font-semibold">Quick Add Client</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Add a client without leaving this page.
        </p>
        <form
          onSubmit={handleQuickAddClient}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <input
            name="name"
            required
            placeholder="Client name"
            aria-label="Client name"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            aria-label="Client email"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            name="phone"
            type="tel"
            required
            placeholder="Phone"
            aria-label="Client phone"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button type="submit" disabled={isAddingClient}>
            <UserPlus className="size-4" aria-hidden="true" />
            {isAddingClient ? "Adding..." : "Add Client"}
          </Button>
        </form>
        {quickAddError && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {quickAddError}
          </p>
        )}
      </section>
    </div>
  );
}
