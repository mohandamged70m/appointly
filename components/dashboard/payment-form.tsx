"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type ClientOption = { id: string; name: string };
type ServiceOption = { id: string; name: string; price: number };
type AppointmentOption = {
  id: string;
  clientId: string | null;
  clientName: string;
  service: string;
  price: number;
  date: string;
};

export function PaymentForm({
  clients,
  services,
  appointments,
}: {
  clients: ClientOption[];
  services: ServiceOption[];
  appointments: AppointmentOption[];
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedClient = clients.find((client) => client.id === clientId);
  const selectedAppointment = appointments.find(
    (appointment) => appointment.id === appointmentId,
  );
  const availableAppointments = appointments.filter(
    (appointment) => appointment.clientId === clientId,
  );

  function chooseAppointment(id: string) {
    setAppointmentId(id);
    const appointment = appointments.find((item) => item.id === id);
    if (!appointment) {
      setService("");
      setAmount("");
      return;
    }
    setService(appointment.service);
    setAmount(String(appointment.price));
    setDate(appointment.date);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedClient) {
      setError("Select a client.");
      return;
    }

    setIsSaving(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          service,
          amount: Number(amount),
          date,
          status: formData.get("status"),
          method: formData.get("method"),
          appointmentId: selectedAppointment?.id ?? null,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Could not record payment.");
      }

      router.push("/dashboard/payments");
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not record payment.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-border p-6"
    >
      <label className="flex flex-col gap-2 text-sm font-medium">
        Client
        <select
          value={clientId}
          required
          onChange={(event) => {
            setClientId(event.target.value);
            setAppointmentId("");
            setService("");
            setAmount("");
          }}
          className="rounded-md border border-input bg-background px-3 py-2 font-normal"
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Appointment (optional)
        <select
          value={appointmentId}
          disabled={!clientId || !availableAppointments.length}
          onChange={(event) => chooseAppointment(event.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 font-normal disabled:opacity-50"
        >
          <option value="">No linked appointment</option>
          {availableAppointments.map((appointment) => (
            <option key={appointment.id} value={appointment.id}>
              {appointment.date} · {appointment.service}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Service
          <input
            list="payment-service-options"
            value={service}
            required
            onChange={(event) => {
              const nextService = event.target.value;
              setService(nextService);
              const match = services.find((item) => item.name === nextService);
              if (match) setAmount(String(match.price));
            }}
            disabled={Boolean(selectedAppointment)}
            className="rounded-md border border-input bg-background px-3 py-2 font-normal disabled:opacity-50"
          />
          <datalist id="payment-service-options">
            {services.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Amount (USD)
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Date
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Method
          <select
            name="method"
            defaultValue="card"
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          >
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Status
          <select
            name="status"
            defaultValue="paid"
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/payments")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving || !service || !amount}>
          {isSaving ? "Saving..." : "Record Payment"}
        </Button>
      </div>
    </form>
  );
}
