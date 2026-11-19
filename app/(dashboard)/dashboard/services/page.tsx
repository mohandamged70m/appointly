import Link from "next/link";
import { Clock, Plus } from "lucide-react";

import { ServiceActions } from "@/components/dashboard/service-actions";
import { getServices } from "@/lib/data/services";
import { formatCurrency } from "@/lib/format";

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground">
            Manage the services you offer, pricing, and duration.
          </p>
        </div>
        <Link
          href="/dashboard/services/new"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/80"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Service
        </Link>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.length ? (
          services.map((service) => (
            <article
              key={service.id}
              className={`rounded-xl border border-border p-5 shadow-sm transition-colors hover:border-primary/50 ${
                service.active ? "" : "opacity-75"
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{service.name}</h2>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {service.description || "No description"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    service.active
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {service.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mb-4 flex items-center justify-between border-t border-border/70 pt-4">
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" aria-hidden="true" />
                  {service.duration} min
                </span>
                <span className="font-semibold">
                  {formatCurrency(Number(service.price))}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/dashboard/services/${service.id}/edit`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Edit
                </Link>
                <ServiceActions id={service.id} active={service.active} />
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No services yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
