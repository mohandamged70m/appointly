import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PaymentForm } from "@/components/dashboard/payment-form";
import { getAppointments } from "@/lib/data/appointments";
import { getClients } from "@/lib/data/clients";
import { getActiveServices } from "@/lib/data/services";

export default async function NewPaymentPage() {
  const [clients, services, appointments] = await Promise.all([
    getClients(),
    getActiveServices(),
    getAppointments(),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <Link
          href="/dashboard/payments"
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to payments
        </Link>
        <h1 className="text-2xl font-bold">Record Payment</h1>
        <p className="text-muted-foreground">
          Add a payment and optionally link it to an appointment.
        </p>
      </header>

      <PaymentForm
        clients={clients.map(({ id, name }) => ({ id, name }))}
        services={services.map(({ id, name, price }) => ({
          id,
          name,
          price: Number(price),
        }))}
        appointments={appointments
          .filter((appointment) => appointment.status !== "cancelled")
          .map((appointment) => ({
            id: appointment.id,
            clientId: appointment.clientId,
            clientName: appointment.clientName,
            service: appointment.service,
            price: Number(appointment.price),
            date: appointment.date,
          }))}
      />
    </div>
  );
}
