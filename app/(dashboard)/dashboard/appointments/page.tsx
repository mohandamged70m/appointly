import Link from "next/link";
import { CalendarArrowRight } from "lucide-react";

import { AppointmentActions } from "@/components/dashboard/appointment-actions";
import { getAppointments } from "@/lib/data/appointments";
import { formatCurrency, formatDate } from "@/lib/format";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

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

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = firstValue(params.status);
  const from = firstValue(params.from);
  const to = firstValue(params.to);
  const query = firstValue(params.q).trim().toLowerCase();
  const appointments = await getAppointments();
  const filteredAppointments = appointments.filter((appointment) => {
    if (status && appointment.status !== status) return false;
    if (from && appointment.date < from) return false;
    if (to && appointment.date > to) return false;
    if (
      query &&
      !`${appointment.clientName} ${appointment.clientEmail} ${appointment.service}`
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            Manage all your appointments and bookings.
          </p>
        </div>
        <Link
          href="/dashboard/appointments/new"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/80"
        >
          <CalendarArrowRight className="size-4" aria-hidden="true" />
          New Appointment
        </Link>
      </header>

      <form
        method="get"
        className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_2fr_auto_auto]"
      >
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Status
          <select
            name="status"
            defaultValue={status}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">All statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          From
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          To
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Search
          <input
            type="search"
            name="q"
            placeholder="Client or service"
            defaultValue={firstValue(params.q)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <button
          type="submit"
          className="self-end rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Filter
        </button>
        <Link
          href="/dashboard/appointments"
          className="self-end rounded-md border border-input px-4 py-2 text-center text-sm font-medium"
        >
          Clear
        </Link>
      </form>

      <section className="overflow-hidden rounded-xl border border-border">
        {filteredAppointments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Service</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Time</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{appointment.clientName}</div>
                      <div className="text-xs text-muted-foreground">
                        {appointment.clientEmail}
                      </div>
                    </td>
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
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(Number(appointment.price))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AppointmentActions
                        id={appointment.id}
                        status={appointment.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No appointments match these filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
