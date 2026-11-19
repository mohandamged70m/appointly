import Link from "next/link";
import { UserPlus } from "lucide-react";

import { getClients } from "@/lib/data/clients";
import { formatDate } from "@/lib/format";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = firstValue(params.q).trim().toLowerCase();
  const clients = await getClients();
  const filteredClients = clients.filter(
    (client) =>
      !query ||
      `${client.name} ${client.email} ${client.phone}`
        .toLowerCase()
        .includes(query),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client list and contact details.
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/80"
        >
          <UserPlus className="size-4" aria-hidden="true" />
          Add Client
        </Link>
      </header>

      <form method="get" className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={firstValue(params.q)}
          placeholder="Search clients by name, email, or phone"
          aria-label="Search clients"
          className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-3 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Search
        </button>
        {query && (
          <Link
            href="/dashboard/clients"
            className="rounded-md border border-input px-4 py-2 text-center text-sm font-medium"
          >
            Clear
          </Link>
        )}
      </form>

      <section className="overflow-hidden rounded-xl border border-border shadow-sm">
        {filteredClients.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Phone</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Appointments</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Last Visit</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{client.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{client.phone}</td>
                    <td className="px-4 py-3 font-medium">{client.totalAppointments}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {client.lastVisit ? formatDate(client.lastVisit) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          client.status === "active"
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              {query ? "No clients match your search." : "No clients yet."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
