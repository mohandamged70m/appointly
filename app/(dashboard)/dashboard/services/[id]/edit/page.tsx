import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ServiceEditForm } from "@/components/dashboard/service-edit-form";
import { getServiceById } from "@/lib/data/services";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header>
        <Link
          href="/dashboard/services"
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to services
        </Link>
        <h1 className="text-2xl font-bold">Edit Service</h1>
      </header>
      <ServiceEditForm service={service} />
    </div>
  );
}
