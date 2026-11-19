import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  UsersRound,
} from "lucide-react";

import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { getAppointments } from "@/lib/data/appointments";
import { getClients } from "@/lib/data/clients";
import { getPayments } from "@/lib/data/payments";
import { getServices } from "@/lib/data/services";
import { formatCurrency, formatDate } from "@/lib/format";
import { getToday } from "@/lib/data/today";

function getStatusClass(status: string) {
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

export default async function DashboardPage() {
  const [appointments, clients, services, payments, today] = await Promise.all([
    getAppointments(),
    getClients(),
    getServices(),
    getPayments(),
    getToday(),
  ]);

  const totalRevenue = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "upcoming" &&
      appointment.date >= today,
  ).length;
  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed",
  ).length;
  const recentAppointments = [...appointments]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your appointments and business performance.
        </p>
      </header>

      <StatsGrid
        stats={[
          {
            title: "Total Appointments",
            value: appointments.length,
            subtitle: "All time",
            icon: CalendarArrowRight,
            variant: "default",
          },
          {
            title: "Upcoming",
            value: upcomingAppointments,
            subtitle: "Scheduled",
            icon: CalendarDays,
            variant: "primary",
          },
          {
            title: "Completed",
            value: completedAppointments,
            subtitle: "All time",
            icon: CheckCircle2,
            variant: "success",
          },
          {
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            subtitle: "Payments received",
            icon: CreditCard,
            variant: "success",
          },
          {
            title: "Clients",
            value: clients.length,
            subtitle: "In your client list",
            icon: UsersRound,
            variant: "default",
          },
          {
            title: "Services",
            value: services.filter((service) => service.active).length,
            subtitle: "Active services",
            icon: BriefcaseBusiness,
            variant: "default",
          },
        ]}
      />

      <QuickActions
        actions={[
          {
            label: "New Appointment",
            href: "/dashboard/appointments/new",
            icon: CalendarArrowRight,
          },
          {
            label: "Add Client",
            href: "/dashboard/clients/new",
            icon: UsersRound,
          },
          {
            label: "Set Availability",
            href: "/dashboard/availability",
            icon: Clock3,
          },
          {
            label: "Manage Services",
            href: "/dashboard/services",
            icon: BriefcaseBusiness,
          },
          {
            label: "View Payments",
            href: "/dashboard/payments",
            icon: CreditCard,
          },
          {
            label: "Calendar View",
            href: "/dashboard/calendar",
            icon: CalendarDays,
          },
        ]}
      />

      <section className="rounded-xl border border-border p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold">Recent Appointments</h2>
          <Link
            href="/dashboard/appointments"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {recentAppointments.length ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Service</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Time</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((appointment) => (
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
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getStatusClass(appointment.status)}`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(Number(appointment.price))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">
              No appointments yet. Create your first one to get started.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
