import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, UsersRound } from "lucide-react";

import { getClientAppointments, getClientById } from "@/lib/data/clients";
import { getPaymentsForClient } from "@/lib/data/payments";
import { formatCurrency, formatDate } from "@/lib/format";

type RouteParams = Promise<{ id: string }>;

function statusClass(status: string) {
  switch (status) {
    case "upcoming":
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
    case "completed":
      return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
    case "cancelled":
      return "bg-destructive/10 text-destructive dark:bg-destructive/20";
    case "pending":
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default async function ClientDetailPage({
  params,
}: {
  params: RouteParams;
}) {
  const { id } = await params;
  const [client, appointments, payments] = await Promise.all([
    getClientById(id),
    getClientAppointments(id),
    getPaymentsForClient(id),
  ]);

  if (!client) notFound();

  const totalSpent = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/dashboard/clients"
            className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <UsersRound className="size-4" aria-hidden="true" />
            Back to Clients
          </Link>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <p className="text-muted-foreground">
            {client.email} · {client.phone}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
              client.status === "active"
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {client.status}
          </span>
          <Link
            href={`/dashboard/clients/${client.id}/edit`}
            className="rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Edit Client
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground">Total Appointments</p>
          <p className="text-2xl font-bold">{client.totalAppointments}</p>
        </div>
        <div className="rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground">Total Paid</p>
          <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground">Last Visit</p>
          <p className="text-2xl font-bold">
            {client.lastVisit ? formatDate(client.lastVisit) : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-2xl font-bold capitalize">{client.status}</p>
        </div>
      </div>

      <section className="rounded-xl border border-border p-6">
        <h2 className="mb-4 text-sm font-semibold">Contact Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{client.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="size-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">{client.phone}</p>
            </div>
          </div>
          {client.notes && (
            <div className="sm:col-span-2">
              <p className="text-sm font-medium">Notes</p>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {client.notes}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border">
        <div className="border-b border-border bg-muted/50 px-4 py-3">
          <h2 className="text-sm font-semibold">
            Appointment History ({appointments.length})
          </h2>
        </div>
        {appointments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Service</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Time</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">{appointment.service}</td>
                    <td className="px-4 py-3">{formatDate(appointment.date)}</td>
                    <td className="px-4 py-3">{appointment.time}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusClass(appointment.status)}`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(Number(appointment.price))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No appointments yet.
          </div>
        )}
      </section>
    </div>
  );
}
