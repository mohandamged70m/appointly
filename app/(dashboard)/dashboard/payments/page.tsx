import Link from "next/link";
import { Plus } from "lucide-react";

import { PaymentActions } from "@/components/dashboard/payment-actions";
import { getPayments } from "@/lib/data/payments";
import { formatCurrency, formatDate } from "@/lib/format";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function statusClass(status: string) {
  switch (status) {
    case "paid":
      return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
    case "pending":
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400";
    case "refunded":
      return "bg-destructive/10 text-destructive dark:bg-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const statusFilter = firstValue(params.status);
  const payments = await getPayments();
  const visiblePayments = payments.filter(
    (payment) => !statusFilter || payment.status === statusFilter,
  );
  const totalPaid = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalPending = payments
    .filter((payment) => payment.status === "pending")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalRefunded = payments
    .filter((payment) => payment.status === "refunded")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Track payments, refunds, and outstanding balances.
          </p>
        </div>
        <Link
          href="/dashboard/payments/new"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/80"
        >
          <Plus className="size-4" aria-hidden="true" />
          Record Payment
        </Link>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Total Collected", amount: totalPaid, color: "text-green-600" },
          { title: "Pending", amount: totalPending, color: "text-amber-600" },
          { title: "Refunded", amount: totalRefunded, color: "text-destructive" },
        ].map((stat) => (
          <div key={stat.title} className="rounded-xl border border-border p-5">
            <p className={`text-sm font-medium ${stat.color}`}>{stat.title}</p>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(stat.amount)}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-border shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold">Transactions</h2>
          <form method="get" className="flex items-center gap-2">
            <label htmlFor="payment-status" className="text-sm text-muted-foreground">
              Status
            </label>
            <select
              id="payment-status"
              name="status"
              defaultValue={statusFilter}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
            <button
              type="submit"
              className="rounded-md border border-input px-3 py-2 text-sm font-medium"
            >
              Apply
            </button>
          </form>
        </div>
        {visiblePayments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Service</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Method</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {visiblePayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">{payment.clientName}</td>
                    <td className="px-4 py-3">{payment.service}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(Number(payment.amount))}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {payment.method}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusClass(payment.status)}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PaymentActions id={payment.id} status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            No payments match this status.
          </div>
        )}
      </section>
    </div>
  );
}
